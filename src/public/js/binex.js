
var BINEX = BINEX || {};

/**
 * ajax数据交互
 */
BINEX.ajax = {

    /**获取后端URL*/
    getIP: function () {
        //return "http://192.168.1.110:8090";
        //return "http://localhost:8080";
        return '';
    },
    /**请示JSON数据 */
    getJSON: function (url, data, successfn, isAsync) {
        data = (data == null || data == "" || typeof (data) == "undefined") ? {} : data;
        if (isAsync == undefined || isAsync == null) {
            isAsync = true
        };
        $.ajax({
            type: "get",
            data: data,
            async: isAsync,
            // beforeSend:function(req){
            //    req.setRequestHeader("token",BINEX.utils.getCookie('token'));
            // },
            url: this.getIP() + url,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (d) {
                switch (d.code) {
                    case 1001:
                    case 1002:
                        BINEX.dialog.msg(d.msg);
                        setTimeout(function () {
                            window.location = '/login'
                        }, 1000)
                        break;
                    default:
                        successfn(d);
                }
            }
        })
    },
    /**提交json数据 */
    post: function (url, data, successfn, isAsync) {
        data = (data == null || data == "" || typeof (data) == "undefined") ? {} : data;
        if (isAsync == undefined || isAsync == null) {
            isAsync = true
        };
        $.ajax({
            type: "post",
            async: isAsync,
            // beforeSend:function(req){
            //     req.setRequestHeader("token",BINEX.utils.getCookie('token'));
            //  },
            data: JSON.stringify(data),
            url: this.getIP() + url,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (d) {
                switch (d.code) {
                    case 1001:
                    case 1002:
                        BINEX.dialog.msg(d.msg);
                        setTimeout(function () {
                            window.location = '/login'
                        }, 1000)
                        break;
                    default:
                        successfn(d);
                }
            }
        });
    },

    /**获取当前url参数值 */
    getUrlParamValue: function (name) { //获取页面URL地址参数方法
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //声明正则表达式
        var r = window.location.search.substr(1).match(reg); //用正则表达式匹配URL地址参数
        if (r != null) return unescape(r[2]);
        return null; //如果匹配到参数，返回参数结果，如果没有匹配到，返回null
    },
}

/**对话框 */
BINEX.dialog = {

    timeOutIndex: null,

    msg: function (msg, callback) {
        var $msg = $("#dialog_msg");
        if (this.timeOutIndex) clearTimeout(this.timeOutIndex);
        $msg.removeClass('show');

        if ($msg.length > 0) {
            $msg.html(msg);
            $msg.addClass('show');
            this.timeOutIndex = setTimeout(function () {
                $msg.removeClass('show');
            }, 2000)
        } else {
            var $msg = $('<div id="dialog_msg" class="dialog-msg">' + msg + '</div> ');
            $("body").append($msg);
            $msg.addClass('show');
            this.timeOutIndex = setTimeout(function () {
                $msg.removeClass('show');
            }, 2000)
        }
    }
}

/**
 * socket.io
 * 倒计时、开奖结果、竟猜榜单
 */
BINEX.socketIO = {
    //io客户端socket
    socket: null,
    /**
     * 初始 建立连接
     */
    init: function (url) {
        this.socket = io.connect(url != undefined ? url : CONFIG.push_server);
        this.socket.on("connect", function () {
            console.log("socket已连接!")
        });
        this.socket.on("disconnect", function () {
            console.log("socket已断开...!")
        });
    },
    /**
     * 监听倒计时
     */
    listenTiming: function (type) {
        var socket = this.socket;
        var intervalIndex=null;
        var cycle=parseInt($("#order_cycle").val());
        socket.on("timing", function (data) {
            clearInterval(intervalIndex);
            var s = cycle - data.second;
            if (s == 0) { s = cycle; }
            $("#timing").text(s);
            var userid=$("#order_userID").val();




            if (s > 10) {
                if (s == cycle) {
                    $("#djs10_img").removeClass("zoomIn");
                    $(".qxz-box").show();
                    setTimeout(function () {
                        $(".qxz-box").hide();
                    }, 1000)

                    $(".tabs-img").hide();
                    $(".djs-con-img").hide();

                    $(".cmList ul").html("");
                    $(".newz").html("&nbsp;");
                }
                if (s == 11) {
                    $(".xd-box").show();
                    setTimeout(function () {
                        $(".xd-box").hide();
                    }, 1000)
                }

                if (ishasopenorder==true)
                {
                    socket.emit('getprofit',userid)

                }

            } else {
                sMusic.play();
                $("#winingAmount").text('0');
                $(".tabs-img").show();
                $(".djs-con-img").show();
                $("#djs10_img").attr('src', "./public/images/" + s + ".png").addClass("zoomIn");
                if (s==1) {
                    ishasopenorder = true;
                }
            }
        });




            /**
         * 绘制倒计时效果
         */
        var drawTiming = function ($ele, num, duration) {
            var $top = $ele.find("div.top");
            var $bottom = $ele.find("div.bottom");
            if ($top.html() != num + '') {
                $top.css("display", "none");
                $top.html(num).slideDown(duration);
                $bottom.animate({ 'height': '' }, duration, function () {
                    $bottom.html($top.html());
                    $bottom.css({ 'display': 'block', 'height': '' });
                    $top.hide().slideUp(10);
                })
            }
        }



    },
    /**
     * 监听开奖结果
     */
    listenLottery: function (type) {
        var socket = this.socket;
        socket.on("lottery", function (data) {

            var rows = data.rows;
            if (rows.length > 0) {
                var arr_ds = [];
                var arr_dxh = [];
                $.each(rows.reverse(), function (index, row) {
                    var result = analytic(row.price);
                    arr_ds.push([index, result.ds == 1 ? 5 : 4]);
                    arr_dxh.push([index, result.dxh == 3 ? 0 : result.dxh == 2 ? 1 : 2]);
                })
                BINEX.chartT.refresh(arr_ds, arr_dxh);
                drawAnimate(rows);

            }
        })

        /**
         * 计算开奖结果
         */
        var analytic = function (price) {
            var result = {};
            var dec = parseFloat(price).toFixed(3).split('.')[1];//小数点
            var dec1 = dec.substr(0, 1);
            var dec2 = dec.substr(1, 1);
            var dec3 = dec.substr(2, 1);
            result.price_dec = dec;
            result.price_int = parseFloat(price).toFixed(3).split('.')[0]
            if (parseInt(dec3) % 2)
                result.ds = 1; //单
            else
                result.ds = 2;//双

            if (dec1 == dec2 || dec1 == dec3 || dec2 == dec3) {
                result.dxh = 3; //合
            } else {
                if (parseInt(dec3) > 4)
                    result.dxh = 1 //大
                else
                    result.dxh = 2;//小
            }

            return result;
        };

        /**
         * 开奖结果动画
         */
        var drawAnimate = function (rows) {
            if ($('.ds-list-con').data('first') === true) {
                $('.ds-list-con').data('first', 'false')
                return;
            }
            // BINEX.trade.getWiningAmount();//获取中奖金额
            BINEX.trade.getUserBalance();

            var price = rows[14].price;
            var result = analytic(price);
            $('.jg-price-int').text(result.price_int);
            $('.jg-price-dec').text(result.price_dec);
            var name_ds = result.ds == 1 ? 'd' : 's';
            var name_dxh = result.dxh == 1 ? 'd' : result.dxh == 2 ? 'x' : 'h';
            $(".price-ds").hide();
            $(".price-dxh").hide();
            $(".price").hide();
            $(".jg-price").removeClass('hide');
            $('.jg-b').removeClass('hide');
            $(".trade-type-" + name_ds).find(".ds-list").css("background", "url(./public/images/tradelibg.gif)").css('background-size', 'cover');
            $(".trade-type-dxh").find(".ds-list").eq(result.dxh - 1).css("background", "url(./public/images/tradelibg.gif)").css('background-size', 'cover');
            $(".ds-list-con").css("background", "url(./public/images/jg_" + name_ds + name_dxh + ".gif)  ").css('background-size', 'cover');
            setTimeout(function () {
                $('.jg-b').addClass('hide');
                $(".jg-price").addClass('hide');
                $(".price-ds").show();
                $(".price-dxh").show();
                $(".price").show();
                $(".ds-list-con").css("background", "url(./public/images/dsbg.gif) no-repeat ").css('background-size', 'cover');
                $(".trade-type-" + name_ds).find(".ds-list").css("background", "url(./public/images/xdbg.png)").css('background-size', 'cover');
                $(".trade-type-dxh").find(".ds-list").eq(result.dxh - 1).css("background", "url(./public/images/xdbg.png)").css('background-size', 'cover');

            }, 5000)

        };
    },

    /**
     * 监听榜单
     */
    listenRanking: function () {
        var socket = this.socket;
        socket.on("ranking", function (data) {
            var list = data.list;
            if (list.length > 0) {
                var $tbody = $("#ranking_list");
                $tbody.html("");
                $.each(list, function (index, row) {
                    var $tr = createRow(parseInt(index) + 1, row);
                    $tbody.append($tr);
                });
            }
        });
        /**
         * 创建行
         * @param {*} index 
         * @param {*} row 
         */
        var createRow = function (index, row) {
            var $tr = $("<tr><td>" + index + "</td><td>" + row.userID + "</td><td>" + parseFloat(row.profit).toFixed(0) + "</td></tr>");
            return $tr;
        }
    },

    /**
     * 监听K线图表数据
     */
    listenKline: function () {

        var socket = this.socket;
        socket.on("kline", function (data) {
            var list = data.list;
            if (BINEX.chartK.echart) {
                BINEX.chartK.refresh(list);
            }
        })
    },
    /*监听实时盈亏数据*/
    listenprofit:function () {
        var socket=this.socket;
        socket.on('nowprofit',function (data) {


            if (data=='--')
            {
                ishasopenorder=true;
                $("#winingAmount").text('0');
            }
            else
            {
                ishasopenorder=false;
                var amount = parseFloat(data).toFixed(0);
                amount=amount>0?amount:0;


                $("#winingAmount").text(amount);

            }



        })
    }
}

/**
 * websocket
 * 行情
 */
BINEX.websocket = {
    /**
     * 监听行情
     */
    listenPrice: function (type) {
        var ws = new WebSocket(CONFIG.price_server);
        ws.onopen = function () {
            ws.onmessage = function (result) {

                var data = result.data;
                var dataArr = data.split('|');
                var price = dataArr[2];
                var priceArr = price.split('.');
                var price_int = priceArr[0];
                var price_dec = priceArr[1];

                if (type == 1) {
                    $(".price-int").text(price_int + '.');
                    $(".price-dec").text(price_dec);
                    var result = analytic(price);
                    $(".price-ds").text(result.ds === 1 ? "單" : "雙");
                    $(".price-dxh").text(result.dxh === 1 ? "大" : result.dxh == 2 ? "小" : "合");
                } else {
                    var $price_int_2 = $(".price-int-2");
                    var $price_int_1 = $(".price-int-1");
                    var $price_dec = $(".price-dec");
                    $price_int_2.find("span").remove();
                    $price_int_1.find("span").remove();
                    $price_dec.find("span").remove();

                    for (var i = price_int.length - 1, j = 0; i >= 0; i-- , j++) {
                        if (j >= 3) {
                            $price_int_1.append($("<span>" + price_int[i] + "</span>"))
                        } else {
                            $price_int_2.append($("<span>" + price_int[i] + "</span>"))
                        }
                    }

                    for (var i = price_dec.length - 1; i >= 0; i--) {
                        $price_dec.append($("<span>" + price_dec[i] + "</span>"));
                    }
                }

            }
        }
        ws.onerror = function () {

        }

        /**
       * 计算开奖结果
       */
        var analytic = function (price) {
            var result = {};
            var dec = parseFloat(price).toFixed(3).split('.')[1];//小数点
            var dec1 = dec.substr(0, 1);
            var dec2 = dec.substr(1, 1);
            var dec3 = dec.substr(2, 1);

            if (parseInt(dec3) % 2)
                result.ds = 1; //单
            else
                result.ds = 2;//双

            if (dec1 == dec2 || dec1 == dec3 || dec2 == dec3) {
                result.dxh = 3; //合
            } else {
                if (parseInt(dec3) > 4)
                    result.dxh = 1 //大
                else
                    result.dxh = 2;//小
            }

            return result;
        };
    }

}

/**
 * k线图
 */
BINEX.chartK = {

    /**图表对象 */
    echart: null,

    /**曲线图值 */
    closeData: null,

    /**K线图表值 */
    data: null,

    /**日期 */
    dates: null,

    /**自适应 */
    resize: function (_echart) {
        $(window).resize(function () {
            _echart.resize();
        })
    },
    /**
     * 初始
     */
    init: function () {
        var option = {
            //backgroundColor: '#21202D',
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false,
                    type: 'cross',
                    lineStyle: {
                        color: '#376df4',
                        width: 2,
                        opacity: 1
                    }
                },
                formatter: function (params) {
                    var res = '时间：' + params[0].name;
                    res += '<br/>  开盘 : ' + params[0].value[1] + '  最高 : ' + params[0].value[4];
                    res += '<br/>  收盘 : ' + params[0].value[2] + '  最低 : ' + params[0].value[3];
                    return res;
                }
            },
            xAxis: {
                type: 'category',
                axisLine: { lineStyle: { color: '#8392A5' } },
            },
            textStyle: {
                color: '#fefefe',
                fontFamily: 'Microsoft YaHei'
            },
            yAxis: {
                scale: true,
                axisLine: { lineStyle: { color: '#8392A5' } },
                splitLine: { show: false }
            },
            grid: {
                top: 15,
                bottom: 30,
                left: 50,
                right: 20
            },
            animation: true,
            series: [
                {
                    type: 'candlestick',
                    name: 'K线',
                    itemStyle: {
                        normal: {
                            color: '#FD1050',
                            color0: '#0CF49B',
                            borderColor: '#FD1050',
                            borderColor0: '#0CF49B'
                        }
                    }
                },
                {
                    type: 'line',
                    name: '收盘价',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                },
            ]
        };

        this.echart = echarts.init(document.getElementById("K_chart"));
        this.echart.setOption(option);
        this.resize(this.echart);
    },
    /**
     * 刷新图表
     */
    refresh: function (list) {
        //json 对象转换成数组
        var _this = this;
        var rawData = [];
        $.each(list, function (index, row) {
            var raw = [];
            raw.push(_this.formatnumber(row.date));
            raw.push(_this.formatnumber(row.open));
            raw.push(_this.formatnumber(row.close));
            raw.push(_this.formatnumber(row.low));
            raw.push(_this.formatnumber(row.high));
            rawData.push(raw);
        });
        rawData.reverse();
        //日期 x轴
        var dates = rawData.map(function (item) {
            return item[0];
        });
        _this.dates = dates;
        //k线数据
        var data = rawData.map(function (item) {
            return [+item[1], +item[2], +item[3], +item[4]];
        });
        _this.data = data;
        //收盘价格曲线数据
        var closeData = rawData.map(function (item) {
            return item[2];
        });
        _this.closeData = closeData;

        _this.echart.setOption({
            xAxis: {
                type: 'category',
                data: dates,
                axisLine: { lineStyle: { color: '#8392A5' } }
            },
            series: [
                {
                    type: 'candlestick',
                    name: 'K线',
                    data: data,
                    itemStyle: {
                        normal: {
                            color: '#FD1050',
                            color0: '#0CF49B',
                            borderColor: '#FD1050',
                            borderColor0: '#0CF49B'
                        }
                    }
                },
                {
                    type: 'line',
                    name: '收盘价',
                    data: closeData,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                },
            ]
        })
    },
    /**
     *  获取历史数据保留三位小数点
     */
     formatnumber : function(value){
      var a, b, c,i;
        a = value.toString();
        b = a.indexOf(".");
        c = a.length;
        if(b == -1){
            a = a + ".";
            for(i=1;i<=3;i++){
                a = a + "0";
            }
        }else{
            a = a.substring(0,b + 3 + 1);
            for(i = c; i <= b + 3; i++){
                a = a + "0";
            }
        }
        return a;
    },
    /**
     * 刷新曲线图
     */
    refreshLine: function (price) {
        var closeData = this.closeData;
        var data = this.data;
        var dates = this.dates;
        if (closeData.length == 30) {
            closeData.push(parseFloat(price));
            dates.push("16:18");
            data.push(['', '', '', '', ''])
        } else {
            closeData.pop();
            closeData.push(parseFloat(price));
        }
        this.echart.setOption({
            xAxis: {
                type: 'category',
                data: dates,
                axisLine: {
                    lineStyle: { color: '#8392A5' },
                },
                nameTextStyle: {
                    fontFamily: 'Microsoft YaHei',
                    color: '#fff'
                }

            },
            series: [
                {
                    type: 'candlestick',
                    name: 'K线',
                    data: data,
                    itemStyle: {
                        normal: {
                            color: '#FD1050',
                            color0: '#0CF49B',
                            borderColor: '#FD1050',
                            borderColor0: '#0CF49B'
                        }
                    }
                },
                {
                    type: 'line',
                    name: '收盘价',
                    data: closeData,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                },
            ]
        })
    }
}

/**
 *走势图
 */
BINEX.chartT = {

    /**图表对象 */
    echart: null,

    /**曲线图值 */
    closeData: null,

    /**K线图表值 */
    data: null,

    /**日期 */
    dates: null,

    /**自适应 */
    resize: function (_echart) {
        $(window).resize(function () {
            _echart.resize();
        })
    },
    /**
     * 初始
     */
    init: function () {
        var option = {
            backgroundColor: 'transparent',
            grid: {
                top: 15,
                bottom: 10,
                left: 30,
                right: 0
            },
            xAxis: {
                show: false,
                type: 'value',
                axisLine: {
                    show: false
                },
                axisLine: { lineStyle: { color: '#8392A5' } },
                data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
            },
            yAxis: {
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(74,81,135,0.3)', 'rgba(107,91,156,0.3)']
                    }
                },
                type: 'category',
                axisLine: { show: false, lineStyle: { color: '#8392A5' } },
                data: ['合', '小', '大', '', '雙', '單']
            },
            textStyle: {
                color: '#fefefe',
                fontFamily: 'Microsoft YaHei'
            },
            animation: true,
            color: ['#fefefe'],
            series: [
                {
                    name: 'dxh',
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 12,
                    smooth: false,
                    markPoint: {
                        symbol: 'circle',

                    },
                    label: {
                        normal: {
                            show: true,
                            color: '#4A5187',
                            fontSize: 8,
                            position: 'inside',
                            formatter: function (params) {
                                return params.name;
                            }
                        }
                    }
                },
                {
                    name: 'ds',
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 12,
                    smooth: false,
                    label: {
                        normal: {
                            show: true,
                            color: '#4A5187',
                            fontSize: 8,
                            position: 'inside',
                            formatter: function (params) {
                                return params.name;
                            }
                        }
                    }
                }
            ]
        };

        this.echart = echarts.init(document.getElementById("T_chart"));
        this.echart.setOption(option);
        this.resize(this.echart);
    },
    /**
     * 刷新图表
     */
    refresh: function (arr_ds, arr_dxh) {
        //json 对象转换成数组
        this.echart.setOption({
            series: [
                {
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 12,
                    smooth: false,
                    label: {
                        normal: {
                            show: true,
                            color: '#4A5187',
                            fontSize: 8,
                            position: 'inside',
                            formatter: function (params) {
                                return params.name;
                            }
                        }
                    },
                    data: arr_dxh
                },
                {
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 12,
                    smooth: false,
                    label: {
                        normal: {
                            show: true,
                            color: '#4A5187',
                            fontSize: 8,
                            position: 'inside',
                            formatter: function (params) {
                                return params.name;
                            }
                        }
                    },
                    data: arr_ds
                }
            ]
        })
    }
}


/**用户 */
BINEX.user = {
    /**设置token */
    setToken: function (token) {
        return $.cookie("token", token);
    },
    /**获取token */
    getToken: function () {
        return $.cookie("token");
    },
    /**获取竟猜查询 */
    getOrderDetail: function () {
        BINEX.ajax.getJSON("/orderDetail", {}, function (d) {
            if (d.code == 0) {
                var list = d.data;
                if (list && list.length > 0) {
                    $("#orderDetail").find(".search-item").remove();
                    $(".tip-nodata").remove();
                    var $tbody = $("#orderDetail");
                    $.each(list, function (index, row) {
                        var $tr = createRow(row);
                        $tbody.append($tr);
                    })
                    $(".search-tips").show();
                }else{
                    $("#orderDetail").append('<img style="display: block;margin:0 auto" src="./public/images/wcyjc.png" />');
                }
            } else {
                BINEX.dialog.msg(d.msg)
            }
        })

        var createRow = function (row) {
            if (parseFloat(row.price)==0)
            {
                var result = analytic(row.price);
                var $tr = $(`
            <li class="search-item">
                <dl>
                    <dd class="jc1">${row.time}</dd>
                    <dd class="jc4"><span>--<br/>未开奖</span></dd>
                    <dd class="jc5">${row.amount}</dd>
                    <dd class="jc6">${row.profit}</dd>
                    <div class="clear"></div>
                </dl>
            </li>
            `);
                return $tr;

            }
            else
            {
                var result = analytic(row.price);
                var $tr = $(`
            <li class="search-item">
                <dl>
                    <dd class="jc1">${row.time}</dd>
                    <dd class="jc4"><span>${result.price_int}.<em class="red">${result.price_dec}</em><br/>${result.ds}&nbsp;${result.dxh}</span></dd>
                    <dd class="jc5">${row.amount}</dd>
                    <dd class="jc6">${row.profit}</dd>
                    <div class="clear"></div>
                </dl>
            </li>
            `);
                return $tr;

            }

        }

        /**
        * 计算开奖结果
        */
        var analytic = function (price) {
            var result = {};
            var dec = parseFloat(price).toFixed(3).split('.')[1];//小数点
            result.price_dec = dec;
            result.price_int = parseFloat(price).toFixed(3).split('.')[0];
            var dec1 = dec.substr(0, 1);
            var dec2 = dec.substr(1, 1);
            var dec3 = dec.substr(2, 1);

            if (parseInt(dec3) % 2)
                result.ds = '单'; //单
            else
                result.ds = '双';//双

            if (dec1 == dec2 || dec1 == dec3 || dec2 == dec3) {
                result.dxh = '合'; //合
            } else {
                if (parseInt(dec3) > 4)
                    result.dxh = '大' //大
                else
                    result.dxh = '小';//小
            }

            return result;
        };
    },
    /**获取资金明细 */
    getCapitalFlow: function () {
        BINEX.ajax.getJSON("/capitalFlow", {}, function (d) {
            if (d.code == 0) {
                var data = d.data;
                var list = data.list;
                if (list && list.length > 0) {
                    $(".tip-nodata").remove();
                    var $tbody = $("#capitalFlow");
                    $.each(list, function (index, row) {
                        var $tr = createRow(row);
                        $tbody.append($tr);
                    })
                    $(".search-tips").show();
                }
            } else {
                BINEX.dialog.msg(d.msg)
            }
        })

        var createRow = function (row) {
            var $tr = $("<tr>" +
                "<td>" + row.date + "</td>" +
                "<td>" + row.externalID + "</td>" +
                "<td>" + row.amount + "</td>" +
                "<td>成功</td>" +
                "</tr>");
            return $tr;
        }
    },

    /**修改密码 */
    changePwd: function (oldPwd, newPwd) {
        BINEX.ajax.post("/changePwd", { oldPwd: oldPwd, newPwd: newPwd }, function (d) {
            if (d.code == 0) {
                BINEX.dialog.msg("密码修改成功");
                $("input[type='password']").val("");
            } else {
                BINEX.dialog.msg(d.msg);
            }
        })
    },

    /**修改资金密码 */
    changeJzPwd: function (oldPwd, newPwd) {
        BINEX.ajax.post("/changeJzPwd", { oldPwd: oldPwd, newPwd: newPwd }, function (d) {
            if (d.code == 0) {
                BINEX.dialog.msg("资金密码修改成功");
                $("input[type='password']").val("");
            } else {
                BINEX.dialog.msg(d.msg);
            }
        })
    },



    /**获取公告列表 */
    getNoticeList: function () {
        BINEX.ajax.getJSON("/noticeList", {}, function (d) {
            if (d.code == 0) {
                var list = d.data;
                var $list = $("#list_notice");
                $list.html("");
                if (list) {
                    $.each(list, function (key, row) {
                        var $li = createRow(row);
                        $list.append($li);
                    })
                }
            } else {
                BINEX.dialog.msg(d.msg);
            }
        })

        var createRow = function (row) {
            var $li = $(`
            <li>
                <a href="gonggao-content.html?articalID=${row.articalID}">
                    <div class="gglist-l fl">
                        <span>${row.title}</span>
                    </div>
                    <div class="gglist-r fr">
                        <span>${row.articalTime}</span>
                    </div>
                    <div class="clear"></div>
                </a>
            </li>
            `)
            return $li;
        }
    },

    /**获取公告详情 */
    getNoticeDetails: function (articalID) {
        BINEX.ajax.getJSON("/noticeDetail", { articalID: articalID }, function (d) {
            if (d.code == 0) {
                var detail = d.data;
                if (detail) {
                    $("#title").text(detail.title);
                    $("#content").html(detail.content);
                    if (detail.imageUrl) {
                        var $image = $('<img id="gg_img" src="' + detail.imageUrl + '" width="100px"; height="100px;" style="display: block;margin:10px auto"/>')
                        $("#content").prepend($image)
                    }
                }
            } else {
                BINEX.dialog.msg(d.msg);
            }
        })
    },

    /**退出登录 */
    logout: function () {
        BINEX.ajax.post("/logout", {}, function (d) {
            if (d.code == 0) {
                window.location = "/login";
            }
        })
    },

    /**获取往期结果 */
    getLotteryList: function () {
        BINEX.ajax.getJSON('/lotterylist', {}, function (data) {
            if (data.code == 0) {
                var rows = data.data.rows;
                var list = [];
                if (rows.length > 0) {
                    $.each(rows, function (index, row) {
                        var li = {};
                        li.time = row.time;
                        li.result = analytic(row.price);
                        list.push(li);
                    });
                    drawList(list);
                }
            }
        });

        /**
        * 计算开奖结果
        */
        var analytic = function (price) {
            var result = {};
            var dec = parseFloat(price).toFixed(3).split('.')[1];//小数点
            var dec1 = dec.substr(0, 1);
            var dec2 = dec.substr(1, 1);
            var dec3 = dec.substr(2, 1);

            if (parseInt(dec3) % 2)
                result.ds = 1; //单
            else
                result.ds = 2;//双

            if (dec1 == dec2 || dec1 == dec3 || dec2 == dec3) {
                result.dxh = 3; //合
            } else {
                if (parseInt(dec3) > 4)
                    result.dxh = 1 //大
                else
                    result.dxh = 2;//小
            }

            return result;
        };

        /**
        * 绘制开奖结果列表
         */
        var drawList = function (list) {
            var $tbody = $("#list_lottery");
            $tbody.html("");
            $.each(list, function (index, row) {
                var $tr = createRow(row);
                $tbody.append($tr);
            })

        };
        /**
         * 创建列表行
         * @param {*} row 
         */
        var createRow = function (row) {
            var $tr = $('<tr>\
                <td class="table-one">\
                    <span class="time">'+ row.time + '</span>\
                </td>\
                <td class="table-two">\
                    <span class="dxh-1">&nbsp;</span>\
                    <span class="dxh-2">&nbsp;</span>\
                    <span class="dxh-3">&nbsp;</span>\
                </td>\
                <td class="table-thr">\
                    <span class="ds-1">&nbsp;</span>\
                    <span class="ds-2">&nbsp;</span>\
                </td>\
            </tr>');
            $tr.find(".dxh-" + row.result.dxh).html("<em></em>");
            $tr.find(".ds-" + row.result.ds).html("<em></em>");
            return $tr;
        };
    }
}

/**交易 */
BINEX.trade = {

    /**下单 */
    order: function ($ele, amount) {
        var type = $ele.data("type");
        var result = BINEX.trade.checkTypesNums(type, amount);
        if (result == 1) {
            BINEX.dialog.msg("此类型本期竟猜次数已超出限制,无法竟猜!");
            return;
        }
        if (result == 2) {
            BINEX.dialog.msg("此类型本期竟猜金额已超出限制,无法竟猜!");
            return;
        }
        var payout = $ele.data("payout");
        var userID = $("#order_userID").val();
        BINEX.ajax.post("/order", {
            userID: userID,
            accountID: $("#order_accountID").val(),
            symbolID: $("#order_symbolID").val(),
            tradeType: type,
            amount: amount,
            payout: payout,
            tradeMode: 0,
            isredPacket: 0,
            ip: '',
            source: 1
        }, function (d) {
            if (d.code == 0) {
                var addPrice = $("#addMusic")[0];
                addPrice.play();
                bet($ele);
                BINEX.trade.changeTypeStatus();
                //获取用户余额
                BINEX.trade.getUserBalance(userID);
            } else {
                BINEX.dialog.msg(d.msg);
            }
        })

        /**下注 */
        var bet = function ($ele) {
            var cmList = [{ num: 20, cmImg: "./public/images/cm1.png", footImg: "./public/images/foot1.png" }, { num: 100, cmImg: "./public/images/cm2.png", footImg: "./public/images/foot2.png" }, { num: 500, cmImg: "./public/images/cm3.png", footImg: "./public/images/foot3.png" }, { num: 1000, cmImg: "./public/images/cm4.png", footImg: "./public/images/foot4.png" }];
            var addcar = $ele,
                offset = $ele.offset(),
                ids = addcar.attr("data-id"),
                cm = $(".cm-list li.on"),
                startOffset = cm.offset(),
                cmId = cm.attr('data-id'),
                cmImg = cmList[cmId - 1].cmImg,
                num = cmList[cmId - 1].num;
            var flyer = $('<img  style="z-index:111" class="u-flyer" src="' + cmImg + '">');
            flyer.fly({
                start: {
                    left: startOffset.left,
                    top: startOffset.top
                },
                end: {
                    left: offset.left + 10,
                    top: offset.top + 10,
                    width: 0,
                    height: 0
                },
                onEnd: function () {
                    var left = Math.ceil(Math.random() * 9);
                    var top = Math.ceil(Math.random() * 5);
                    var newPrice = $ele.find("p.newz");
                    $ele.find(".cmList ul").append("<li style='left:" + left * 5 + "px;top:" + top * 6 + "px'><img src='" + cmImg + "' /></li>");
                    if (newPrice.html() == "&nbsp;") {
                        $ele.find(".newz").html("已下注<em>" + num + "</em>元");
                    } else {
                        $ele.find(".newz em").html(parseInt($ele.find(".newz em").html()) + num);
                    }
                }
            });

        }
    },
    /**获取商品列表 */
    getSymbolList: function () {
        BINEX.ajax.getJSON("/symbolList", {}, function (d) {
            if (d.code == 0) {
                var list = d.data.list;
                $("#symbol_list").html("");
                if (list) {
                    $.each(list, function (key, row) {
                        $("#symbol_list").append(createRow(row));
                    })
                }

                $(".btn-trade").on("click", function () {
                    var symbolID = $(this).find("a").data("id");
                    var investBase = $(this).data("investbase");
                    window.location.href = "trade.html?symbolID=" + symbolID + "&investBase=" + investBase;
                });
            }
        })

        var createRow = function (row) {
            var btnClass = row.enable == 1 ? "btn-trade" : "btn-trade-disenable";
            var shade = row.enable == 1 ? "<span>&nbsp;</span>" : "";
            var $row = $('<div class="symbol-item" data-id="' + row.symbolID + '" data-name="' + row.symbolName + '">' +
                '<div class="main-logo fl">' +
                '<img src="./public/images/btblogo.png" />' +
                '</div>' +
                '<div class="main-price fl">' +
                '   <span><span class="price-int"></span>.<em class="price-dec"></em></span>' +
                '</div>' +
                '<div class="main-btn fl ' + btnClass + ' " data-investbase="' + row.investBase + '">' +
                // ' <input type="button" value="开始竞猜 >>" data-id="' + row.symbolID + '"  />' +
                '<a href="javascript:;" data-id="' + row.symbolID + '"><img src="./public/images/ksjc.png" /></a>' +
                shade +
                '</div>' +
                '<div class="clear"></div>' +
                ' </div>')


            return $row;
        }
    },

    /**获取商品交易模式 */
    getSymbolDetail: function () {

        BINEX.ajax.getJSON("/symbolDetail", { symbolID: 1 }, function (d) {
            if (d.code == 0) {
                var list = d.data;
                $(".trade-type-dxh").html("");
                $(".trade-type-d").html("");
                $(".trade-type-s").html("");
                if (list) {
                    $.each(list, function (key, row) {
                        if (row.tradeTypeID == '1003') {
                            $(".trade-type-d").append(createRow(row));
                        } else if (row.tradeTypeID == '1004') {
                            $(".trade-type-s").append(createRow(row));
                        }
                        else {
                            $(".trade-type-dxh").append(createRow(row));
                        }
                    })
                }
                $(".trade-type-dxh").append("<div class='clear'></div>")

                //下单
                $(".ds-list").on("click", function () {
                    var amount = $(".bet-amount li.on").find("span").text();
                    BINEX.trade.order($(this), amount);

                }).on("mousedown", function () {
                    $(this).parent().removeClass("yellow").addClass("red");
                }).on("mouseup", function () {
                    $(this).parent().removeClass("red").addClass("yellow");
                });
                BINEX.trade.changeTypeStatus();
            }
        })

        var createRow = function (row) {
            var payout = parseFloat(row.payout / 100) + parseFloat(1);
            row.tradeTypeName = row.tradeTypeName == "单" ? "單" : row.tradeTypeName == "双" ? "雙" : row.tradeTypeName;
            var $row = $(`<div class="ds-list" data-id="${row.tradeTypeID}" data-value="${row.tradeTypeName}" data-type="${row.tradeTypeID}" data-payout="${row.payout}" 
                          data-minpos="${row.minPos}" data-maxPos="${row.maxPos}" data-posTotal="${row.posTotal}" data-maxTradesNum="${row.maxTradesNum}" > 
                            <b>${row.tradeTypeName}</b>
                            <p>1賠${payout}倍</p>
                            <p class="newz">&nbsp;</p>
                            <div class='cmList'>
                                <ul></ul>
                            </div> 
                         </div>`)
            return $row;
        }
    },

    /**获取中奖次数、本月排名*/
    getWinningInfo: function (userID) {
        BINEX.ajax.getJSON('/winingInfo', { userID: userID }, function (d) {
            if (d.code == 0) {
                var data = d.data;
                $("#wining_num").text(data.num);
                $("#wining_ranking").text(data.ranking);
            } else {

            }
        })
    },

    /**获取用户余额 */
    getUserBalance: function (userID) {
        BINEX.ajax.getJSON('/userBalance', { userID: userID }, function (d) {
            if (d.code == 0) {
                //$("#balance").text(d.data.balance);
                BINEX.trade.tween(parseFloat($("#balance").text()).toFixed(2), parseFloat(d.data.balance).toFixed(2))
            }
        })
    },

    tween: function (oldValue, newValue) {

        var tween = new TWEEN.Tween({ balance: oldValue }).to({
            balance: newValue
        }, 2000).onUpdate(function (t) {
            $("#balance").text(t.balance.toFixed(2));
        }).start();

        animate();
        function animate() {
            if (TWEEN.update()) {
                requestAnimationFrame(animate)
            }
        }
    },

    /**根据下单金额 改变竟猜类型的是否可下单的状态*/
    changeTypeStatus: function () {
        var price = parseInt($(".jj-price").text());
        var $types = $(".czbox-list-con");
        $types.each(function () {
            var $ele = $(this);
            var minPos = $ele.data("minpos");
            var maxPos = $ele.data("maxpos");
            if (price < parseInt(minPos) || price > parseInt(maxPos)) {
                $ele.removeClass("yellow red").addClass("grey");
            } else {
                $ele.removeClass("grey").addClass("yellow");
            }
        })
    },

    /**检查下单次数 与下单金额*/
    checkTypesNums: function (type, amount) {
        var $type = $(".czbox-list-con[data-type='" + type + "']");
        var posTotal = $type.data("postotal");
        var maxNums = $type.data("maxtradesnum");

        var $jgs = $(".jcjg").find("span[data-type='" + type + "']");
        if (maxNums == $jgs.length) {
            return 1;
        }
        var sumAmount = 0;
        $jgs.each(function () {
            sumAmount += parseInt($(this).data("amount"));
        })
        if (sumAmount + parseInt(amount) > posTotal) {
            return 2;
        }

        return 0;
    },

    /**获取竟猜榜单 */
    getRanking: function () {
        BINEX.ajax.getJSON('/ranking', {}, function (d) {
            if (d.code == 0) {
                var list = d.data.list;
                $('#bd-list').html('');
                if (list.length > 0) {
                    $.each(list, function (index, row) {
                        var username = row.username.slice(0, 3) + "****" + row.username.slice(7, 11);
                        var profit = parseFloat(row.profit).toFixed(0);
                        $("#bd-list").append(createRow(username, profit));
                    })
                }
            } else {

            }
        })

        var createRow = function (username, profit) {
            var $tr = $(`<li><div class="bd-li"><span>${username}</span><span class="fr">${profit}</span><div class="clear"></div></div></li>`);
            return $tr;
        }
    },




}

/**代理 */
BINEX.proxy = {
    /**初始 */
    init: function () {
        BINEX.ajax.getJSON("/brokerageCount", {}, function (d) {
            if (d.code == 0) {
                var data = d.data;
                //推广客户数
                var lowerAgent = data.lowerAgent;
                $("#levelSum").text(lowerAgent);
                //竟猜金额
                var orderAmount = data.orderAmount;
                $("#orderAmount").text(orderAmount);
                //今日佣金
                var brokerageToday = data.brokerageToday;
                $("#brokerageToday").text(brokerageToday);
                //佣金总额
                var brokerageSum = data.brokerageSum;
                $("#brokerageSum").text(brokerageSum);

            } else {
                BINEX.dialog.msg(d.msg)
            }
        })
        this.getBrokerageDetail();
    },
    /**获取佣金明细 */
    getBrokerageDetail: function () {
        BINEX.ajax.getJSON("/brokerageDetail", {}, function (d) {
            if (d.code == 0) {
                var list = d.data;
                if (list && list.length > 0) {
                    var $tbody = $("#brokerageDetail");
                    $.each(list, function (index, row) {
                        var $tr = createRow(row);
                        $tbody.append($tr);
                    })
                    $(".daili-p").show();
                } else {
                    $(".daili-p").hide();
                }
            } else {
                BINEX.dialog.msg(d.msg)
            }
        })

        var createRow = function (row) {
            var $tr = $("<tr>" +
                "<td>" + row.date + "</td>" +
                "<td>" + row.userID + "</td>" +
                // "<td>" + row.amount + "</td>" +
                "<td class='red'>" + row.brokerage + "</td>" +
                "</tr>");
            return $tr;
        }
    }
}

/**工具包 */
BINEX.utils = {

    /*
     *设置缓存 
     *@param key 键 唯一
     *@param value 值
     *@param 过期时间 单位秒-s;小时-h;天-d; 默认一天 1d
     */
    setCookie: function (key, value, times) {
        var d = new Date();
        var millisec = 24 * 60 * 60 * 1000;
        if (times != undefined) {
            millisec = this.converToMillisec(times);
        }
        d.setTime(d.getTime() + millisec);
        document.cookie = key + "=" + escape(value) + ";expires=" + d.toGMTString();
    },
    /*
     *获取缓存
     *@key 键
     */
    getCookie: function (key) {
        var arr = document.cookie.match(new RegExp("(^| )" + key + "=([^:]*)(;|$)"));
        return arr != null ? unescape(arr[2]) : null;
    },
    /*
     *删除缓存
     *@key 键
     */
    removeCookie: function (key) {
        var d = new Date();
        d.setTime(d.getTime() - 1);
        var value = this.getCookie(key);
        if (value != null) {
            document.cookie = key + "=" + value + ";expires=" + d.toGMTString();
        }
    },
    /*
     * 时间转换成毫秒
     * @times 过期时间 单位秒-s;小时-h;天-d; 如:2h 表示2小时 
     */
    converToMillisec: function (times) {
        var unit = times.substring(times.length - 1, 1);
        var time = times.substring(0, times.length - 1) * 1;
        switch (unit) {
            case "s":
                time = time * 1000;
                break;
            case "h":
                time = time * 60 * 60 * 1000;
                break;
            case "d":
                time = time * 24 * 60 * 60 * 1000;
                break;
            default:
                time = 24 * 60 * 60 * 1000;
                break;
        }
        return time;
    },

    /*
    * utf8字符转换为base-64编码格式
    * @param str 字符
    */
    utf8ToBase64: function (str) {
        return window.btoa(unescape(encodeURIComponent(str)));
    },
    /*
     * base-64编码格式转换为utf8字符
     * @param str base64编码格式字符
     */
    base64ToUtf8: function (str) {
        return decodeURIComponent(escape(window.atob(str)));
    },

    CheckPassWord : function (password) {//必须为字母加数字且长度8-20
    var str = password;
    if (str == null || str.length <8 || str.length>20) {
        return false;
    }
    var reg1 = new RegExp(/^[0-9A-Za-z]+$/);
    if (!reg1.test(str)) {
        return false;
    }
    var reg = new RegExp(/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/);
    if (reg.test(str)) {
        return true;
    } else {
        return false;
    }
},


}