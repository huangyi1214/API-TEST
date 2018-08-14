import Sequelize from 'Sequelize';
import db from './db';

var Admin=db.default.define('admin',{
    id:{
        type:Sequelize.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    roleid:{type:Sequelize.INTEGER,defaultValue:0},
    userID:{type:Sequelize.BIGINT,unique:true},
    name:{type:Sequelize.STRING},
    username:{type:Sequelize.STRING,unique:true},
    password:{type:Sequelize.STRING,defaultValue:""},
    encrypt:{type:Sequelize.STRING},defaultValue:"",
    usertype:{type:Sequelize.INTEGER,defaultValue:8},
    appid:{type:Sequelize.STRING,defaultValue:""},
    appsecret:{type:Sequelize.STRING,defaultValue:""},
    status:{type:Sequelize.INTEGER,defaultValue:1},
    isEditPassword:{type:Sequelize.INTEGER,defaultValue:0},
    createUser:{type:Sequelize.STRING,defaultValue:""},
    createTime:{type:Sequelize.STRING,defaultValue:''},
    updateUser:{type:Sequelize.STRING,defaultValue:""},
    updateTime:{type:Sequelize.STRING,defaultValue:''},
    lastloginip:{type:Sequelize.STRING,defaultValue:""},
    lastlogintime:{type:Sequelize.STRING,defaultValue:''}
}, {
    createdAt:false,
    updatedAt:false,
    deletedAt:false,
    freezeTableName: true,
});

exports.instance=Admin;
