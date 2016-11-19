/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-membercard/model',
    'text!../../moduals/modal-membercard/contenttpl.html',
    'text!../../moduals/modal-membercard/tpl.html'
], function (BaseModalView, McardModel, contenttpl, tpl) {

    var mCardView = BaseModalView.extend({

        id: "mCardView",

        template: tpl,

        template_content: contenttpl,

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked'
        },

        modalInitPage: function () {
            var _self = this;
            this.requestModel = new McardModel();
            $('.modal').on('shown.bs.modal', function () {
                $('input[name = magcard]').focus();
            });
            //this.swipeCard();
            $('input[name = magcard]').koala({
                delay: 2000,
                keyup: function (event) {
                    _self.swipeCard();
                }
            });


            //var last;
            //var _self = this;
            //$('input[name = magcard]').keyup(function(event) {//.input为你的输入框
            //    last = event.timeStamp;
            //    //利用event的timeStamp来标记时间，这样每次的keyup事件都会修改last的值，注意last必需为全局变量
            //    setTimeout(function () {    //设时延迟0.5s执行
            //        if (last - event.timeStamp == 0)
            //        //如果时间差为0（也就是你停止输入0.5s之内都没有其它的keyup事件发生）则做你想要做的事
            //        {
            //            //做你要做的事情
            //            _self.swipeCard();
            //        }
            //    }, 10000);
            //});
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_MEMBER_CARD, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.MEMBER);
                //$('input[name = custid]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_MEMBER_CARD, window.KEYS.Enter, function () {
                _self.swipeCard();
                //$('input[name = custid]').focus();
            });
        },

        /**
         * 刷卡输入
         */
        swipeCard: function () {
            var _self = this;
            var value = $('input[name = magcard]').val();
            if (value == '') {
                toastr.warning('请刷卡');
                return;
            }
            console.log('value:' + value);
            //var value = ';6222620910021970482=2412220905914925?996222620910021970482=1561560500050006021013000000010000024120===0914925905;';
            var index1, index2, track1, track2, track3;
            //var value = '%768000001 383837934874352?;768000001?;383837934874352?';
            var str = value.charAt(0);
            console.log(str);
            if (str == '%') {
                index1 = value.indexOf('?');
                track1 = value.substring(1, index1);
                value = value.substring(index1 + 1);
                str = value.charAt(0);
                console.log('track1 str:' + str);
            } else {
                track1 = '*';
            }
            //var re = new RegExp(';', 'g');
            //var arr = value.match(re);
            //var len = arr.length;
            //console.log(len);
            if (str == ';') {
                index2 = value.indexOf('?');
                track2 = value.substring(1, index2);
                value = value.substring(index2 + 1);
                str = value.charAt(0);
                console.log('track2 str:' + str);
            } else {
                track2 = '*';
            }
            if (str == ';') {
                track3 = value.substring(1, value.length - 1);
            } else {
                track3 = '*'
            }

            console.log('track1:' + track1 + ',track2:' + track2 + ',track3:' + track3);
            var data = {};
            var tracks = ['track1', 'track2', 'track3'];
            var trackValues = [track1, track2, track3];
            for (var i = 0;i < tracks.length;i++) {
                data[tracks[i]] = trackValues[i];
            }
            data['type'] = '01';
            this.requestModel.getMemberInfo(data, function (resp) {
                //console.log(resp);
                if (resp.status == '00') {
                    _self.hideModal(window.PAGE_ID.MEMBER);
                    $('input[name = magcard]').val('');
                    Backbone.trigger('onMagcardResponse', resp);
                } else {
                    toastr.error(resp.msg);
                }
            });
        },

        onOKClicked: function () {
            this.hideModal(window.PAGE_ID.MEMBER);
            //$('input[name = custid]').focus();
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MEMBER);
            //$('input[name = custid]').focus();
        }

    });

    return mCardView;
});