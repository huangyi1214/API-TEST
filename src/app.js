'use strict'
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ejs_mate from 'ejs-mate';
//import cors from 'cors';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import connectRedis from 'connect-redis';

import config from '../config';
import rest from './lib/rest';
import log4js from './lib/log';
import router from './router';

import http from 'http';
import socketIO from 'socket.io';
import pushSever from './socket/server';

import { ErrorCode } from './lib/APIError';

const RedisStore=connectRedis(expressSession);
const logger = log4js.logger('app');
const app = express();
const redisStore=new RedisStore({
    host:config.redis_host,
    port:config.redis_port,
    db:config.redis_session_db,
    ttl:config.session_ttl,
    prefix:'User'
})
const session=expressSession({
    secret:config.session_secret,
    store:redisStore,
    resave:true,
    saveUninitialized:true
})

//跨域
//app.use(cors());

//视图引擎
app.set('views',path.join(__dirname,'views'))
app.set('view engine','html');
app.engine('html',ejs_mate);

//静态资源 缓存 
app.use('/public',express.static(path.join(__dirname,'public')))

//请求参数转json格式
app.use(bodyParser.json());

//session
app.use(cookieParser(config.session_secret))
app.use(session);

//登录、权限控制
app.use(rest.filter);

//路由
app.use('/', router)

//404错，即无匹配请求地址
app.use(function (req, res, next) {
    res.json({
        code: ErrorCode.NotFound,
        msg: '请求的接口地址有误'
    });
});

//记录错误日志
app.use(function (err, req, res, next) {
    var status = err.status || 500;
    logger.error('【error】', 'status:', status, 'message:', err.message || '');
    logger.error('【stack】\n ', err.stack || '');
    next(err);
});

//异常处理
app.use(function (err, req, res, next) {
    var status = err.status || 500;
    res.status(status);
    res.json({
        code: ErrorCode.SystemError,
        msg: err.message
    });
})

app.listen(config.port, function () {
    console.log(`API服务已启动,监听端口:${config.port} ...`)
})


/*****推送服务*****/

const server = http.createServer();
const io = socketIO(server);

var num = 0;
io.on('connection', function (client) {

    num++;
    console.log("客户端" + num + "已连接");
    logger.info("客户端" + num + "已连接");
    client.emit('abc',function () {
        console.log('abc');
    });

    //第一次推送服务器时间
    let date = new Date();
    let s = date.getSeconds();
    //client.emit("timing", { second: s });


    //断开连接
    client.on('disconnect', function () {
        num--;
    });
    client.on('getprofit',function (data) {


        pushSever.emitwiningAmount(client,data);

    })

})



//启动监听
server.listen(config.io_port, function () {
    console.log(`socket.io推送服务已启动,监听端口:${config.io_port}...`)
})

//推送服务
pushSever.task(io);

