
import Sequelize from 'sequelize';
import config from '../../config';

const defaults=new Sequelize(config.mysql_db,config.mysql_userid,config.mysql_password,{
    host:config.mysql_host,
    dialect:'mysql',
    pool:{
        max:5,
        min:0,
        idle:30000
    }
});

const history=new Sequelize(config.mysql_history_db,config.mysql_history_userid,config.mysql_history_password,{
    host:config.mysql_history_host,
    dialect:'mysql',
    pool:{
        max:5,
        min:0,
        idle:30000
    }
});

export default {
    default:defaults,
    history:history
}