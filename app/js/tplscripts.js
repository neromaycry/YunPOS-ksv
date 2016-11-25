/**
 * Created by gjwlg on 2016/9/10.
 */
//保留两位小数
//功能：将浮点数四舍五入，取小数点后2位
function toDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    f = Math.round(x*100)/100;
    return f;
}

// 强制保留2位小数，如：2，会在2后面补上00.即2.00
function toDecimal2(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(x*100)/100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}

function fomatFloat(src,pos){
    return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
}

function ValidateFloat(e, pnumber){

    if (!/^\d+[.]?\d*$/.test(pnumber)){

        $(e).val(/^\d+[.]?\d*/.exec($(e).val()));

    }

    return false;

}

function ValidateFloat2(e, pnumber)
{
    if (!/^\d+[.]?[1-9]?$/.test(pnumber))
    {
        e.value = /\d+[.]?[1-9]?/.exec(e.value);
    }
    return false;
}

function ValidateNumber(e, pnumber){

    if (!/^\d+$/.test(pnumber)){

        $(e).val(/^\d+/.exec($(e).val()));

    }

    return false;

}

function myNumberic(e,len) {
    var obj=e.srcElement || e.target;
    var dot=obj.value.indexOf(".");//alert(e.which);
    len =(typeof(len)=="undefined")?2:len;
    var  key=e.keyCode|| e.which;
    if(key==8 || key==9 || key==46 || (key>=37  && key<=40))//这里为了兼容Firefox的backspace,tab,del,方向键
        return true;
    if (key<=57 && key>=48) { //数字
        if(dot==-1)//没有小数点
            return true;
        else if(obj.value.length<=dot+len)//小数位数
            return true;
    } else if((key==46) && dot==-1){//小数点
        return true;
    }
    return false;
}

//Create Time:  07/28/2011
//Operator:     刘政伟
//Description:  银行卡号Luhm校验

//Luhm校验规则：16位银行卡号（19位通用）:

// 1.将未带校验位的 15（或18）位卡号从右依次编号 1 到 15（18），位于奇数位号上的数字乘以 2。
// 2.将奇位乘积的个十位全部相加，再加上所有偶数位上的数字。
// 3.将加法和加上校验位能被 10 整除。

//方法步骤很清晰，易理解，需要在页面引用Jquery.js


//bankno为银行卡号 banknoInfo为显示提示信息的DIV或其他控件
function luhmCheck(bankno){
    var lastNum=bankno.substr(bankno.length-1,1);//取出最后一位（与luhm进行比较）

    var first15Num=bankno.substr(0,bankno.length-1);//前15或18位
    var newArr=new Array();
    for(var i=first15Num.length-1;i>-1;i--){    //前15或18位倒序存进数组
        newArr.push(first15Num.substr(i,1));
    }
    var arrJiShu=new Array();  //奇数位*2的积 <9
    var arrJiShu2=new Array(); //奇数位*2的积 >9

    var arrOuShu=new Array();  //偶数位数组
    for(var j=0;j<newArr.length;j++){
        if((j+1)%2==1){//奇数位
            if(parseInt(newArr[j])*2<9)
                arrJiShu.push(parseInt(newArr[j])*2);
            else
                arrJiShu2.push(parseInt(newArr[j])*2);
        }
        else //偶数位
            arrOuShu.push(newArr[j]);
    }

    var jishu_child1=new Array();//奇数位*2 >9 的分割之后的数组个位数
    var jishu_child2=new Array();//奇数位*2 >9 的分割之后的数组十位数
    for(var h=0;h<arrJiShu2.length;h++){
        jishu_child1.push(parseInt(arrJiShu2[h])%10);
        jishu_child2.push(parseInt(arrJiShu2[h])/10);
    }

    var sumJiShu=0; //奇数位*2 < 9 的数组之和
    var sumOuShu=0; //偶数位数组之和
    var sumJiShuChild1=0; //奇数位*2 >9 的分割之后的数组个位数之和
    var sumJiShuChild2=0; //奇数位*2 >9 的分割之后的数组十位数之和
    var sumTotal=0;
    for(var m=0;m<arrJiShu.length;m++){
        sumJiShu=sumJiShu+parseInt(arrJiShu[m]);
    }

    for(var n=0;n<arrOuShu.length;n++){
        sumOuShu=sumOuShu+parseInt(arrOuShu[n]);
    }

    for(var p=0;p<jishu_child1.length;p++){
        sumJiShuChild1=sumJiShuChild1+parseInt(jishu_child1[p]);
        sumJiShuChild2=sumJiShuChild2+parseInt(jishu_child2[p]);
    }
    //计算总和
    sumTotal=parseInt(sumJiShu)+parseInt(sumOuShu)+parseInt(sumJiShuChild1)+parseInt(sumJiShuChild2);

    //计算Luhm值
    var k= parseInt(sumTotal)%10==0?10:parseInt(sumTotal)%10;
    var luhm= 10-k;

    if(lastNum==luhm){
        layer.msg('银行卡号输入完成', optLayerSuccess);
        return true;
    }
    else{
        //$("#banknoInfo").html("银行卡号必须符合Luhm校验");
        layer.msg('银行卡号必须符合Luhm校验', optLayerError);
        return false;
    }
}