import Sequelize from 'Sequelize';
import db from './db';
import { APIError, ErrorCode } from '../lib/APIError';

const User_hierarchy = db.default.define('user_hierarchy', {
    hierarchyID: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userID: { type: Sequelize.STRING },
    parentID: { type: Sequelize.BIGINT },
    userType: { type: Sequelize.INTEGER },
    parentType: { type: Sequelize.INTEGER },
    parentLevel: { type: Sequelize.INTEGER },
    parentUser: { type: Sequelize.STRING }
}, {
        createdAt: false,
        updatedAt: false,
        deletedAt: false,
        freezeTableName: true,
    });

/**
* @class 
* @classdesc 用户层级相关操作
*/
class User_hierarchyDal {
    constructor() {

    }
    /**
    * @method
    * @return 返回 user_hierarchy sequelize操作对象
    */
    get instance() {
        return User_hierarchy;
    }
    /**
    * 根据userID获取层级
    * @param {string} userID -用户账号
    * @return {IList} 
    */
    async getListByUserID(userID) {
        try {
            let sql = `select hierarchyID,userID,parentID,userType,parentType,parentLevel,parentUser
                 from user_hierarchy where userid=$1 and parentlevel>0 order by parentlevel`;
            let list = await db.default.query(sql, { type: Sequelize.QueryTypes.SELECT, bind: [userID] })
            return list;
        } catch (e) {
            throw new APIError(e.message, ErrorCode.DbError);
        }
    }
}

export default new User_hierarchyDal();