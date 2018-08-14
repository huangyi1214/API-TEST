var check_pass_word='';
var input_pass_word='';
var passwords = $('#password').get(0);
$(function(){
    var div = '<div id="key" style="width:100%;">' +
        '<ul id="keyboard" style="font-size:20px;margin:2px -2px 1px 2px"><li class="symbol">' +
        '<span class="off">1</span></li><li class="symbol"><span class="off">2</span></li>' +
        '<li class="symbol btn_number_"><span class="off">3</span></li>' +
        '<li class="tab"><span class="off">4</span></li><li class="symbol">' +
        '<span class="off">5</span></li><li class="symbol btn_number_">' +
        '<span class="off">6</span></li><li class="tab"><span class="off">7</span></li>' +
        '<li class="symbol"><span class="off">8</span></li><li class="symbol btn_number_">' +
        '<span class="off">9</span></li><li class="delete lastitem">删除</li><li class="symbol">' +
        '<span class="off">0</span></li><li class="cancle btn_number_">取消</li>' +
        '<div class="clear"></div></ul></div>';
    var character,index=0;
    $("input.pass").attr("disabled",true);
    $("#password").attr("disabled",true);
    $("#keyboardDIV").html(div);

    $('#keyboard li').click(function(){
        if ($(this).hasClass('delete')) {
            $(passwords.elements[--index%6]).val('');
            if($(passwords.elements[0]).val()==''){
                index = 0;
            }
            return false;
        }
        if ($(this).hasClass('cancle')) {
            //parentDialog.close();
            $("#password input").val("");
            index = 0;
            return false;
        }
        if ($(this).hasClass('symbol') || $(this).hasClass('tab')){
            character = $(this).text();
            $(passwords.elements[index++%6]).val(character);
            if($(passwords.elements[5]).val()!=''){
                index = 0;
            }
            if($(passwords.elements[5]).val()!='') {
                var temp_rePass_word = '';
                for (var i = 0; i < passwords.elements.length; i++) {
                    temp_rePass_word += $(passwords.elements[i]).val();
                }
                if (input_pass_word=='')
                {
                    input_pass_word=temp_rePass_word;
                }
                else
                {
                    check_pass_word = temp_rePass_word;

                }
                //$("#key").hide();
                var setpsw=$("#issetaccountpassword").val();
                if (setpsw==0)
                {
                    if (check_pass_word=='')
                    {
                        $("#password input").val("");
                        $("#pswTitle").text("请再次输入资金密码");
                    }
                    else
                    {
                        if (input_pass_word!=check_pass_word)
                        {
                            input_pass_word='';
                            check_pass_word='';
                            $("#pswTitle").text("请设置资金密码");
                            $("#password input").val("");
                            BINEX.dialog.msg("兩次密碼不相同");
                        }
                        else
                        {
                            BINEX.ajax.post("/SetJzPwd", { PWD: input_pass_word }, function (d) {
                                if (d.code == 0) {
                                    input_pass_word='';
                                    check_pass_word='';
                                    $("#password input").val("");

                                    BINEX.dialog.msg("资金密码设置成功");
                                    setTimeout("window.location.reload()",2000);
                                } else {
                                    BINEX.dialog.msg(d.msg);
                                }
                            })
                        }
                    }
                }
                else
                {

                    BINEX.ajax.post("/Withdraw", {
                        password: input_pass_word,
                        price:price,
                        presentid:presentid
                    }, function (d) {
                        console.log('兑换返回信息:'+JSON.stringify(d));
                        if (d.code==0)
                        {
                            BINEX.dialog.msg("兑换成功,兑换码已发送至您的手机");
                            setTimeout("window.location.reload()",2000);
                        }
                        else
                        {
                            input_pass_word='';
                            check_pass_word='';
                            $("#password input").val("");

                            BINEX.dialog.msg(d.msg);
                            setTimeout("window.location.reload()",2000);
                        }
                        // $(".box-tx, .pwd-content, .txbox").hide();

                    })



                }

            }
        }
        return false;
    });
});