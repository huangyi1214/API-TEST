import Sequelize from 'Sequelize';
import db from './db';
import Admin from "./admin";
import Account from "./account";
import Capitalaccount from "./capitalaccount";
import User_hierarchy from "./user_hierarchy";
import { APIError, ErrorCode } from '../lib/APIError';
import log4js from '../lib/log';
const logger = log4js.logger('usermodal');

/**User Model */
const User = db.default.define("user", {
    userID: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    loginName: {
        type: Sequelize.STRING,
        unique: true
    },
    name: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    encrypt: { type: Sequelize.STRING },
    //交易账号状态 0-冻结,1-正常,2-销户
    status: { type: Sequelize.INTEGER, defaultValue: 1 },
    //0 交易所,1 特别会员,2 全国运营中心,3 运营中心 ,4 综合会员,5 经纪会员，6 机构代理 ,7 居间商,8 经纪人
    userType: { type: Sequelize.INTEGER, defaultValue: 8 },
    pid: { type: Sequelize.INTEGER, defaultValue: 0 },
    pusername: { type: Sequelize.STRING, defaultValue: '' },
    nationalCenterUser: { type: Sequelize.STRING, defaultValue: '' },
    comprehensiveUser: { type: Sequelize.STRING, defaultValue: '' },
    agentVipUser: { type: Sequelize.STRING, defaultValue: '' },
    proxyUser: { type: Sequelize.STRING, defaultValue: '' },
    businessUser: { type: Sequelize.STRING, defaultValue: '' },
    centerUser: { type: Sequelize.STRING, defaultValue: '' },
    memberID: { type: Sequelize.BIGINT, defaultValue: 0 },
    //所属的风控组别:1为标准，2为高风险',
    riskGroupID: { type: Sequelize.INTEGER, defaultValue: 1 },
    singleThrowID: { type: Sequelize.INTEGER, defaultValue: 0 },
    oneAgentUser: { type: Sequelize.STRING, defaultValue: '' },
    twoAgentUser: { type: Sequelize.STRING, defaultValue: '' },
    threeAgentUser: { type: Sequelize.STRING, defaultValue: '' },
    fourAgentUser: { type: Sequelize.STRING, defaultValue: '' },
    fiveAgentUser: { type: Sequelize.STRING, defaultValue: '' },
    companyName: { type: Sequelize.STRING, defaultValue: '' },
    contactPerson: { type: Sequelize.STRING, defaultValue: '' },
    certificatesCode: { type: Sequelize.STRING, defaultValue: '' },
    certificatesType: { type: Sequelize.INTEGER, defaultValue: 0 },
    headimgurl: { type: Sequelize.STRING, defaultValue: '' },
    mobile: { type: Sequelize.STRING, defaultValue: '' },
    phone: { type: Sequelize.STRING, defaultValue: '' },
    email: { type: Sequelize.STRING, defaultValue: '' },
    sex: { type: Sequelize.INTEGER, defaultValue: 0 },
    country: { type: Sequelize.STRING, defaultValue: '' },
    province: { type: Sequelize.STRING, defaultValue: '' },
    city: { type: Sequelize.STRING, defaultValue: '' },
    address: { type: Sequelize.STRING, defaultValue: '' },
    remark: { type: Sequelize.STRING, defaultValue: '' },
    blackOrWhiteStatus: { type: Sequelize.INTEGER },
    createUser: { type: Sequelize.STRING, defaultValue: '' },
    createTime: { type: Sequelize.STRING, defaultValue: '' },
    updateUser: { type: Sequelize.STRING, defaultValue: '' },
    updateTime: { type: Sequelize.STRING, defaultValue:'' }

}, {
        createdAt: false,
        updatedAt: false,
        deletedAt: false,
        freezeTableName: true,
    });

/**
 * @class 
 * @classdesc 用户相关操作
 */
class UserDal {
    constructor() {
    }

    /**
     * @method
     * @return 返回 user sequelize操作对象
     */
    get instance() {
        return User;
    }

    /**
     * 注册
     * @method
     * @return {number}
     * @param {Object} user
     * @param {Object} admin
     * @param {Object} account
     * @param {IList} list_levels
     */
    async register(_user, _admin, _account, _list_levels) {
        var _capitalaccount = {};

        //创建事务
        let t = await db.default.transaction();
        try {
            //1.创建用户
            let user = await User.create(_user, { transaction: t });
            //2.创建admin
            _admin.userID = user.userID;
            let admin = await Admin.instance.create(_admin, { transaction: t });
            //3.创建账户
            _account.userID = user.userID;
            let account = await Account.instance.create(_account, { transaction: t });
            //4.创建资金账户
            _capitalaccount.userID = user.userID;
            _capitalaccount.accountID = account.accountID;
            let capitalaccount = await Capitalaccount.instance.create(_capitalaccount, { transaction: t });
            //5.创建层级
            for (let level of _list_levels) {
                level.userID = user.userID;
            }
            await User_hierarchy.instance.bulkCreate(_list_levels, { transaction: t });
            t.commit();//提交
            return true;
        } catch (e) {
            console.log(e.message);
            t.rollback();//回滚
            return false;
        }
    }

    /**
     * 根据用户名或用户名与密码查找用户
     * @method 
     * @param {string} username 
     * @param {string} password 
     */
    async findByName(username, password = '') {
        try {
            var param = { loginName: username };
            if (password) {
                param.password = password;
            }
            let user = await User.findOne({ where: param });
            return user;
            // logger.info("find:"+username);
            // if(password)
            // {
            //     let sql = `SELECT * FROM user where loginName=$1 and password=$2 ` ;
            //     let user = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [username,password] })
            //     return user;
            // }else{
            //     let sql = `SELECT * FROM user where loginName=$1` ;
            //     let user = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [username] })
            //     return user;
            // }

        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    async findByLoginName(username) {
        try {
            let sql = `SELECT * FROM user where loginName=$1`;
            let user = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [username] })
            return user[0];
        }
        catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**根据用户ID查找用户 */
    async findByUseID(userID) {
        try {
            var param = { userID: userID };
            let user = await User.findOne({ where: param });
            return user;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 判断用户是否已存在
     * @method 
     * @param {string} username -用户名/手机号
     */
    async isExist(username) {
        try {
            let user = await User.findOne({ where: { loginName: username } })
            if (user != null)
                return true
            else
                return false;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError)
        }
    }


    /**
     * 获取用户的推广客户数
     * @param {string} userID -用户账号
     * @return {IList} 
     */
    async getLowerAgent(userID) {
        try {
            let sql = ` SELECT parentID userID,
                        sum(CASE parentLevel when 1 THEN 1 else 0 end) level1,
                        sum(CASE parentLevel when 2 THEN 1 else 0 end) level2,
                        sum(CASE parentLevel when 3 THEN 1 else 0 end) level3,
                        sum(CASE parentLevel when 4 THEN 1 else 0 end) level4,
                        sum(CASE parentLevel when 5 THEN 1 else 0 end) level5,
                        sum(CASE parentLevel when 6 THEN 1 else 0 end) level6 
                        FROM user_hierarchy where parentID=$1 and parentLevel!=0 `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] })
            return list;
        }
        catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
  * 获取用户的总推广客户数
  * @param {string} userID -用户账号
  * @return {IList} 
  */
    async getLowerSumAgent(userID) {
        try {
            let sql = `SELECT count(1) num FROM user_hierarchy where parentID=$1 and parentLevel!=0`;
            let num = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] })
            return num ? num[0].num ? num[0].num : 0 : 0;
        }
        catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
    /**
     * 获取所有下级客户竟猜总金额
     * @param {*} userID -用户账号
     */
    async getOrderAmount(userID) {
        try {
            let sql = ` SELECT SUM(amount) amount FROM order_detail 
                        WHERE userID IN(SELECT userID FROM user_hierarchy
                        where parentID=$1 and parentLevel!=0)`;
            let amount = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return amount ? amount[0].amount ? amount[0].amount : 0 : 0;
        }
        catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 获取今日佣金
     * @param {string} userID 用户账号
     * @return {number} 佣金金额
     */
    async getBrokerageToday(userID) {
        try {
            let sql = ` SELECT sum(amount) amount FROM  capital_flow WHERE 
                        userID=$1 AND type in(26,27,28,29,30) 
                        AND DATE_FORMAT(changeTime,'%Y%m%d')=DATE_FORMAT(now(),'%Y%m%d') `;
            let amount = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return amount ? amount[0].amount ? amount[0].amount : 0 : 0;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 获取总佣金
     * @param {string} userID 用户账号
     * @return {number} 佣金金额
     */
    async getBrokerageSum(userID) {
        try {
            let sql = ` SELECT sum(amount) amount FROM  capital_flow WHERE 
                        userID=$1 AND type in(26,27,28,29,30)`;
            let amount = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return amount ? amount[0].amount ? amount[0].amount : 0 : 0;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 获取佣金明细 最近10条
     * @param {string} userID 用户账号
     * @return {IList}
     */
    async getBrokerageDetail(userID) {
        try {
            let sql = `  SELECT DATE_FORMAT(cf.changeTime,'%Y-%m-%d') date,od.userID userID,od.amount ,cf.amount brokerage  FROM 
                        capital_flow cf LEFT JOIN  order_detail od on cf.externalID=CONCAT(od.orderNo,od.orderDetailID) WHERE 
                        cf.userID=$1 AND cf.type in(26,27,28,29,30) ORDER BY cf.changeTime desc limit 10 `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 获取竟猜记录
     * @param {string} userID 用户账号
    *  @return {IList}
     */
    async getOrderDetails(userID) {
        try {
            let sql = `SELECT DATE_FORMAT(currentTime,'%Y%m%d%H%i%s') time,currentRate price,amount,profit FROM order_detail 
                        WHERE userID=$1 ORDER BY currentTime DESC LIMIT 10 `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取资金明细
    * @param {string} userID 用户账号
    * @return {IList}
    */
    async getCaptialFlow(userID) {
        try {
            let sql = `  SELECT DATE_FORMAT(changeTime,'%Y%m%d%H%i') date,externalID,amount FROM capital_flow 
                        where userID=$1 AND type in(8,9) ORDER BY changeTime DESC  LIMIT 10 `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 修改登录密码
    * @param {string} userID 用户账号
    * @param {string} password 登录密码
    * @param {boolean}
    */
    async changePwd(password, userID) {
        try {
            let sql = 'UPDATE `user` SET password=$1 where userID=$2';
            let result = db.default.query(sql, { type: Sequelize.QueryTypes.UPDATE, bind: [password, userID] });
            return result ? true : false;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }


    /**
     * 修改登录密码
     * @param {string} userID 用户账号
     * @param {string} password 登录密码
     * @param {boolean}
     */
    async FindPwd(password, loginName) {
        try {
            console.log('修改密码SQL');
            let sql = 'UPDATE `user` SET password=$1 where loginName=$2';
            let result = db.default.query(sql, { type: Sequelize.QueryTypes.UPDATE, bind: [password, loginName] });
            return result ? true : false;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }



    /**
    * 修改资金密码
    * @param {string} userID 用户账号
    * @param {string} password 资金密码
    * @param {boolean}
    */
    async changeJzPwd(password, userID) {
        try {
            let sql = `UPDATE accounts SET password=$1,isEditPassword=1 where accountID=$2`;
            let result = db.default.query(sql, { type: Sequelize.QueryTypes.UPDATE, bind: [password, userID] });
            return result ? true : false;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取活动公告列表
    */
    async getNoticeList() {
        try {
            let sql = `SELECT articalID,title,DATE_FORMAT(articalTime,'%Y-%m-%d') 
            articalTime FROM artical where enable=1 order by listorder,articalTime`;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取活动公告详情
    * @param {*} articalID 公告ID
    */
    async getNoticeDetail(articalID) {
        try {
            let sql = ` SELECT title,content,DATE_FORMAT(articalTime,'%Y-%m-%d') articalTime,si.imageUrl 
                    from artical a LEFT JOIN system_image si on a.imageID=si.id 
                    where articalID=$1`;
            let details = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [articalID] });
            return details ? details[0] : {};
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 获取礼品明细
     * @param {string} userID 用户账号
     * @return {IList}
     */
    async getpresent() {
        try {
            let sql = `  SELECT present.id,presentCode,presentName,presentPrice,consumeGold,imageId,presentIndex,system_image.thumbnailUrl 
                            FROM present 
                            left join system_image on present.imageId=system_image.id  
                            where isVisible=0 order by presentIndex; `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }


    /**
     * 兑换记录插入
     * @param {string} userID 用户账号
     * @return {IList}
     */
    async exchangerecordadd(userID,presentID) {
        try {

            let sql = `  INSERT INTO fkjc.exchangerecord (userID,presentID,createTime)VALUES($1,$2,now()); `;
            let result = await db.default.query(sql, { type: Sequelize.QueryTypes.INSERT,bind:[userID,presentID] });
            return result ? true : false;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
    /**
     * 获取兑换记录明细
     * @param {string} userID 用户账号
     * @return {IList}
     */
    async getexchangerecord(userID) {
        try {
            let sql = `  SELECT userID,DATE_FORMAT(requestTime,'%Y-%m-%d') as requestTime,orderID,present.presentCode,present.presentName,present.presentPrice,present.consumeGold
                        FROM withdraw left join present on withdraw.orderID=present.id
                        where userID=$1 order by requestTime desc limit 10; `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT,bind: [userID] });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
    /**
     * 获取邀请码是否开启注册
     * @param {string} userID 用户账号
     * @return {IList}
     */
    async getisOpenRegistration(userID) {
        try {
            let sql = `  select accounts.userID,accounts.isOpenRegistration 
                         from accounts left join user on accounts.userID=user.userid where accounts.userID=$1`;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
}

export default new UserDal();