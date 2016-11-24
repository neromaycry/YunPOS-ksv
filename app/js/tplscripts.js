/**
 * Created by gjwlg on 2016/9/10.
 */
//������λС��
//���ܣ����������������룬ȡС�����2λ
function toDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    f = Math.round(x*100)/100;
    return f;
}

// ǿ�Ʊ���2λС�����磺2������2���油��00.��2.00
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
    if(key==8 || key==9 || key==46 || (key>=37  && key<=40))//����Ϊ�˼���Firefox��backspace,tab,del,�����
        return true;
    if (key<=57 && key>=48) { //����
        if(dot==-1)//û��С����
            return true;
        else if(obj.value.length<=dot+len)//С��λ��
            return true;
    } else if((key==46) && dot==-1){//С����
        return true;
    }
    return false;
}

//Create Time:  07/28/2011
//Operator:     ����ΰ
//Description:  ���п���LuhmУ��

//LuhmУ�����16λ���п��ţ�19λͨ�ã�:

// 1.��δ��У��λ�� 15����18��λ���Ŵ������α�� 1 �� 15��18����λ������λ���ϵ����ֳ��� 2��
// 2.����λ�˻��ĸ�ʮλȫ����ӣ��ټ�������ż��λ�ϵ����֡�
// 3.���ӷ��ͼ���У��λ�ܱ� 10 ������

//�������������������⣬��Ҫ��ҳ������Jquery.js


//banknoΪ���п��� banknoInfoΪ��ʾ��ʾ��Ϣ��DIV�������ؼ�
function luhmCheck(bankno){
    var lastNum=bankno.substr(bankno.length-1,1);//ȡ�����һλ����luhm���бȽϣ�

    var first15Num=bankno.substr(0,bankno.length-1);//ǰ15��18λ
    var newArr=new Array();
    for(var i=first15Num.length-1;i>-1;i--){    //ǰ15��18λ����������
        newArr.push(first15Num.substr(i,1));
    }
    var arrJiShu=new Array();  //����λ*2�Ļ� <9
    var arrJiShu2=new Array(); //����λ*2�Ļ� >9

    var arrOuShu=new Array();  //ż��λ����
    for(var j=0;j<newArr.length;j++){
        if((j+1)%2==1){//����λ
            if(parseInt(newArr[j])*2<9)
                arrJiShu.push(parseInt(newArr[j])*2);
            else
                arrJiShu2.push(parseInt(newArr[j])*2);
        }
        else //ż��λ
            arrOuShu.push(newArr[j]);
    }

    var jishu_child1=new Array();//����λ*2 >9 �ķָ�֮��������λ��
    var jishu_child2=new Array();//����λ*2 >9 �ķָ�֮�������ʮλ��
    for(var h=0;h<arrJiShu2.length;h++){
        jishu_child1.push(parseInt(arrJiShu2[h])%10);
        jishu_child2.push(parseInt(arrJiShu2[h])/10);
    }

    var sumJiShu=0; //����λ*2 < 9 ������֮��
    var sumOuShu=0; //ż��λ����֮��
    var sumJiShuChild1=0; //����λ*2 >9 �ķָ�֮��������λ��֮��
    var sumJiShuChild2=0; //����λ*2 >9 �ķָ�֮�������ʮλ��֮��
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
    //�����ܺ�
    sumTotal=parseInt(sumJiShu)+parseInt(sumOuShu)+parseInt(sumJiShuChild1)+parseInt(sumJiShuChild2);

    //����Luhmֵ
    var k= parseInt(sumTotal)%10==0?10:parseInt(sumTotal)%10;
    var luhm= 10-k;

    if(lastNum==luhm){
        layer.msg('���п����������', optLayerSuccess);
        return true;
    }
    else{
        //$("#banknoInfo").html("���п��ű������LuhmУ��");
        layer.msg('���п��ű������LuhmУ��', optLayerError);
        return false;
    }
}