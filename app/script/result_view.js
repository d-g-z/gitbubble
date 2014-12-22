var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var resultTmpl = require('../hbs/result.hbs');

module.exports = Backbone.View.extend({

  templateData: {},

  events: {
    'click .js_try_again': 'triggerRestartGame',
    'click .js_share': 'triggerShowSharing',
    'click .js_follow': 'triggerFollow'
  },

  triggerRestartGame: function () {},

  triggerShowSharing: function () {},

  triggerFollow: function () {
    location.href = 'http://mp.weixin.qq.com/s?__biz=MjM5ODc4MjcyMA==&mid=201946097&idx=1&sn=7ed59726f6c9c350d4b8d9883835766f&key=2f5eb01238e84f7e878e37c9bd798b29469afc0a340452fe5b19e530682210db17ad994dd6a11ecda48d1b262608c576&ascene=1&uin=MzQ4MTAyMjAw&devicetype=webwx&version=70000001&pass_ticket=iiNM2zB91FnW%2BssjrOByfNqsCeqcmI5ehwAHMOiCXgLEUqb%2BhXIXYIMr8N4VnZnR';
  },

  template: resultTmpl,

  initialize: function (options) {
    _.extend(this, options);
    this.render();
  },

  render: function () {
    this.setElement(this.template(this.templateData));
    // todo: on resize, calc result text position
    return this;
  },

  triggerEndGame: function (score) {
    var w = $(document).width();
    this.$el.find('.js_result_score').text(score);
    this.$el.css({
      height: (w / 400 * 666) + 'px'
    });
    this.$el.find('.result-text-wrapper').css({
      top: (w * 0.8 / 400 * 666 * 0.34 + 60) + 'px'
    });
    this.$el.show();
  }
});
