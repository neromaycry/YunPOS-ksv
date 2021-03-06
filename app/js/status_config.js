/**
 * Created by lyting on 16-6-28.
 */
window.statusCode = {
    "00": "交易成功",
    "11": "失败",
    "12": "旧卡卡号状态错误",
    "13": "新卡卡号状态错误",
    "14": "卡号已被注册",
    "15": "手机号已被注册",
    "16": "卡号无效状态",
    "17": "查询不到会员信息",
    "20": "参数无效",
    "21": "余额不足",
    "22": "退款金额超限",
    "23": "请求退款的交易被冻结",
    "24": "交易不存在",
    "25": "系统错误",
    "26": "交易已经完结",
    "27": "交易状态非法",
    "28": "退款金额无效",
    "29": "无权限使用接口",
    "30": "POS KEY填写错误",
    "31": "交易信息被篡改",
    "32": "交易已被支付",
    "33": "请以POST方式传入参数",
    "34": "请传入接口名称",
    "35": "请传入商户请求参数的签名串",
    "36": "请传入发送请求的时间", //'yyyy-MM-dd HH:mm:ss
    "37": "接口名未注册",
    "38": "此卡支付方式错误",
    "39": "退款失败",
    "40": "卡号不能为空",
    "41": "加密串不能为空",
    "42": "密码不能为空",
    "43": "商户交易单号不能为空",
    "44": "订单总金额不能为空",
    "45": "消费金额不能为空",
    "46": "商户原交易单号不能为空",
    "47": "退款金额不能为空",
    "48": "不是正确金额",
    "49": "终端号不能为空",
    "50": "当前无流水信息",
    "51": "读取打印小票模版错误",
    "52": "此卡状态异常",
    "53": "此卡不存在",
    "54": "此卡无效",
    "55": "密码错误",
    "56": "卡已过有效期",
    "57": "消费积分不能为空",
    "58": "门店未设置积分编码",
    "59": "此卡积分不足",
    "60": "账号密码不匹配",
    "61": "岗位权限不匹配",
    "62": "无此权限",
    "63": "参数错误",
    "64": "用户已停用",
    "65": "Token失效或已经过期",
    "66": "POS授权许可无效",
    "67": "token不允许为空",
    "68": "商品不存在"
};

window.AUTH_CODE = {
    'GRANTED': 0, // 无权限控制
    'COMMAND': 1, // 口令控制
    'CARD': 2  // 卡控制
};

window.API_URL = {
    "LOGIN": "/login",
    "SKU": "/sku",
    "KIND1": "/kind",
    "KIND2": "/kind",
    "BARGAINGOODS": "/kind",
    "ACCOUNT": "/account",
    "ACCOUNT_INFOR": "/account/infor",
    "ACCOUNT_PAY": "/account/pay",
    "ACCOUNT_REFUND": "/account/refund",
    "ACCOUNT_QUERY": "/account/query",
    "TRADE_CONFIRM": "/trade_confirm",
    "REFUND": "/refund",
    "ONLINEPAY_PAY": "/onlinepay/pay",
    "ONLINEPAY_QUERY": "/onlinepay/query",
    "ONLINEPAY_REFUND": "/onlinepay/refund",
    "INIT": "/init",
    "VIPINFO": "/vipinfo",
    "GATHER": "/gather",
    "SETTINGS": "/settings",
    "ONLINEBILL": "/onlinebill",
    "ACCOUNT_ICPWD": "/account/icpwd",
    "REPORT": "/report",
    "PRINT": "/print",
    "RETAIL_NO": "/retailno",
    "XFB_BILL_NO": "/xfbbillno",
    "WORKER": "/worker",
    'CASHIER_MONEY': '/casiermoney',
    'CASHIER_DKDJ': '/casierjkdj',
    'POS_CONF': '/posconf',
    'PASSWDCHANGE':'/passwdchange'
};

// 系统参数设置
window.system_config = {
    'IS_FIRST_KEY': 'IS_FIRST',
    "LOGIN_USER_KEY": "LOGIN_USER",
    "POS_INFO_KEY": "POS_INFO",
    "LOCAL_RECEIPT_KEY": "LOCAL_RECEIPT",
    "SETTING_DATA_KEY": "SETTING_DATA",
    "INIT_DATA_KEY": "INIT_DATA",
    "GATEWAY_KEY": "gateway",
    "POS_KEY": "pos_key",
    "TOKEN_KEY": "TOKEN",
    "STAMP_DATA_KEY": "STAMP_DATA",
    "BASE_DATA_KEY": "BASE_DATA",
    "HOME_KEY": "HOME_KEY",
    "SALEMENT_KEY": "SALEMENT_KEY",
    "VIP_KEY": "VIP",
    "KIND_DATA_KEY": "KIND_DATA",
    "GATHER_KEY": "GATHER",
    "SALE_PAGE_KEY": "SALE_PAGE",
    "RETURN_KEY": "RETURN",
    "FORCE_RETURN_KEY": "FORCE_RETURN",
    "RESTORDER_KEY": "RESTORDER_KEY",
    "ONE_CARD_KEY": "ONE_CARD_KEY",
    "SHORTCUT_KEY": "SHORTCUT_KEY",
    "SETTING_BASE_KEY": "SETTING_BASE_KEY",
    "IS_KEYBOARD_PLUGGED": "IS_KEYBOARD_PLUGGED",
    "LOGIN_DATE": "LOGIN_DATE",
    "RESTORDER_NUM": "RESTORDRE_NUM",
    "ORDER_NO_KEY": "ORDER_NO_KEY",
    "PRINTF": "PRINTF",
    "IS_CLIENT_SCREEN_SHOW": "IS_CLIENT_SCREEN_SHOW",
    "ODD_CHANGE": 'ODD_CHANGE_KEY',
    "LAST_PAGE": "LAST_PAGE",
    "POS_LIMIT": "POS_LIMIT",
    "INTERFACE_TYPE": "INTERFACE_TYPE",
    "POS_CONFIG": 'POS_CONFIG',
    "XFB_URL": 'XFB_URL'
};

window.DIRECTIVES = {
    "INIT": "INIT_",  //初始化
    "PRINTTEXT": "PRNT_",  //打印
    "OpenCashDrawer": "OpenCashbox_",  //开钱箱
    'ShutDown': 'shutdown_',  //关机
    'Bank_sale': 'bank_sale_',  //银行卡 消费
    'Bank_backout': 'bank_backout_',  //银行卡 当日撤销
    'Bank_refund': 'bank_refund_',  //银行卡 隔日退货
    'Bank_balance': 'bank_balance_', //银行卡 余额查询
    'Bank_reprint': 'bank_reprint_', //银行卡 重印最后一笔
    'Bank_signin': 'bank_signin_',  // 银行卡 签到
    'Bank_daily': 'bank_daily_',  //银行卡 日结
    'Bank_query': 'bank_query_',  // 银行卡 查询流水
    'IC_CARD_AUTO_READ': 'ic_card_auto_read_',
    'IC_CARD_MANUAL_READ': 'ic_card_manual_read_',
    'VERSION': 'version', // 获取webctrl的版本号
    'UPGRADE': 'upgrade_',
    'AD':'ad_'
};

/**
 * 从硬件传过来的消息
 * @type {{}}
 */
//window.HWMSG_CODE = {
//    "OnMCUInitialized":"01",
//    "OnScannerInitialized":"02",
//    "OnScannerConnectionStateChanged":"03"
//};

window.RESPONSE_TOOLS = {
    status_code: "00",
    is_success: function (status_code) {
        if (RESPONSE_TOOLS.status_code == status_code) {
            return true;
        }
        return false;
    }
};

window.PAGE_ID = {
    'LOGIN': 1,
    'MAIN': 2,
    'MEMBER': 3,
    'LAYER_SALESMAN': 4,
    'TIP_MEMBER': 5,
    'BILLING': 6,
    'SECONDLOGIN': 7,
    'RESTORDER': 8,
    'BILLING_RETURN': 9,
    'RETURN_FORCE': 10,
    'LAYER_BILLING_TYPE': 11,
    'LAYER_BILLING_ACCOUNT': 12,
    'LAYER_RETURN_DATE': 13,
    'LAYER_RT_BILLTYPE': 14,
    'LAYER_RT_BILLACCOUNT': 15,
    'SETDNS': 16,
    'SETPOSKEY': 17,
    'INITINFO': 18,
    "LAYER_LOGOUT": 19,
    'BILL_DISCOUNT': 20,
    'CHECKING': 21,
    'CONFIRM': 22,
    'LAYER_ECARD_LOGIN': 23,
    'LAYER_ECARD_PAY': 24,
    'RT_ONECARD_LOGIN': 25,
    'RT_LAYER_ECARD_PAY': 26,
    'LAYER_QUICK_PAY': 27,
    'LAYER_RESTORDER': 28,
    'ALIPAY': 29,
    'WECHAT': 30,
    'LAYER_REFERENCE_NUM': 31,
    'LAYER_ORDER_ID': 32,
    'RT_ALIPAY': 33,
    'RT_WECHAT': 34,
    'LAYER_RT_BANKCARD': 35,
    'RT_QP_ALIPAY': 36,
    'RT_QP_WECHAT': 37,
    'PRINT': 38,
    'RETURN_WHOLE': 39,
    'MODAL_MEMBER_CARD': 40,
    'MODAL_PHONENUM': 41,
    'LAYER_WITHDRAW': 42,
    'LAYER_PRICE_ENTRY': 43,
    'MODAL_GATEWAY': 44,
    'MODAL_POS': 45,//银行卡确认
    'LAYER_BANK_CARD': 46,
    'LOCKSCREEN': 47,
    "LAYER_MEMBER": 48,
    'LAYER_BANK_INSTRUCTION': 49,//银行业务
    'LAYER_CONFIRM': 50,
    'LAYER_HELP': 51,
    'LAYER_GATEWAY': 52,
    'LAYER_AUTHCOMMAND': 53,
    'LAYER_AUTHCARD': 54,
    'SETTING': 55,
    'LAYER_TIP': 56,
    'LAYER_SETTINGAUTH': 57,
    'LAYER_WORKER': 58,
    'LAYER_PAYTABLE': 59,
    'LAYER_ICMEMBER': 60,
    'PASSWD_CHANGE': 61,
    'PAYTABLE': 62,
    'LAYER_RT_CONFIRM': 63
};

window.KEYS = {
    'A': 65,
    'B': 66,
    'C': 67,
    'D': 68,
    'E': 69,
    'F': 70,
    'G': 71,
    'H': 72,
    'I': 73,
    'J': 74,
    'K': 75,
    'L': 76,
    'M': 77,
    'N': 78,
    'O': 79,
    'P': 80,
    'Q': 81,
    'R': 82,
    'S': 83,
    'T': 84,
    'U': 85,
    'V': 86,
    'W': 87,
    'X': 88,
    'Y': 89,
    'Z': 90,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    'NumPad0': 96,
    'NumPad1': 97,
    'NumPad2': 98,
    'NumPad3': 99,
    'NumPad4': 100,
    'NumPad5': 101,
    'NumPad6': 102,
    'NumPad7': 103,
    'NumPad8': 104,
    'NumPad9': 105,
    'NumPad*': 106,
    'NumPad+': 107,
    'NumPadEnter': 108,
    'NumPad-': 109,
    'NumPad.': 110,
    'NumPad/': 111,
    'F1': '112',
    'F2': '113',
    'F3': '114',
    'F4': '115',
    'F5': '116',
    'F6': '117',
    'F7': '118',
    'F8': '119',
    'F9': '120',
    'F10': '121',
    'F11': '122',
    'F12': '123',
    'BackSpace': 8,
    'Tab': 9,
    'Clear': 12,
    'Enter': 13,
    'Shift': 16,
    'Ctrl': 17,
    'Alt': 18,
    'CapsLock': 20,
    'Esc': 27,
    'Space': 32,
    'PageUp': 33,
    'PageDown': 34,
    'End': 35,
    'Home': 36,
    'Left': 37,
    'Up': 38,
    'Right': 39,
    'Down': 40,
    'Insert': 45,
    'Delete': 46
};

window.Interface_type = {
    ABC_BJCS: 'ABC_BJCS',
    CCB_LANDI: 'CCB_LANDI'
};