var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var tipsTmpl = require('../hbs/tips.hbs');

module.exports = Backbone.View.extend({
  $score: null,
  $time: null,

  events: {
    'click .js_tips_start_game': 'onStartGame'
  },

  template: tipsTmpl,

  triggerStartGame: function () {},

  onStartGame: function () {
    this.$go.css({
      width: '0px',
      height: '0px'
    });
    this.$el.css({
      top: '-100%'
    });
    this.triggerStartGame();
  },

  initialize: function (options) {
    _.extend(this, options);
    this.render();
    this.$el.hide();
  },

  startLoadElements: function () {
    this.$el.show();
    this.$el.css({
      backgroundSize: 'auto 100%'
    });
    this.$go.css({
      width: '100%',
      height: '100%'
    });
  },
    
  render: function () {
    this.setElement(this.template());
    this.$go = this.$el.find('.go-button');
    return this;
  }
});
