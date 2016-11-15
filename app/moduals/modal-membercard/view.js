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

        template_content:contenttpl,

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked'
        },

        modalInitPage: function () {
            this.requestModel = new McardModel();
            $('.modal').on('shown.bs.modal', function () {
                $('input[name = magcard]').focus();
            });
            this.swipeCard();
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_MEMBER_CARD, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.MEMBER);
                //$('input[name = custid]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_MEMBER_CARD, window.KEYS.Enter, function () {
                _self.hideModal(window.PAGE_ID.MEMBER);
                //$('input[name = custid]').focus();
            });
        },

        /**
         * ˢ������
         */
        swipeCard: function () {
            var last;
            var _self = this;
            $('input[name = magcard]').keyup(function(event) {//.inputΪ��������
                last = event.timeStamp;
                //����event��timeStamp�����ʱ�䣬����ÿ�ε�keyup�¼������޸�last��ֵ��ע��last����Ϊȫ�ֱ���
                setTimeout(function () {    //��ʱ�ӳ�0.5sִ��
                    if (last - event.timeStamp == 0)
                    //���ʱ���Ϊ0��Ҳ������ֹͣ����0.5s֮�ڶ�û��������keyup�¼���������������Ҫ������
                    {
                        //����Ҫ��������
                        //var value = $('input[name = magcard]').val();
                        var value = ';6222620910021970482=2412220905914925?996222620910021970482=1561560500050006021013000000010000024120===0914925905;';
                        console.log(value);
                        var index1 = value.indexOf(';');
                        var index2 = value.indexOf('?');
                        var index3 = value.lastIndexOf(';');
                        console.log('index1:' + index1 + ',index2:' + index2 + ',index3:' + index3);
                        var track1 = value.substring(0, index1);
                        var track2 = value.substring(index1 + 1, index2);
                        var track3 = value.substring(index2 + 1, index3);
                        $('input[name = magcard]').val('');
                        console.log(track1);
                        console.log(track2);
                        console.log(track3);
                        if (track1 == '') {
                            track1 = '*';
                        }
                        if (track2 == '') {
                            track2 = '*';
                        }
                        if (track2 == '') {
                            track2 = '*';
                        }
                        var data = {};
                        data['track1'] = track1;
                        data['track2'] = track2;
                        data['track3'] = track3;
                        data['type'] = '01';
                        _self.requestModel.getMemberInfo(data, function (resp) {
                            console.log(resp);
                            if (resp.status == '00') {

                            }
                        });
                    }
                }, 500);
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