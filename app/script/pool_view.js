var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var poolTmpl = require('../hbs/pool.hbs');

module.exports = Backbone.View.extend({

  areaWidth: 0,
  areaHeight: 0,
  bubbling: null,

  events: {
  },

  initStyle: function () {},

  startTimer: function () {},

  startBubbling: function () {},

  onStartGame: function () {
    this.$el.show();
    this.setStyle();
    this.startTimer();
    this.startBubbling();
    console.log('game started after ' + ((new Date().getTime() - AppConfig.startTime) / 1000) + 's');
  },

  template: poolTmpl,

  initialize: function (options) {
    _.extend(this, options);
    this.on('startGame', this.onStartGame);
    this.on('endGame', this.onEndGame);
    this.render();
    this.$el.hide();
  },

  render: function () {
    this.setElement(this.template());
    return this;
  },

  getRandomCoord: function () {
    return {
      posX: _.random(Math.ceil(this.areaWidth * 0.05), Math.floor(this.areaWidth * 0.75)),
      posY: _.random(Math.ceil(this.areaHeight * 0.05), Math.floor(this.areaHeight * 0.75))
    };
  },

  setStyle: function () {
    // todo: onresize, change areaWidth areaHeight
    this.initStyle();
    this.$el.css({
      width: this.areaWidth + 'px',
      height: this.areaHeight + 'px'
    });
  }
});
