var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var poolTmpl = require('../hbs/pool.hbs');

module.exports = Backbone.View.extend({

  initialInterval: 1000,
  speed: 0,
  playing: true,
  areaWidth: 0,
  areaHeight: 0,
  bubbling: null,
  shakings: [],

  events: {
  },

  initStyle: function () {},

  startTimer: function () {},

  startBubbling: function () {},

  pauseBubbling: function () {},

  startShaking: function () {},

  onEndGame: function () {},

  onStartGame: function () {
    this.playing = true;
    this.$el.show();
    this.setStyle();
    this.startTimer();
    this.startShaking();
    this.startBubbling();
    console.log('game started after ' + ((new Date().getTime() - AppConfig.startTime) / 1000) + 's');
  },

  template: poolTmpl,

  initialize: function (options) {
    _.extend(this, options);
    this.setSpeed();
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
  },

  setSpeed: function () {
    this.interval = this.initialInterval / (1 + 0.06 * this.speed);
  },

  changeInterval: function (speed) {
    if (!this.playing) {
      return;
    }

    this.speed = speed;
    this.pauseBubbling();
    this.setSpeed();
    this.startBubbling();
  }
});
