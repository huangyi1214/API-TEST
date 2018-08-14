
/**
 * @class 
 * @classdesc APIError 错误类型
 */
export class APIError extends Error {
    /**
     * @constructs 
     * @param {string} message 
     * @param {ErrorCode} code -ErrorCode 枚举值 
     */
    constructor(message = '', code = 1000) {
        super();
        this.code = code;
        this.message = message;
        this.stack = (new Error()).stack;
        this.name = this.constructor.name;
    }
}

/**
 * 错误编码
 * @readonly
 * @enum {number}
 */
 const ErrorCode = {
    /**
     * 0-操作成功
     * 
     * */
    Success: 0,

    /**
     * 1000-服务端错误
     *
     */
    SystemError: 1000,

    /**
     * 1001-缺少访问令牌
     * 
     * */
    TokenLoss: 1001,

    /**
     * 1002-访问令牌已过期或错误
     * 
     *  */
    TokenError: 1002,

    /**
     *1003-请求接口地址有误
     *  
     */
    NotFound: 1003,

    /**
     * 2000-参数有误
     *
     */
    ParamError: 2000,

    /**
     * 2001-验证失败 
     * 
     */
    VerifyFail: 2001,

    /**
     * 2002-数据库操作错误
     */
    DbError:2002
}

export {ErrorCode}