import Sequelize from 'Sequelize';
import db from './db';

var Capitalaccount=db.default.define('capitalaccount',{
    capitalaccountID:{
        type:Sequelize.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    userID:{type:Sequelize.BIGINT},
    accountID:{type:Sequelize.BIGINT},
    status:{type:Sequelize.INTEGER,defaultValue:0},
    signBank:{type:Sequelize.STRING,defaultValue:''},
    bankName:{type:Sequelize.STRING,defaultValue:''},
    bankNumber:{type:Sequelize.STRING,defaultValue:''},
    bankPhone:{type:Sequelize.STRING,defaultValue:''},
    bankCard:{type:Sequelize.STRING,defaultValue:''},
    type:{type:Sequelize.INTEGER,defaultValue:1},
    signTime:{type:Sequelize.DATE,defaultValue:Date.now()},
    bankOfName:{type:Sequelize.STRING,defaultValue:''},
    bankBranch:{type:Sequelize.STRING,defaultValue:''},
    bankCity:{type:Sequelize.STRING,defaultValue:''},
    bankProvince:{type:Sequelize.STRING,defaultValue:''},
    bindNo:{type:Sequelize.STRING,defaultValue:''},
    bankCard:{type:Sequelize.STRING,defaultValue:''}
}, {
    createdAt:false,
    updatedAt:false,
    deletedAt:false,
    freezeTableName: true,
});

exports.instance=Capitalaccount;