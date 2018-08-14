'use strict';
import captchapng from 'captchapng';
import request from 'request';
import util from 'util';
import redis from '../lib/redis';
import config from '../../config';
import utils from '../lib/utils';
import User from '../models/user';
import Account from '../models/account';
import User_hierarchy from '../models/user_hierarchy'
import Base from '../lib/base';
import { APIError, ErrorCode } from '../lib/APIError';
import log4js from '../lib/log';
const redisClient = redis.createClient({ db: 14 });
const redisClient_pay = redis.createClient({ db: 2 });
const logger = log4js.logger('oauth');
const redisClient_sendSMSCode = redis.createClient({ db: 4 });
/**
 * 
 * 
 * 接口返回对象
 * @typedef {Object} result
 * @property {ErrorCode} code - 返回码 如 0:代表成功  1000:服务端错误 2000:参数有误 等
 * @property {string} msg - 说明
 * @property {Object} data - 数据 如:{}
 */

/**
 * 用户登录、注册、授权相关接口
 * @class
 * @extends Base 
 * @classdesc 用户登录、注册、授权相关接口
 */
class OAuth extends Base {

    /**
     * @ignore
     */
    constructor() {
        super();
    }

    /**
     * GET 首页(页面)
     * @method
     */
    async index(req, res, next) {
        let pager = { username: '--', balance: '--' }
        if (req.session.user) {

            let user = req.session.user;
            let account = await Account.findByUserID(user.userID);
            pager.username = user.loginName.slice(0, 3) + "****" + user.loginName.slice(7, 11);
            pager.balance = account.balance;
            pager.userID=user.userID;
            pager.token=req.session.token;
            pager.token_pay=redisClient.getAsync(config.session_pay+ user.userID);
            pager.token_withdraw=redisClient.getAsync(config.session_withdraw + user.userID);

        }
        res.render('index', pager)
    }

    /**
    * GET 登录(页面)
    * @method 
    */
    async login_page(req, res, next) {
        logger.info('login html:',new  Date());
        res.render('login')
    }

    /**
    * GET 注册(页面)
    * @method 
    */
    async register_page(req, res, next) {
        res.render('register')
    }

    /**
     * GET忘记密码页面
     *
     */
    async forget_page(req, res, next) {
        console.log('进入忘记密码页面');
        res.render('forget')
    }

    /**
     * POST 修改密码
     *
     */

    async forget(req, res, next) {
        console.log('忘记密码接口调用');
        const loginName = req.body.loginName;
        const password = req.body.password;
        const smscode=req.body.smscode;


        let user = await User.findByName(loginName);
        if (!user) {
            console.log("用户名不存在");
            return res.error("用户名不存在", ErrorCode.ParamError)
        }
        if (user.userType != 8) {
            return res.error("用户名不存在", ErrorCode.ParamError);
        }
        let rediscode=await redisClient_sendSMSCode.getAsync(config.session_ForgetSMSCode+loginName);

        console.log('rediscode:'+rediscode+'smscode:'+smscode)
        if (rediscode!==smscode)
        {
            return res.error("验证码错误!", ErrorCode.VerifyFail);
        }

        let result = await User.FindPwd(utils.md5(password + user.encrypt), loginName);
        if (result) {

            res.success("密码修改成功!")
        } else {
            return res.error("密码修改失败!", ErrorCode.VerifyFail)
        }
    }


    /**
     * POST 重置资金密码
     *
     */

    async forgetzj(req, res, next) {

        if (req.session.user)
        {
            let user=req.session.user;

            const loginName = user.loginName;
            const password = req.body.password;
            const smscode=req.body.smscode;


            let user1 = await User.findByName(loginName);
            if (!user1) {
                console.log("用户名不存在");
                return res.error("用户名不存在", ErrorCode.ParamError)
            }
            if (user1.userType != 8) {
                return res.error("用户名不存在", ErrorCode.ParamError);
            }
            let rediscode=await redisClient_sendSMSCode.getAsync(config.session_ForgetzjSMSCode+loginName);

            if (rediscode!==smscode)
            {
                return res.error("验证码错误!", ErrorCode.VerifyFail);
            }
            let account = await Account.findByUserID(user.userID);

            if (!account)
            {
                return res.error("用户资金账户不存在", ErrorCode.ParamError);
            }
            let result = await User.changeJzPwd(utils.md5(password), account.accountID);
            if (result) {

                res.success("密码修改成功!")
            } else {
                return res.error("密码修改失败!", ErrorCode.VerifyFail)
            }
        }

    }
    /**
     * GET 获取验证码
     * 
     */
    async login_code(req, res, next) {
        const codes = req.query.p;
        try {
            if (utils.isNull(codes)) {
                res.redirect("/login");
            }
            let code = parseInt(Math.random() * 9000 + parseInt(codes));
            let newCode = code.toString();
            if (newCode.length < 4) {
                code = code + "0";
            } else if (newCode.length > 4) {
                code = newCode.substring(0, 3);
            }
            req.session.checkcode = code;
            let p = new captchapng(60, 30, code);
            p.color(0, 0, 0, 0);
            p.color(255, 255, 255, 255);
            let img = p.getBase64();
            let imgbase64 = new Buffer(img, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            res.end(imgbase64);
        } catch (e) {
            next(e);
        }
    }

    /** GET 发送验证短信  */
    async sendMsg(req, res, next) {
        let mobile = req.query.mobile;
        let user=await User.findByLoginName(mobile);
        let isExist = await User.isExist(mobile);
        if (isExist)
            return res.error("手机号已注册", ErrorCode.VerifyFail);
        let msgid =  utils.randomNumber(6);
        let  msg=utils.encodeGB2312('注册码:'+msgid+',您正在注册成为疯狂竟猜用户,感谢您的使用!【疯狂竟猜】')
        try {
            request.get(`http://api.91jianmi.com/sdk/SMS?uid=${config.msg_uid}&psw=${config.msg_pwd_md5}&cmd=send&mobiles=${mobile}&msgid=${msgid}&subid=&msg=${msg}`, function (e, r, b) {
                if (!e) {
                    if (b == "100") {
                        redisClient_sendSMSCode.set(config.session_RegisterSMSCode + mobile, msgid, 'EX', config.session_ttl_sendSMS);//设置token 缓存

                        req.session.msgid = msgid;
                        res.success("发送成功")
                    } else {
                        res.error("发送失败!" + b, ErrorCode.ParamError)
                    }
                } else {
                    next(err)
                }
            })
        } catch (e) {
            next(e)
        }

    }


    /*忘记登录密码获取验证码*/
    async sendMsgforget(req, res, next) {
        let mobile = req.query.mobile;
        let user=await User.findByLoginName(mobile);
        let isExist = await User.isExist(mobile);
        if (!isExist)
            return res.error("手机号未注册", ErrorCode.VerifyFail);
        let msgid =  utils.randomNumber(6);
        let  msg=utils.encodeGB2312('验证码:'+msgid+',您正在找回密码,感谢您的使用!【疯狂竟猜】')
        try {
            request.get(`http://api.91jianmi.com/sdk/SMS?uid=${config.msg_uid}&psw=${config.msg_pwd_md5}&cmd=send&mobiles=${mobile}&msgid=${msgid}&subid=&msg=${msg}`, function (e, r, b) {
                if (!e) {
                    if (b == "100") {
                        redisClient_sendSMSCode.set(config.session_ForgetSMSCode + mobile, msgid, 'EX', config.session_ttl_sendSMS);//设置token 缓存

                        req.session.msgid = msgid;
                        res.success("发送成功")
                    } else {
                        res.error("发送失败!" + b, ErrorCode.ParamError)
                    }
                } else {
                    next(err)
                }
            })
        } catch (e) {
            next(e)
        }

    }


    async sendMsgforgetzj(req, res, next) {
        if (req.session.user)
        {
            let mobile = req.session.user.loginName;
            let user=await User.findByLoginName(mobile);
            let isExist = await User.isExist(mobile);
            if (!isExist)
                return res.error("手机号未注册", ErrorCode.VerifyFail);
            let msgid =  utils.randomNumber(6);
             let  msg=utils.encodeGB2312('验证码:'+msgid+',您正在找回资金密码,感谢您的使用!【疯狂竟猜】')
            //res.success("发送成功");
            try {
                request.get(`http://api.91jianmi.com/sdk/SMS?uid=${config.msg_uid}&psw=${config.msg_pwd_md5}&cmd=send&mobiles=${mobile}&msgid=${msgid}&subid=&msg=${msg}`, function (e, r, b) {
                    if (!e) {
                        if (b == "100") {
                            redisClient_sendSMSCode.set(config.session_ForgetzjSMSCode + mobile, msgid, 'EX', config.session_ttl_sendSMS);//设置token 缓存

                            req.session.msgid = msgid;
                            res.success("发送成功")
                        } else {
                            res.error("发送失败!" + b, ErrorCode.ParamError)
                        }
                    } else {
                        next(err)
                    }
                })
            } catch (e) {
                next(e)
            }
        }

    }



    /**
     * POST 用户登录接口 
     * @memberof OAuth
     * @method login 用户登录接口
     * @readonly
     * @param {string} username -账户
     * @param {string} password -密码
     * @return {result}
     */
    async login(req, res, next) {


        const username = req.body.username;
        const password = req.body.password;
        const code = req.body.code;
        try {
            if (utils.isNull(code)) {
                return res.error("验证码不能为空", ErrorCode.VerifyFail);
            }
            if (code != req.session.checkcode) {
                return res.error("验证码输入错误", ErrorCode.VerifyFail);
            }
            if (utils.isNull(username) || utils.isNull(password)) {
                return res.error("用户名或密码不能为空", ErrorCode.ParamError);
            }
            let user = await User.findByName(username);
            if (!user) {
                return res.error("用户名不存在", ErrorCode.ParamError)
            }
            if (user.userType != 8) {
                return res.error("用户名不存在", ErrorCode.ParamError);
            }
            user = await User.findByName(username, utils.md5(password + user.encrypt));
            if (!user)
                return res.error("用户名或密码错误", ErrorCode.ParamError);
            if (user.status == 0)
                return res.error("用户已禁用", ErrorCode.VerifyFail);
            if (user.status == 2)
                return res.error("用户已注销", ErrorCode.VerifyFail);

            let token = utils.md5(user.userID + Date.now().toString())

            let sign_token = await redisClient.getAsync(config.session_token_prefix + user.userID);
            if (config.only_sign) {
                //唯一登录
                if (!utils.isNull(sign_token)) {
                    let result = await redisClient.delAsync(config.session_user_prefix + sign_token);
                }
            } else {
                if (!utils.isNull(sign_token)) {
                    token = sign_token;
                }
            }
            redisClient.set(config.session_token_prefix + user.userID, token, 'EX', config.session_ttl);//设置token 缓存
            let ses_user = {
                lastLoginTime: utils.getCurDateFormat(),
                loginIp: utils.getClientIp(req),
                username: user.loginName,
                name: user.loginName,
                usertype: user.userType,
                userID: user.userID,
                password: user.password,
                encrypt: user.encrypt,
                onDevice: 1,
            };
            redisClient.set(config.session_user_prefix + token, JSON.stringify(ses_user), 'EX', config.session_ttl); //设置用户缓存
            req.session.user = user;
            req.session.token = token;
            req.session.checkcode = null;
            res.success("登录成功", { token: token })
        } catch (e) {
            next(e);
        }

    }

    /**
     * POST 用户注册 
     * @method register
     * @memberof OAuth
     * @param {string} mobile -手机号
     * @param {string} msgcode -短信验证码
     * @param {string} password -密码
     * @param {string} upper -邀请码/经纪人
     * @return {result}
     */
    async register(req, res, next) {
        try {
            let ip = utils.getClientIp(req);
            //获取参数
            let { mobile, msgcode, password, upper } = req.body;
            //验证
            if (utils.isNull(mobile))
                return res.error("手机号不能为空", ErrorCode.ParamError)
            if (utils.isNull(msgcode)){
                return res.error("验证码不能为空", ErrorCode.ParamError)
            }else{
                if(!req.session.msgid){
                    return res.error("请先获取验证码!",ErrorCode.ParamError)
                }else{

                    let rediscode=await redisClient_sendSMSCode.getAsync(config.session_RegisterSMSCode+mobile);


                    console.log('code:'+rediscode);

                    if(rediscode!==msgcode){
                       return res.error("验证码有误",ErrorCode.ParamError)
                    }
                }
            }
            if (utils.isNull(password))
                return res.error("密码不能为空", ErrorCode.ParamError)
            if (utils.isNull(upper))
                return res.error("邀请码不能为空", ErrorCode.ParamError)
                

            let isExist = await User.isExist(mobile);
            if (isExist)
                return res.error("手机号已注册", ErrorCode.VerifyFail);

            let upperUser = await User.findByUseID(upper);
            if (!upperUser) {
                upperUser = await User.findByName(upper)
                if (!upperUser) {
                    return res.error("邀请码有误", ErrorCode.VerifyFail);
                }
            }
            let OpenRegistration=await User.getisOpenRegistration(upper);
            console.log('是否开启注册：'+JSON.stringify(OpenRegistration));
            if (OpenRegistration[0].isOpenRegistration=="0")
            {
                return res.error("直属上级未开启注册", ErrorCode.VerifyFail);
            }
            switch (upperUser.userType) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 9:
                case 10:
                    return res.error("邀请码有误", ErrorCode.VerifyFail);
                    break;
            }
            let encrypt = utils.randomLetter(6);
            let password_md5 = utils.md5(password + encrypt);
            let curTime = utils.getCurDateFormat();
            console.log(curTime)
            let user = {
                loginName: mobile,
                name: mobile,
                password: password_md5,
                encrypt: encrypt,
                pid: upperUser.userID,
                pusername: upperUser.loginName,
                createUser: '',
                mobile: mobile,
                createTime: curTime,
                updateTime: curTime
            };

            let admin = {
                username: mobile,
                name: mobile,
                password: password_md5,
                encrypt: encrypt,
                createUser: '',
                lastloginip: ip,
                createTime: curTime,
                updateTime: curTime,
                lastlogintime: curTime
            }
            let now = new Date();
            let month = now.getMonth() + 1;
            let date = now.getDate();
            let account = {
                accountNumber: now.getFullYear().toString() + (month.length > 1 ? month : '0' + month).toString() + (date.toString().length > 1 ? date : '0' + date).toString(),
                password: utils.md5('188398')
            }

            //获取上级层级
            let levels = await User_hierarchy.getListByUserID(upperUser.userID);
            if (levels == null || levels.length < 0)
                return res.error("直属经纪有误")

            let list_levels = [];
            let firstlevel = levels[0];
            //添加直属层级
            list_levels.push({
                parentID: firstlevel.userID,
                userType: 8,
                parentLevel: 1,
                parentUser: upperUser.loginName,
                parentType: firstlevel.userType
            })
            //设置直接所属
            switch (firstlevel.userType) {
                case 2:
                    user.nationalCenterUser = upperUser.loginName;
                    break;
                case 3:
                    user.centerUser = upperUser.loginName;
                    break;
                case 4:
                    user.comprehensiveUser = upperUser.loginName;
                    user.memberID = upperUser.userID;
                    break;
                case 5:
                    user.agentVipUser = upperUser.loginName;
                    break;
                case 6:
                    user.proxyUser = upperUser.loginName;
                    break;
                case 7:
                    user.businessUser = upperUser.loginName;
                    break;
                case 8:
                    user.oneAgentUser = upperUser.loginName;
                    break;
            }

            let i = 1;
            for (let j = 0; j < levels.length; j++) {
                let level = levels[j];
                switch (level.parentType) {
                    case 2:
                        user.nationalCenterUser = level.parentUser;
                        break;
                    case 3:
                        user.centerUser = level.parentUser;
                        break;
                    case 4:
                        user.comprehensiveUser = level.parentUser;
                        user.memberID = (await User.findByName(level.parentUser)).userID;
                        break;
                    case 5:
                        user.agentVipUser = level.parentUser;
                        break;
                    case 6:
                        user.proxyUser = level.parentUser;
                        break;
                    case 7:
                        user.businessUser = level.parentUser;
                        break;
                    case 8:
                        i++;
                        switch (i) {
                            case 2:
                                user.twoAgentUser = level.parentUser;
                                break;
                            case 3:
                                user.threeAgentUser = level.parentUser;
                                break;
                            case 4:
                                user.fourAgentUser = level.parentUser;
                                break;
                            case 5:
                                user.fiveAgentUser = level.parentUser;
                                break;
                        }
                        break;
                }
                list_levels.push({
                    parentID: level.parentID,
                    userType: 8,
                    parentLevel: level.parentLevel + 1,
                    parentUser: level.parentUser,
                    parentType: level.parentType
                })
            }
            let result = await User.register(user, admin, account, list_levels);
            if (result) {

                //await 异步语法

                //user = await User.findByLoginName(mobile);
                // let token = utils.md5(user.userID + Date.now().toString())
                // redisClient.set(config.session_token_prefix + user.userID, token, 'EX', config.session_ttl);//设置token 缓存
                // redisClient.set(config.session_user_prefix + token, JSON.stringify(user), 'EX', config.session_ttl); //设置用户缓存
                // req.session.user = user;
                // req.session.token = token;
                req.session.msgid=null;
                res.success("注册成功!", {})
            } else {
                return res.error("注册失败!", ErrorCode.VerifyFail)
            }
        } catch (e) {
            next(e);
        }
    }

    /**
     * POST 退出登录
     * @method logout
     */
    async logout(req, res, next) {
        let user=req.session.user;
        console.log('req.session.token:'+config.session_token_prefix+req.session.token);

        let result = await redisClient.delAsync(config.session_user_prefix+req.session.token);

        let result1 = await redisClient.delAsync(config.session_token_prefix+user.userID);

        req.session.user = null;

        res.success("成功退出")
    }



    /** GET 入金 */
    async Recharge(req, res, next) {

        try {
            let user=req.session.user;
            let token = utils.md5(user.userID + Date.now().toString());
            redisClient_pay.set(config.session_pay + user.userID, token, 'EX', config.session_ttl_pay);//设置token 缓存
            let r_value={};
            r_value.userID=user.userID;
            r_value.token=token;
            res.success('入金成功',r_value);

        } catch (e) {
            next(e)
        }
    }


        /** POST 出金 */
        async Withdraw(req, res, next) {
            let user=req.session.user;
            let password=req.body.password;
            let price=req.body.price;
            let presentid=req.body.presentid;


            console.log('资金密码：'+utils.md5(password)+'password:'+password);

            let account=await Account.findByUserID(user.userID,utils.md5(password));
            if (!account)
            {
                res.error("资金密码错误!", ErrorCode.ParamError)
            }
            let balance=account.balance;
            //定义出金缓存
            let token = utils.md5(user.userID + Date.now().toString());

            try {
                // redisClient_pay.set(config.session_withdraw + user.userID, token, 'EX', config.session_ttl_withdraw);//设置token 缓存
                redisClient_pay.set(config.session_withdraw + user.userID, token, 'EX', config.session_ttl_pay);//设置token 缓存


                console.log('调用出金接口开始：'+config.pay_server+`index.php?m=Api&c=withdraw&a=payto&userID=${user.userID}&orderid=${presentid}&token=${token}&password=${password}`);
                request.get(config.pay_server+`index.php?m=Api&c=withdraw&a=payto&userID=${user.userID}&orderid=${presentid}&token=${token}&password=${password}`, function (e, r, pay_body) {
                    console.log('调用出金接口完成');
                    if (!e) {

                        console.log('兑换：'+pay_body);

                        if (JSON.parse(pay_body).code=='00')
                        {
                            console.log('开始发送兑换码:'+JSON.parse(pay_body).data);
                            let mobile=user.loginName;

                            let msgid = req.session.msgid ? req.session.msgid : utils.randomNumber(6);

                            let  msg=utils.encodeGB2312('兑换成功，你的兑换码为'+JSON.parse(pay_body).data+',感谢您的使用!【疯狂竟猜】');
                            console.log('发送短息接口'+`http://api.91jianmi.com/sdk/SMS?uid=${config.msg_uid}&psw=${config.msg_pwd_md5}&cmd=send&mobiles=${mobile}&msgid=${msgid}&subid=&msg=${msg}`);
                            try {
                                request.get(`http://api.91jianmi.com/sdk/SMS?uid=${config.msg_uid}&psw=${config.msg_pwd_md5}&cmd=send&mobiles=${mobile}&msgid=${msgid}&subid=&msg=${msg}`, function (e, r, b) {
                                    console.log('发送短息验证码完成'+b);
                                    if (!e) {

                                        if (b == "100") {
                                            req.session.msgid = msgid;
                                            res.success("兑换成功")
                                        } else {
                                            res.error("兑换失败!" + b, ErrorCode.ParamError)
                                        }
                                    } else {
                                        next(err)
                                    }
                                })
                            } catch (e) {
                                next(e)
                            }
                        }
                        else
                        {
                            res.send(pay_body);
                        }

                    } else {
                        next(err)
                    }

                })
            } catch (e) {
                next(e)
            }

        //
        // let mobile = req.query.mobile;
        // let user=await User.findByLoginName(mobile);
        // let isExist = await User.isExist(mobile);
        // if (isExist)
        //     return res.error("手机号已注册", ErrorCode.VerifyFail);
        // let msgid = req.session.msgid ? req.session.msgid : utils.randomNumber(6);
        // let  msg=utils.encodeGB2312('注册码'+msgid+',您正在注册成为疯狂竟猜用户,感谢您的使用!【疯狂竟猜】')

    }

    /**
     * GET 礼品列表
     * @memberof Proxy
     * @method brokerageDetail
     * @return {result}
     */
    async getpresent(req, res, next) {
        // let userID = req.session.user.userID;
        try {
            let getpresentlist= await User.getpresent();
            res.success("获取成功", getpresentlist);
        } catch (e) {
            next(e);
        }
    }
    /**
     * GET 兑换列表
     * @memberof Proxy
     * @method brokerageDetail
     * @return {result}
     */
    async getexchangerecord(req, res, next) {
        let userID = req.session.user.userID;
        try {
            let getexchangelist= await User.getexchangerecord(userID);
            res.success("获取成功", getexchangelist);
        } catch (e) {
            next(e);
        }
    }
}

export default new OAuth();