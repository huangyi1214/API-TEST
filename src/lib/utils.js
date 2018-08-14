import fs from 'fs';
import crypto from 'crypto';
import qr from 'qr-image';
import images from 'images';
import iconv from 'iconv-lite';
import config from '../../config'

exports.checkLogin = function (req, res, next) {
	if (req && req.session && req.session.user) {
		next();
	} else {
		res.render('error', {
			msg: '请先登录再执行相关操作',
			nologin: true
		});
		return;
	}
};


/**
 * 转换日期格式
 * @param {DATE} date
 * @param {Mixed} friendly 是否为友好格式 如：1分钟前
 * @return {string}
 */
exports.formatDate = function (date, friendly) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	if (friendly) {
		var now = new Date();
		var mseconds = -(date.getTime() - now.getTime());
		var time_std = [1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000];
		if (mseconds < time_std[3]) {
			if (mseconds > 0 && mseconds < time_std[1]) {
				return Math.floor(mseconds / time_std[0]).toString() + ' 秒前';
			}
			if (mseconds > time_std[1] && mseconds < time_std[2]) {
				return Math.floor(mseconds / time_std[1]).toString() + ' 分钟前';
			}
			if (mseconds > time_std[2]) {
				return Math.floor(mseconds / time_std[2]).toString() + ' 小时前';
			}
		}
	}

	hour = ((hour < 10) ? '0' : '') + hour;
	minute = ((minute < 10) ? '0' : '') + minute;
	second = ((second < 10) ? '0' : '') + second;

	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
};


/**
 * 是否为字符串
 *
 * @param {Mixed} str
 * @return {Boolean}
 */
exports.isString = function (str) {
	return (typeof str === 'string');
};

/**
 * 是否为整数
 *
 * @param {Mixed} str
 * @return {Boolean}
 */
exports.isInteger = function (str) {
	return (Math.round(str) === Number(str));
};

/**
 * 是否为null、undefined、空字符串
 * @param str
 * @return {Boolean}
 */
exports.isNull = function (str) {
	if (str == undefined || str == null || str.toString().replace(/(^s*)|(s*$)/g, "").length == 0)
		return true
	else
		return false;
}

/**
 * 是否为数字
 *
 * @param {Mixed} str
 * @return {Boolean}
 */
exports.isNumber = function (str) {
	return (!isNaN(str));
};


/**
 * md5加密
 * @param text 要加密的串
 * @return  16进制加密穿2
 */
exports.md5 = function (text) {
	return crypto.createHash('md5').update(text).digest('hex');
};


/**
 * 加密信息
 *
 * @param data
 * @param secret
 * @return
 */
exports.encryptData = function (data, secret) {
	var str = JSON.stringify(data);
	var cipher = crypto.createCipher('aes192', secret);
	var enc = cipher.update(str, 'utf8', 'hex');
	enc += cipher.final('hex');
	return enc;
};

/**
 * 解密信息
 *
 * @param str
 * @param secret
 * @return
 */
exports.decryptData = function (str, secret) {
	var decipher = crypto.createDecipher('aes192', secret);
	var dec = decipher.update(str, 'hex', 'utf8');
	dec += decipher.final('utf8');
	var data = JSON.parse(dec);
	return data;
};

/**sha1 哈希加密 */
exports.sha1hex = function (str) {
	var sha1 = crypto.createHash('sha1');
	sha1.update(str);
	return sha1.digest('hex');
}


/**
 * 产生随机字符串
 *
 * @param size
 * @param chars
 * @return
 */
exports.randomString = function (size, chars) {
	size = size || 6;
	var code_string = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var max_num = code_string.length + 1;
	var new_pass = '';
	while (size > 0) {
		new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
		size--;
	}
	return new_pass;
};


/**
 * 产生随机数字字符串
 *
 * @param size
 * @return
 */
exports.randomNumber = function (size) {
	size = size || 6;

	var new_pass=Math.random().toString().substr(2,size);
	return new_pass;
};


/**
 * 产生随机字母字符串
 *
 * @param size
 * @return
 */
exports.randomLetter = function (size) {
	size = size || 6;
	var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	var max_num = code_string.length + 1;
	var new_pass = '';
	while (size > 0) {
		new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
		size--;
	}
	return new_pass;
};

exports.extend = function () {
	var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		trim = String.prototype.trim,
		indexOf = Array.prototype.indexOf,
		class2type = {
			"[object Boolean]": "boolean",
			"[object Number]": "number",
			"[object String]": "string",
			"[object Function]": "function",
			"[object Array]": "array",
			"[object Date]": "date",
			"[object RegExp]": "regexp",
			"[object Object]": "object"
		},
		jQuery = {
			isFunction: function (obj) {
				return jQuery.type(obj) === "function"
			},
			isArray: Array.isArray ||
			function (obj) {
				return jQuery.type(obj) === "array"
			},
			isWindow: function (obj) {
				return obj != null && obj == obj.window
			},
			isNumeric: function (obj) {
				return !isNaN(parseFloat(obj)) && isFinite(obj)
			},
			type: function (obj) {
				return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
			},
			isPlainObject: function (obj) {
				if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
					return false
				}
				try {
					if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
						return false
					}
				} catch (e) {
					return false
				}
				var key;
				for (key in obj) { }
				return key === undefined || hasOwn.call(obj, key)
			}
		};
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		i = 2;
	}
	if (typeof target !== "object" && !jQuery.isFunction(target)) {
		target = {}
	}
	if (length === i) {
		target = this;
		--i;
	}
	for (i; i < length; i++) {
		if ((options = arguments[i]) != null) {
			for (name in options) {
				src = target[name];
				copy = options[name];
				if (target === copy) {
					continue
				}
				if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : []
					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}
					// WARNING: RECURSION
					target[name] = extend(deep, clone, copy);
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}
	return target;
}

/**
 * 字典排序
 * @param dict 如:dict={a:1,b:2,c:3}
 */
exports.sortDict = function (dict) {
	var dict2 = {},
		keys = Object.keys(dict).sort();

	for (var i = 0, n = keys.length, key; i < n; ++i) {
		key = keys[i];
		dict2[key] = dict[key];
	}

	return dict2;
}

/**
 * 获取客户端IP
 */
exports.getClientIp = function (req) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ip != undefined) {
		ip = ip.replace("::ffff:", "").replace('::1', '')
		return ip;
	} else {
		return "";
	}

}

/**
 * 创建二维码
 */
exports.createQr = function (url, savePath, callback) {
	var qr_png = qr.image(url, { type: 'png', size: 8 });
	var qr_pipe = qr_png.pipe(fs.createWriteStream(savePath));
	qr_pipe.on("error", function (err) {
		callback(err, null);
		return;
	})

	qr_pipe.on("finish", function () {
		callback(null, savePath);
	})
}

/**
* 图片添加水印
*/
exports.addWater = function (sourceImg, waterImg, saveImg, positionX, positionY, callback) {

	try {
		images(sourceImg).size(720).draw(images(waterImg), positionX, positionY).save(saveImg, { quality: 90 });
		callback(null, saveImg);
	} catch (e) {
		callback(e, null);
	}


}

/**获取当前时间 */
exports.getCurDate = function () {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	month = month < 10 ? '0' + month : month;
	var date = now.getDate();
	date = date < 10 ? '0' + date : date;
	var hours = now.getHours();
	hours = hours < 10 ? '0' + hours : hours;
	var min = now.getMinutes();
	min = min < 10 ? '0' + min : min;
	return '' + year + month + date + hours + min;
}
/**获取带秒数的当前时间 */
exports.getCurDatefornew = function () {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    var date = now.getDate();
    date = date < 10 ? '0' + date : date;
    var hours = now.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    var min = now.getMinutes();
    min = min < 10 ? '0' + min : min;
    var secord=now.getSeconds();
    if (config.cycle=='30')
	{
        secord=secord<30?'00':'30';
	}
	else
	{
        secord='00';

    }
    return '' + year + month + date + hours + min+secord;
}

exports.getCurDateFormat = function () {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	month = month < 10 ? '0' + month : month;
	var date = now.getDate();
	date = date < 10 ? '0' + date : date;
	var hours = now.getHours();
	hours = hours < 10 ? '0' + hours : hours;
	var min = now.getMinutes();
	min = min < 10 ? '0' + min : min;
	var sec = now.getSeconds();
	sec = sec < 10 ? '0' + sec : sec;
	return '' + year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec;
}

/**编码GB2312 */
exports.encodeGB2312 = function (text) {
	let pad = function (number, length, pos) {
		var str = "%" + number;
		while (str.length < length) {
			//向右边补0
			if ("r" == pos) {
				str = str + "0";
			} else {
				str = "0" + str;
			}
		}
		return str;
	}

	let toHex = function (chr, padLen) {
		if (null == padLen) {
			padLen = 2;
		}
		return pad(chr.toString(16), padLen);
	}


	var gb2312 = iconv.encode(text.toString('UCS2'), 'GB2312');
	var gb2312Hex = "";
	for (var i = 0; i < gb2312.length; ++i) {
		gb2312Hex += toHex(gb2312[i]);
	}
	return gb2312Hex.toUpperCase();

}