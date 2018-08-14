import Sequelize from 'Sequelize';
import db from './db';
import { APIError, ErrorCode } from '../lib/APIError';
import utils from '../lib/utils'

/**
 * @class
 * @classdesc 订单相关操作
 */
class OrderDal {
    /**
     * @constructor
     */
    constructor() {

    }

    /**
     * 获取竟猜榜单前十位
     * @method getRankingList
     * @param {ILst}
     */
    async getRankingList() {
        try {
            let sql = `SELECT u.loginName username,a.profit from user u right JOIN ( SELECT userID,SUM(profit) AS profit 
            FROM order_detail WHERE profit>0 GROUP BY userID ORDER BY profit DESC LIMIT 10 ) a on u.userID=a.userID `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取本月中奖次数
    * @method getWinningNum
    * @param {string} userID -用户账号
    * @param {number}
    */
    async getWinningNum(userID) {
        try {
            let sql = `SELECT COUNT(*) winingNum FROM order_detail WHERE 
                  DATE_FORMAT(currentTime,'%Y-%m')=DATE_FORMAT(now(),'%Y-%m')
                  AND profit>0 and userID=$1`;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return list ? list[0] ? list[0].winingNum : 0 : 0;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取本月排名
    * @method getWinningRanking
    * @param {string} userID -用户账号
    * @param {number}
    */
    async getWinningRanking(userID) {
        try {
            let sql = ` SELECT ranking FROM( 
                        SELECT  @rownum:=@rownum+1 AS ranking,a.userID,a.profit FROM ( 
                        SELECT userID,sum(profit) as profit FROM order_detail WHERE DATE_FORMAT(currentTime,'%Y-%m')=DATE_FORMAT(now(),'%Y-%m')
                        GROUP BY userID  ORDER BY profit DESC) a,(SELECT @rownum:=0) r
                        ) b WHERE userID=$1`;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] });
            return list ? list[0].ranking : "";
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
     * 获取本期中奖金额
     * @method getWiningAmount
     * @param {*} userID 
     */
    async getWiningAmount(userID) {
        try {
            let sql = `SELECT SUM(profit) as num FROM order_detail where DATE_FORMAT(currentTime,'%Y%m%d%H%i%s')=$2  
           and userID=$1`;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID,utils.getCurDatefornew()] })
            return list[0].num ? list[0].num : 0;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }


    /**
     * 判断是否有未结算的订单
     * @method getWiningAmount
     * @param {*} userID
     * @return 0biaoshi
     */
    async getcountorderwithopen(userID) {
        try {
            let sql = `SELECT COUNT(*) AS num FROM order_detail where DATE_FORMAT(currentTime,'%Y%m%d%H%i%s')=$2  
           and userID=$1 and STATUS=$3 `;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID,utils.getCurDatefornew(),'open'] })
            let num=list[0].num ? list[0].num : 0;
            return num>0 ? true:false;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

}

export default new OrderDal();