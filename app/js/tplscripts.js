/**
 * Created by gjwlg on 2016/9/10.
 */
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

function ValidateFloat(e, pnumber){

    if (!/^\d+[.]?\d*$/.test(pnumber)){

        $(e).val(/^\d+[.]?\d*/.exec($(e).val()));

    }

    return false;

}

function ValidateNumber(e, pnumber){

    if (!/^\d+$/.test(pnumber)){

        $(e).val(/^\d+/.exec($(e).val()));

    }

    return false;

}