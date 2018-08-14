
/* 配置 */

var config = {
    
    /**
     * 竟猜周期 单位s  支持30s 60s 
     */
    cycle:30,

    /**
     * 程序运行的端口
     */
    port: 8090,

    /**
     * socket.io端口
     */
    io_port: 9002,

    /**
     * 限制用户唯一登录
     */
    only_sign: true,

    //mysql 数据库配置
    mysql_host: '192.168.1.35',
    mysql_db: 'fkjc',
    mysql_userid: 'admin_fkjc',
    mysql_password: '123456',

    mysql_history_host: '192.168.1.35',
    mysql_history_db: 'fkjc_history',
    mysql_history_userid: 'admin_fkjc',
    mysql_history_password: '123456',

    //redis 配置
    redis_host: '192.168.1.15',
    redis_port: 6379,
    redis_password: '',
    redis_session_db: 14,

    /**token 值 redis key前缀 */
    session_token_prefix: "UserID",
    /**用户session redis key前缀 */
    session_user_prefix: "SessionID",

    session_secret: 'fkjc_secret',

    session_pay:'FKJC_DEPOSITTOKEN',
    session_withdraw:'FKJCtokenforwithdraw',
    session_RegisterSMSCode:'RegisterSMSCode',
    session_ForgetSMSCode:'ForgetSMSCode',
    session_ForgetzjSMSCode:'ForgetzjSMSCode',
    /**过期时间 */
    session_ttl: 60*30 , //过期时间

    session_ttl_pay: 10, //入金过期时间
    session_ttl_withdraw: 10, //出金过期时间
    session_ttl_trade: 5, //交易过期时间
    session_ttl_sendSMS: 90, //交易过期时间

    //日志
    logfile: './logs/',

    /**
     * 交易引擎地址
     */
    trade_wcf: "http://192.168.1.106:17617",
    // trade_wcf: "http://192.168.1.106:1761",

    pay_server:"http://192.168.3.113:8008/",
    /**测试公众号的唯一标识 */
    appid: "wxb38075bac609e5af",
    /**测试公众号的appsecret */
    secret: "209161f6151107ed85b8b73a8ed446ba",
    
    /**短信平台 */
    msg_uid:'2928',
    msg_pwd:'qhbn7778',
    msg_pwd_md5:'488a61a28d6805b66c4fd55481b9b585'


}

module.exports = config;