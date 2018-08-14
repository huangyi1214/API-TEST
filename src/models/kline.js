import Sequelize from 'Sequelize';
import db from './db';
import { APIError, ErrorCode } from '../lib/APIError';


const Lline = db.history.define("btc_1minkline", {
    ID: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    time: {type: Sequelize.DATE},
    high: {type: Sequelize.STRING},
    low: {type: Sequelize.STRING},
    open: {type: Sequelize.STRING},
    close: {type: Sequelize.STRING},
},{
    createdAt:false,
    updatedAt:false,
    deletedAt:false,
    freezeTableName: true
});

/**
 * @class
 * @classdesc K线数据相关操作
 */
class KlineDal {
    constructor() {

    }
    /**
    * 获取K线图表数据(间隔一分钟)
    * @method getKline1minList
    * @param {ILst}
    */
    async getKline1minList() {
        try {
            let sql = `SELECT DATE_FORMAT(time,'%H:%i') date,open,close,low,high FROM btc_1minkline ORDER BY Time DESC LIMIT 30  `;
            let list = await db.history.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }

    /**
    * 获取K线图表数据(间隔30分钟)
    * @method getKline30minList
    * @param {ILst}
    */
    async getKline30minList() {
        try {
            let sql = ` SELECT DATE_FORMAT(time,'%H:%i') date,open,close,low,high FROM btc_30minkline ORDER BY Time DESC LIMIT 30  `;
            let list = await db.history.query(sql, { type: Sequelize.QueryTypes.SELECT });
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
}

export default new KlineDal();