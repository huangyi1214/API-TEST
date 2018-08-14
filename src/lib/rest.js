import redis from './redis';
import log4js from './log';
import config from '../../config';
import utils from '../lib/utils';
import { APIError, ErrorCode } from '../lib/APIError';
const redisClient = redis.createClient({ db: 14 });
const logger = log4js.logger('rest');

class Rest {
    constructor() {

    }

    /**token 验证 */
    async filter(req, res, next) {

        /**
         * token 验证
        */
        // if (req.path != "/api/login") {
        //let token = req.headers.token;
        // if (token == "null" || !token) {
        //     return res.json({ code: ErrorCode.TokenLoss, msg: "缺少访问令牌" })
        // }
        // try {
        //     const session = await redisClient.getAsync(config.session_user_prefix + token);
        //     if (!session) {
        //         return res.json({ code: ErrorCode.TokenError, msg: "访问令牌已过期或不存在,请重新登录!" })
        //     }
        //     req.session=JSON.parse(session);
        // } catch (e) {
        //     logger.error(e.message + "\n" + e.stack);
        //     throw new Error(e.message)
        // }
        //}

        if (!req.session.user && req.path != "/login" && req.path != "/register" && req.path != "/code" && req.path != "/forget"&& req.path != "/ewm"&& req.path != "/sendMsg" && req.path != "/getpresent" && req.path!="/sendMsgforget" && req.path!="/settimeouttest") {
            return res.redirect("/login");
        } else {
            if (req.path != "/login" && req.path != "/code" && req.path != "/register" && req.path != "/forget"&& req.path != "/ewm"&& req.path != "/sendMsg"&& req.path != "/getpresent" && req.path!="/sendMsgforget" && req.path!="/settimeouttest") {
                let token = req.session.token;
                if (token == "null" || !token) {
                    if (req.xhr)
                        return res.json({ code: ErrorCode.TokenLoss, msg: "缺少访问令牌" })
                    else
                        return res.redirect("/login");
                }
                try {
                    const session = await redisClient.getAsync(config.session_user_prefix + token);
                    if (!session) {
                        if (req.xhr)
                            return res.json({ code: ErrorCode.TokenError, msg: "访问令牌已过期或不存在,请重新登录!" })
                        else
                            return res.redirect("/login");
                    }
                    else
                    {
                        if (req.session.user)
                        {
                            let user=req.session.user;
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

                        }

                    }
                } catch (e) {
                    logger.error(e.message + "\n" + e.stack);
                    throw new Error(e.message)
                }
            }

        }


        /**
         * 绑定返回成功信息的方法
         */
        res.success = function (msg = '', data = {}) {
            res.json({
                data: data,
                msg: msg,
                code: 0
            })
        }

        /**
         * 绑定返回错误信息的方法
         */
        res.error = function (msg = '服务端异常', code = ErrorCode.SystemError) {
            res.json({
                code: code,
                msg: msg
            })
        }


        next();
    }
}
export default new Rest();