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
            $('input[name = magcard]').keyup(function(event) {//.inputΪ��������
                last = event.timeStamp;
                //����event��timeStamp�����ʱ�䣬����ÿ�ε�keyup�¼������޸�last��ֵ��ע��last����Ϊȫ�ֱ���
                setTimeout(function () {    //��ʱ�ӳ�0.5sִ��
                    if (last - event.timeStamp == 0)
                    //���ʱ���Ϊ0��Ҳ������ֹͣ����0.5s֮�ڶ�û��������keyup�¼���������������Ҫ������
                    {
                        //����Ҫ��������
                        var value = $('input[name = magcard]').val();
                        console.log(value);
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