import Sequelize from 'Sequelize';
import db from './db';
import { APIError, ErrorCode } from '../lib/APIError';

const Lottery = db.history.define("lottery", {
    ID: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: Sequelize.STRING
    },
    time: { type: Sequelize.DATE },
    price: { type: Sequelize.DATE },
}, {
        createdAt: false,
        updatedAt: false,
        deletedAt: false,
        freezeTableName: true
    });


/**
 * @class
 * @classdesc 开奖记录相关操作
 */
class LotteryDal {
    constructor() {

    }
    /**
    * 获取最近5条开奖记录
    * @method findRecentlyRow
    * @param {ILst}
    */
    async findRecentlyRow() {
        try {
            let sql = `SELECT DATE_FORMAT(Time,'%Y%m%d%H%i%s') time ,price FROM lottery ORDER BY Time DESC LIMIT 5 `;
            let list = await db.history.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取最近15条开奖记录
    * @method findRecently10Row
    * @param {ILst}
    */
    async findRecently15Row() {
        try {
            let sql = ` SELECT DATE_FORMAT(Time,'%Y%m%d%H%i%s') time ,price FROM lottery ORDER BY Time DESC LIMIT 15 `;
            let list = await db.history.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
}

export default new LotteryDal();