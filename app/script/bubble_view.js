var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var bubbleTmpl = require('../hbs/bubble.hbs');

module.exports = Backbone.View.extend({

  maxDiameter: 100,
  minDiameter: 60,
  bubble: null,

  colors: [
    'yellow',
    'red',
    'blue',
    'green'
  ],

  colorPositionRatio: {
    yellow: 0,
    red: -1,
    blue: -2,
    green: -3
  },

  events: {
    // 'touchstart .js_bubble': 'onClickedBubble',
    // tmp: remove click event?
    'click .js_bubble': 'onClickedBubble'
  },

  template: bubbleTmpl,

  updateScore: function (score) {},

  updateTime: function (time) {},

  initialize: function (options) {
    _.extend(this, options);
    this.bubble.diameter = this.getRandomDiameter();
    this.bubble.color = this.getRandomColor();
    this.render();
  },

  render: function () {
    _.extend(this.bubble, {
      backgroundSizeWidth: this.bubble.diameter,
      backgroundSizeHeight: this.bubble.diameter * 4,
      backgroundPositionX: -Math.abs(this.bubble.diameter / 2),
      backgroundPositionY: this.getBackgroundPositionY()
    });

    this.bubble.posX += (this.bubble.diameter / 2);
    this.bubble.posY += (this.bubble.diameter / 2);

    this.setElement(this.template(this.bubble));
    this.bindTouchEvent();
    this.log();
    return this;
  },

  bindTouchEvent: function () {
    var self = this;
    this.$el.on('touchstart', '.js_bubble', function (e) {
      e.preventDefault();
      self.onClickedBubble(e);
    });
  },

  onClickedBubble: function (e) {
    var el = e.target;

    if (!!el.dataset.clicked) { return true; }

    var self = this;
    var res = this.getResult(el.dataset);
    var score = parseInt(res.score);
    var timeoutInstance = window.setTimeout(function () {
      // todo: bubble clicked, disappear animation
      self.$el.remove();
      window.clearTimeout(timeoutInstance);
    }, 300);

    el.dataset.clicked = '1';
    el.innerHTML = (score > 0) ? '+' + score : score;

    this.$el.addClass('active');
    this.updateScore(res.score);
    this.updateTime(res.time);
  },

  getRandomDiameter: function () {
    var d =  _.random(this.minDiameter, this.maxDiameter);
    return (d % 2 === 0) ? d : d + 1;
  },

  getRandomColor: function () {
    return this.colors[_.random(0, this.colors.length - 1)];
  },

  getBackgroundPositionY: function () {
    var ratio = -Math.abs(_.indexOf(this.colors, this.bubble.color)) - 0.5;
    return ratio * this.bubble.diameter;
  },

  log: function () {
    console.log('time: ' + (new Date().getTime() - AppConfig.startTime) / 1000 + 's, bubble: ', this.bubble ,' coord: x: ' + this.bubble.posX + ' y: ' + this.bubble.posY + ' d: ' + this.bubble.diameter);
  }
});
