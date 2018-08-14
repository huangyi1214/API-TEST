import Sequelize from 'Sequelize';
import db from './db';
import { APIError, ErrorCode } from '../lib/APIError';

var Accounts = db.default.define('accounts', {
    accountID: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userID: { type: Sequelize.BIGINT },
    accountNumber: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING, defaultValue: "" },
    balance: { type: Sequelize.DECIMAL, defaultValue: 50000 },
    bonusBalance: { type: Sequelize.DECIMAL, defaultValue: 0 },
    freeze: { type: Sequelize.DECIMAL, defaultValue: 0 },
    freezeRebate: { type: Sequelize.DECIMAL, defaultValue: 0 },
    rebateRate: { type: Sequelize.DECIMAL, defaultValue: 0 },
    taxRate: { type: Sequelize.DECIMAL, defaultValue: 0 },
    takeOut: { type: Sequelize.DECIMAL, defaultValue: 0 },
    froeenMargin: { type: Sequelize.DECIMAL, defaultValue: 0 },
    enable: { type: Sequelize.INTEGER, defaultValue: 1 },
    agentRebateRate: { type: Sequelize.DECIMAL, defaultValue: 0 },
    total_trade: { type: Sequelize.DECIMAL, defaultValue: 0, },
    total_commission: { type: Sequelize.DECIMAL, defaultValue: 0 },
    lastModityTime: { type: Sequelize.DATE, defaultValue: Date.now() },
    isOpenRegistration:{type:Sequelize.BIGINT},
    isEditPassword:{type:Sequelize.BIGINT}

}, {
        createdAt: false,
        updatedAt: false,
        deletedAt: false,
        freezeTableName: true,
    });

class AccountsDal {
    constructor() {

    }
    /**
     * @method
     * @return 返回 user sequelize操作对象
     */
    get instance() {
        return Accounts;
    }
    /**
     * 根据用户ID获取资金账户
     * @method findByUserID
     * @param {string} userID 
     */
    async findByUserID(userID, password = '') {
        try {
            var param = { userID: userID };
            if (password) {
                param.password = password;
            }


            let account = await Accounts.findOne({ where: param });
            return account;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
}

export default new AccountsDal();