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
    var self = this;
    $(window).scrollTop(0);
    this.$el.css({
      top: '-100%',
      opacity: '0'
    });
    this.triggerStartGame();
    this.el.addEventListener('transitionend', function () {
      self.$el.remove();
    }, true);
  },

  initialize: function (options) {
    _.extend(this, options);
    this.render();
    this.$el.hide();
  },

  startLoadElements: function () {
    var w = $(document).width();
    this.$el.show();
    this.$el.css({
      height: (w / 450 * 808) + 'px',
      backgroundSize: '100% auto'
    });
  },
    
  render: function () {
    this.setElement(this.template());
    return this;
  }
});
