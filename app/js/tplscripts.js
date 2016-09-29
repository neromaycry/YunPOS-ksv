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