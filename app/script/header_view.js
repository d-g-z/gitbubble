var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var headerTmpl = require('../hbs/header.hbs');

module.exports = Backbone.View.extend({

  $score: null,
  $time: null,

  events: {
  },

  template: headerTmpl,

  triggerStartGame: function () {},

  initialize: function (options) {
    _.extend(this, options);
    this.render();
  },

  updateTime: function (timeLeft) {
    if (!isNaN(timeLeft) && parseInt(timeLeft, 10) >= 0) {
      this.$time.text(timeLeft);
    }
  },

  updateScore: function (score) {
    if (!isNaN(score) && parseInt(score, 10) >= 0) {
      this.$score.text(score);
    }
  },

  render: function () {
    this.setElement(this.template());
    this.$score = this.$el.find('.js_score');
    this.$time = this.$el.find('.js_time');
    return this;
  }
});
