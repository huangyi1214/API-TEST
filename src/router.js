import express from 'express';

import oauth from './controllers/oauth';

const router=express.Router();

/**微信公众平台 */
// router.post('/wechat/token',wechat.token)
// router.post('/wechat/login',wechat.login)

/**首页 登录 注册*/
router.get('/',oauth.index)
router.get('/index.html',oauth.index)
router.get('/login.html',oauth.login_page)
router.get('/login',oauth.login_page)
router.get('/code?:p',oauth.login_code)
router.get('/register.html',oauth.register_page)
router.get('/register',oauth.register_page)
/*注册发送验证码*/
router.get('/sendMsg',oauth.sendMsg);
/*找回登录密码发送验证码*/
router.get('/sendMsgforget',oauth.sendMsgforget);

/*找回资金密码发送验证码*/
router.get('/sendMsgforgetzj',oauth.sendMsgforgetzj);

//忘记密码
router.get('/forget',oauth.forget_page)
router.get('/forget.html',oauth.forget_page)

router.post('/login',oauth.login)
router.post('/register',oauth.register)
router.post('/logout',oauth.logout)
router.post('/forget',oauth.forget)
router.post('/forgetzj',oauth.forgetzj)


router.post('/Recharge',oauth.Recharge)
router.post('/Withdraw',oauth.Withdraw)

/*获取礼品记录*/
router.get('/getpresent',oauth.getpresent)
/*获取兑换记录*/
router.get('/getexchangerecord',oauth.getexchangerecord)
export default router;