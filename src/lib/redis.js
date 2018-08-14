
import redis from 'redis';
import bluebird from 'bluebird';
import config from '../../config';
import log4js from '../lib/log';

const logger=log4js.logger('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * 创建redis连接
 */
exports.createClient = function (options) {
    var _options={
        db:config.redis_session_db,
        password:config.redis_password
    }

    Object.assign(_options,options);

    var client = redis.createClient(
        config.redis_port,
        config.redis_host,
        options);
    //错误
    client.on("error",function(err){
       console.log(err);
       logger.error(err.message +"\n"+err.stack);
    })

    return client;
}

