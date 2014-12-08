var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var tipsTmpl = require('../hbs/tips.hbs');

module.exports = Backbone.View.extend({
  $score: null,
  $time: null,

  events: {
    'touchstart .js_tips_start_game': 'triggerStartGame',
    'click .js_tips_start_game': 'triggerStartGame'
  },

  template: tipsTmpl,

  triggerStartGame: function () {},

  initialize: function (options) {
    _.extend(this, options);
    this.render();
  },

  render: function () {
    this.setElement(this.template());
    return this;
  }
});
