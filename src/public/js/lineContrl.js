 var markP = [];
 var markL = [];
 var xmax;
 var ymax;
 var echart_right = 50;//echart表格距离右边的额距离
 var myChart;
var datas =[[1506392220000,1310.31,1310.58,1310.31,1310.58,0], [1506392280000,1310.55,1310.65,1310.28,1310.39,0], [1506392340000,1310.36,1310.56,1310.30,1310.56,0], [1506392400000,1310.54,1310.84,1310.17,1310.30,0], [1506392460000,1310.30,1310.34,1310.20,1310.28,0], [1506392520000,1310.28,1310.41,1310.21,1310.40,0], [1506392580000,1310.40,1310.41,1310.25,1310.26,0], [1506392640000,1310.20,1310.22,1310.11,1310.11,0], [1506392700000,1310.13,1310.31,1310.10,1310.18,0], [1506392760000,1310.20,1310.20,1310.02,1310.04,0], [1506392820000,1310.03,1310.13,1309.97,1310.13,0], [1506392880000,1310.13,1310.32,1310.06,1310.22,0], [1506392940000,1310.22,1310.33,1310.18,1310.31,0], [1506393000000,1310.26,1310.62,1310.26,1310.51,0], [1506393060000,1310.42,1310.47,1310.28,1310.38,0], [1506393120000,1310.41,1310.41,1310.21,1310.21,0], [1506393180000,1310.24,1310.24,1310.08,1310.14,0], [1506393240000,1310.14,1310.14,1309.98,1310.03,0], [1506393300000,1310.04,1310.15,1309.98,1310.14,0], [1506393360000,1310.13,1310.16,1310.05,1310.11,0], [1506393420000,1310.15,1310.21,1310.07,1310.14,0], [1506393480000,1310.14,1310.15,1310.06,1310.13,0], [1506393540000,1310.13,1310.22,1310.08,1310.13,0], [1506393600000,1310.14,1310.21,1310.09,1310.12,0], [1506393660000,1310.13,1310.27,1310.13,1310.24,0], [1506393720000,1310.24,1310.43,1310.22,1310.43,0], [1506393780000,1310.40,1310.43,1310.22,1310.24,0], [1506393840000,1310.24,1310.24,1310.06,1310.11,0], [1506393900000,1310.13,1310.24,1310.07,1310.13,0], [1506393960000,1310.13,1310.14,1310.03,1310.05,0], [1506394020000,1310.04,1310.13,1309.91,1309.91,0], [1506394080000,1309.91,1310.00,1309.89,1309.94,0], [1506394140000,1309.88,1310.16,1309.88,1310.15,0],[1506394200000,1310.15,1310.16,1310.01,1310.01,0], [1506394260000,1309.97,1310.06,1309.97,1310.03,0], [1506394320000,1310.02,1310.27,1310.01,1310.23,0], [1506394380000,1310.21,1310.26,1310.03,1310.14,0], [1506394440000,1310.13,1310.39,1310.11,1310.34,0], [1506394500000,1310.34,1310.61,1310.34,1310.56,0],[1506394560000,1310.63,1310.66,1310.33,1310.41,0], [1506394620000,1310.42,1310.72,1310.39,1310.53,0], [1506394680000,1310.52,1310.60,1310.49,1310.53,0], [1506394740000,1310.53,1310.72,1310.53,1310.67,0], [1506394800000,1310.70,1310.72,1310.54,1310.59,0], [1506394860000,1310.57,1310.63,1310.49,1310.51,0],[1506394920000,1310.52,1310.63,1310.50,1310.53,0], [1506394980000,1310.53,1310.60,1310.39,1310.56,0], [1506395040000,1310.63,1310.65,1310.48,1310.51,0], [1506395100000,1310.51,1310.76,1310.51,1310.76,0], [1506395160000,1310.74,1310.91,1310.71,1310.91,0], [1506395220000,1310.83,1310.93,1310.71,1310.81,0], [1506395280000,1310.83,1310.83,1310.73,1310.74,0], [1506395340000,1310.74,1310.74,1310.57,1310.71,0], [1506395400000,1310.73,1310.86,1310.71,1310.76,0], [1506395460000,1310.76,1310.76,1310.68,1310.72,0], [1506395520000,1310.72,1310.74,1310.65,1310.74,0], [1506395580000,1310.74,1310.74,1310.58,1310.68,0], [1506395640000,1310.68,1310.71,1310.56,1310.71,0], [1506395700000,1310.71,1311.02,1310.67,1311.02,0], [1506395760000,1311.02,1311.02,1310.77,1310.80,0], [1506395820000,1310.80,1311.05,1310.80,1310.91,0], [1506395880000,1310.91,1311.13,1310.91,1311.11,0], [1506395940000,1311.10,1311.16,1310.97,1311.10,0], [1506396000000,1311.09,1311.23,1310.87,1311.23,0], [1506396060000,1311.22,1311.22,1310.99,1311.03,0], [1506396120000,1311.03,1311.03,1310.92,1310.92,0], [1506396180000,1310.93,1310.93,1310.84,1310.90,0], [1506396240000,1310.94,1311.03,1310.89,1310.93,0], [1506396300000,1310.92,1310.95,1310.88,1310.94,0], [1506396360000,1310.95,1311.05,1310.92,1311.00,0], [1506396420000,1311.00,1311.11,1310.96,1311.09,0], [1506396480000,1311.11,1311.21,1310.99,1311.03,0], [1506396540000,1311.05,1311.13,1310.91,1310.95,0], [1506396600000,1310.95,1311.12,1310.91,1310.94,0], [1506396660000,1310.94,1311.02,1310.91,1310.94,0], [1506396720000,1310.94,1311.03,1310.88,1310.92,0], [1506396780000,1310.92,1310.95,1310.80,1310.80,0], [1506396840000,1310.78,1310.81,1310.65,1310.74,0], [1506396900000,1310.73,1310.81,1310.67,1310.80,0]];
var markets = datas;
 var _linetype = "Kline";
var LastTimestamp = 0;
var priceLast = 0;
$(function(){
    myChart = echarts.init(document.getElementById('main'));
    marketList(markets,_linetype);
});
 function toDecimal(v) {
     var num = parseInt($("#float_num").val());
     var f = parseFloat(v);
     if (isNaN(f)) {
         return v;
     }
     var num1 = Math.pow(10, num);
     f = Math.round(v * num1) / num1;
     var s = f.toString();
     var rs = s.indexOf('.');
     if (rs < 0) {
         rs = s.length;
         s += '.';
     }
     while (s.length <= rs + num) {
         s += '0';
     }
     return s;
 }
    function calculateMA(dayCount, data) {
        var result = [];
        for (var i = 0, len = data.length; i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < dayCount; j++) {
                sum += data[i - j][1];
            }
            result.push((sum / dayCount).toFixed(2));
        }
        return result;
    }
    var dates = [];
    var data = [];
     var dataMA5 = calculateMA(5, data);
    var dataMA10 = calculateMA(10, data);
    var dataMA20 = calculateMA(20, data);

    //折线图
    function marketList(datas, _linetype) {
        data_trade = [];
        dates = [];
        data = [];
        if (_linetype == "line") {
            for (var i = 0; i < datas.length; i++) {
                var nowTime = datas[i][0];
                var newTime = nowTime.toString();
                if (nowTime == null) {
                    continue;
                }
                var item = {
                    name:  datas[i][0],
                    value: [
                        datas[i][0],
                        datas[i][1]
                    ]
                };
                data_trade.push(item);
            }
        } else{
            for (var i = 48; i < datas.length; i++) {
                dates.push(formatDate(datas[i][0]));
                data.push([datas[i][1], datas[i][4], datas[i][3], datas[i][2]]);
            }
            dataMA5 = calculateMA(5, data);
            dataMA10 = calculateMA(10, data);
            dataMA20 = calculateMA(20, data);
        }

        xmax = datas[datas.length - 1][0];
        ymax = datas[datas.length - 1][1];

        var option;
        if (_linetype == "line") {
            option = GetLineOption();
        }
        else{
            option = GetKlineOption();
        }
        // 使用刚指定的配置项和数据显示图表。
        if (option && typeof option === "object") {
            myChart.setOption(option,true);
        }
    }
     function formatDate(needTime) {
     var time = new Date(needTime);
     var y = time.getFullYear();
     var m = time.getMonth()+1;
     var d = time.getDate();
     var h = time.getHours();
     var mm = time.getMinutes();
     var s = time.getSeconds();
     return add0(h)+':'+add0(mm);
 }
 function add0(m){return m<10?'0'+m:m }


 function GetLineOption() {
        var option = {
            grid: {
                left: 10,
                right: 60,
                bottom: 30,
                top: 0
            },
            xAxis: {
                type: 'time',
                splitNumber: 5,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: "rgb(155,155,155)"
                    },
                    interval: function (index, value) {
                        return true
                    }
                },
                axisLine: {
                    show : false,
                    lineStyle: {
                        color: '#eaeaea',
                        type: 'solid',
                        width: 1
                    }
                },
                axisTick: {
                    show: true,
                    lineStyle: {
                        color: 'rgb(62,72,85)',
                        type: 'solid',
                        width: 1
                    }
                },
                splitLine: {
                    show: true,
                    interval: 100,
                    lineStyle: {
                        color: '#a4a4a9',
                        type: 'dotted',
                        width: 1
                    }
                }
            },
            yAxis: [{
                type: 'value',
                scale: true,
                show: true,
                position: 'right',
                splitNumber: 5,
                boundaryGap: [0.01, 0.01],
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: true,
                    lineStyle: {
                        color: '#a4a4a9',
                        type: 'solid',
                        width: 1
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#a4a4a9',
                        type: 'dotted',
                        width: 1
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: "rgb(155,155,155)"
                    },
                    formatter: function (value, index) {

                        return fiveFloat(value).join('.');
                    },
                    interval: function (index, value) {
                        return true
                    }
                }
            }],
            series: [{
                name: '数据',
                type: 'line',
                symbol: true,
                showSymbol: false,
                symbolSize: 0,
                hoverAnimation: false,
                data: data_trade,
                itemStyle: {//折线拐点标志的样式。
                    normal: {
                        color: '#fff',
                        type: 'solid',
                        borderWidth: 1,
                        lineStyle: {
                            type: 'solid',
                            width: 1
                        }
                    }

                },
                markPoint: {
                    show: true,
                    data: (function () {
                        var aar = [{
                            name: '点',
                            symbol: 'emptyCircle',
                            symbolSize: 5,
                            coord: [xmax, ymax],
                            label: {
                                normal: {
                                    show: false
                                }
                            }
                        }];
                        // alert(markP.length)

                        if (markP.length <= 0) {
                            return aar;
                        } else {
                            return aar.concat(markP);
                        }
                    })()
                },
                markLine: {
                    symbol: ['none', 'none'],
                    precision: 5,
                    data: (function () {
                        var axisy = [{
                            yAxis: ymax,
                            xAxis: 0,
                            value: ymax,
                            label: {
                                normal: {
                                    formatter: function (data) {
                                        return fiveFloat(ymax).join('.');
                                    }
                                }
                            },
                            lineStyle: {
                                normal: {
                                    color: "#007aff"
                                }
                            }
                        }];
                        if (markL.length <= 0) {
                            return axisy;
                        } else {
                            return axisy.concat(markL);
                        }
                    })(),
                    animation: false,

                }
            }]
        };
        return option;
    }

 function GetKlineOption() {
     var option = {
         animation: true,
         //backgroundColor: '#fff',
         xAxis: [{
             type: 'category',
             splitNumber: 5,
             data: dates,
             boundaryGap: true,
             axisLine: {
                 show: false,
                 lineStyle: {
                     color: 'rgb(62,72,85)',
                     type: 'dotted',
                     width: 1
                 }
             },
             axisLabel : {
                 textStyle : {
                     color: "#f0f0f0"
                 }
             },
             axisTick: {
                 show: true,
                 lineStyle: {
                     color: 'rgb(62,72,85)',
                     type: 'solid',
                     width: 1
                 }
             },
             splitLine: {
//                    show: true,
//                    interval: 100,
//                    lineStyle: {
//                        color: 'rgb(62,72,85)',
//                        type: 'dotted',
//                        width: 1
//                    }
                 show: false,
                 lineStyle: {
                     color: 'rgb(62,72,85)',
                     type: 'dotted',
                     width: 1
                 }
             },
             min: 'dataMin',
             max: 'dataMax'
         }, {
             type: 'category',
             gridIndex: 1,
             data: dates,
             scale: true,
             boundaryGap: false,
             splitLine: {show: false},
             axisLabel: {show: false},
             axisTick: {show: false},
             axisLine: {show: false},
             splitNumber: 5,
             min: 'dataMin',
             max: 'dataMax'
         }],
         yAxis: [{
             scale: true,
             show: true,
             position: 'right',
             splitNumber: 5,
             axisLine: {
                 show: true,
                 lineStyle: {
                     color: 'rgb(62,72,85)',
                     type: 'dotted',
                     width: 1
                 }
             },
             splitLine: {
                 show: true,
                 lineStyle: {
                     color: 'rgb(62,72,85)',
                     type: 'dotted',
                     width: 1
                 },
             },
             axisTick: {
                 show: false,
                 lineStyle: {
                     color: 'rgb(62,72,85)',
                     type: 'solid',
                     width: 1
                 }
             },
             axisLabel: {
                 show: true,
                 textStyle: {
                     color: "#f0f0f0"
                     //color: "rgb(155,155,155)"
                 },
                 //formatter: function (value, index) {
                     //return toDecimal(value);
//                        return twoFloat(value).join('.');
//                 },
//                 interval: function (index, value) {
//                     return true
//                 }
             }
         }, {
             scale: true,
             gridIndex: 1,
             splitNumber: 2,
             axisLabel: {show: false},
             axisLine: {show: false},
             axisTick: {show: false},
             splitLine: {show: false}
         }],
//        dataZoom: [
//            {
//                type: 'inside',
//                xAxisIndex: [0],
//                start: 50,
//                end: 100
//            }
//        ],
         //grid: {
         //    left: 10,
         //    right: 60,
         //    bottom: 30,
         //    top: 30
         //},
         grid: [{
             left: 0,
             right: 60,
             bottom: 30,
             top: 10
         }, {
             left: 0,
             right: 60,
             bottom: 30,
             top: 10
         }],
         series: [{
             type: 'candlestick',
             name: 'Kline',
             symbol: true,
             showSymbol: false,
             symbolSize: 0,
             hoverAnimation: false,
             itemStyle: {
                 normal: {
                     color: '#FD1050',
                     color0: '#0CF49B',
                     borderColor: '#FD1050',
                     borderColor0: '#0CF49B'
                 }
             },
             data: data,
             markPoint: {
                 show: true,
                 data: (function () {
                     var aar = [{
                         name: '点',
                         symbol: 'emptyCircle',
                         symbolSize: 5,
                         coord: [xmax, ymax],
                         label: {
                             normal: {
                                 show: false
                             }
                         }
                     }];

                     if (markL.length <= 0) {
                         return aar;
                     } else {
                         return aar.concat(markL);
                     }
                 })()
             },
             markLine: {
                 symbol: ['none', 'none'],
                 precision: 5,
                 data: (function () {
                     var axisy = [{
                         yAxis: ymax,
                         xAxis: 0,
                         value: ymax,
                         label: {
                             normal: {
                                 formatter: function (data) {

                                 }
                             }
                         },
                         lineStyle: {
                             normal: {
                                 color: "#007aff"
                             }
                         }
                     }];
                     if (markL.length <= 0) {
                         return axisy;
                     } else {
                         return axisy.concat(markL);
                     }
                 })(),
                 animation: false
             }
         }, {
             name: 'MA5',
             type: 'line',
             data: dataMA5,
             smooth: true,
             showSymbol: false,
             lineStyle: {
                 normal: {
                     width: 1
                 }
             }
         }, {
             name: 'MA10',
             type: 'line',
             data: dataMA10,
             smooth: true,
             showSymbol: false,
             lineStyle: {
                 normal: {
                     width: 1
                 }
             }
         }, {
             name: 'MA20',
             type: 'line',
             data: dataMA20,
             smooth: true,
             showSymbol: false,
             lineStyle: {
                 normal: {
                     width: 1
                 }
             }
         }]
     };
     return option;
 }

  function fiveFloat(param){
     var param = param+'';
     var strarr = param.split('.');
     if (strarr.length <= 1) {
         strarr.push('00000');
     } else if (strarr[1].length >= 5) {
         strarr[1] = (strarr[1]+'').substr(0,5);
     } else if (strarr[1].length < 5||strarr[1].length > 0) {
         if(strarr[1].length==1){
             strarr[1] = strarr[1]+'0000';
         } else if(strarr[1].length==2){
             strarr[1] = strarr[1]+'000';
         } else if(strarr[1].length==3){
             strarr[1] = strarr[1]+'00';
         } else if(strarr[1].length==4){
             strarr[1] = strarr[1]+'0';
         }

     }
     return strarr;
 }
