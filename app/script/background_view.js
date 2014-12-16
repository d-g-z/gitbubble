var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;

module.exports = Backbone.View.extend({

  initialize: function (options) {
    _.extend(this, options);
    this.on('setBackground', this.setBackground);
    this.render();
  },

  setBackground: function () {
    this.$el.find('.js_white_bottom').css({
      height: '36.62%'
    });
    this.$el.find('.js_main_background').css({
      height: '79.54%'
    });
  },

  render: function () {
    this.setElement(this.$background);
    return this;
  }
});
