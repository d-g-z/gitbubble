var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var resultTmpl = require('../hbs/result.hbs');

module.exports = Backbone.View.extend({

  templateData: {},

  events: {
    'click .js_try_again': 'triggerRestartGame'
  },

  triggerRestartGame: function () {},

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
