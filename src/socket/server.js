'use strict'
import io from 'socket.io';
import utils from '../lib/utils';
import log4js from '../lib/log';
import Lottery from '../models/lottery';
import Order from '../models/order';

import Kline from '../models/kline';
import config from '../../config';
const logger = log4js.logger('socket');

/**
 * 推送
 * @class
 * @classdesc 推送服务 
 */
class Server {
    constructor() {

    }

    /**
     * 定时推送服务器时间、开奖结果、K线图表数据、榜单
     * @method task
     * @memberof Server
     */
    async task(_io) {

        let delay_time = 1; //延时时间 
        let touch_time = config.cycle == 60 ? delay_time : 30 + delay_time;

        /**
         *  推送服务器时间、开奖结果、K线图表数据
         */
        setInterval(async function () {
            let date = new Date();
            let s = date.getSeconds();
            if(config.cycle==30){
                if(s>30){
                    s=s-30;
                }
            }
            _io.sockets.emit("timing", { second: s });


            if (s == delay_time || s == touch_time) { //触发推送
                try {
                    //推送开奖结果
                    let list = await Lottery.findRecently15Row();
                    _io.sockets.emit("lottery", { rows: list, now: utils.getCurDate() })

                    //推送K线图表数据
                    let kline = await Kline.getKline1minList();
                    _io.sockets.emit("kline", { list: kline });

                } catch (e) {
                    console.log(e.message)
                    logger.error(e.message)
                }
            }
        }, 1000)

        // /**
        //  * 推送榜单
        //  */
        // setInterval(async function () {
        //     try {
        //         let rankingList = await Order.getRankingList();
        //         io.sockets.emit('ranking', { list: rankingList })
        //     } catch (e) {
        //         logger.error(e.message);
        //     }
        // }, 1000 * 60 * 60)
    }

    /**
     * 推送开奖结果
     * @method emitLottery
     * @memberof Server
     */
    async emitLottery(socket) {
        try {
            let list = await Lottery.findRecently15Row();
            socket.emit("lottery", { rows: list, now: utils.getCurDate() });
        } catch (e) {
            logger.error(e.message);
        }
    }

    /**
     * 推送榜单
     * @method emitRanking
     * @memberof Server
     */
    async emitRanking(socket) {
        try {
            let list = await Order.getRankingList();
            socket.emit("ranking", { list: list });
        } catch (e) {
            logger.error(e.message);
        }
    }

    /**
     * 推送K线图数据
     * @method emitKine
     * @memberof Server
     */
    async emitKine(socket) {
        try {
            let list = await Kline.getKline1minList();
            socket.emit("kline", { list: list });
        } catch (e) {
            console.log(e.message)
            logger.error(e.message);
        }
    }

    async emitwiningAmount(socket,userid) {
        try {
            let ishasopenorder=await Order.getcountorderwithopen(userid);

            if (ishasopenorder==true)
            {

                socket.emit("nowprofit",'--');

            }
            else
            {
                let accounts = await Order.getWiningAmount(userid);
                socket.emit("nowprofit",accounts);
            }
        } catch (e) {
            console.log(e.message)
            logger.error(e.message);
        }
    }
}

export default new Server();