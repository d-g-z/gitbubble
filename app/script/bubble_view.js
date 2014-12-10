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
    this.on('onSettled', this.onSettled);
    this.render();
  },

  render: function () {

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

    this.explotion = window.setTimeout(function () {
      // todo: bubble clicked, disappear animation
      var diameter = self.bubble.diameter;
      self.$el.css({
        width: (diameter / 2) + 'px',
        height: (diameter / 2) + 'px',
        fontSize: '7px',
        lineHeight: (diameter / 2) + 'px',
        top: (self.bubble.posY - diameter / 4) + 'px',
        left: (self.bubble.posX - diameter / 4) + 'px'
      });

      this.removal = window.setTimeout(function () {
        self.$el.remove();
      }, 500);

      window.clearTimeout(self.explotion);
      window.clearTimeout(self.destruction);
    }, 500);

    el.dataset.clicked = '1';
    el.innerHTML = (score > 0) ? '+' + score : score;

    this.updateScore(res.score);
    this.updateTime(res.time);
  },

  onSettled: function () {
    // todo: 
    // 1. rewrite with animation frame
    // 2. reduce destuction timeout according to timer

    var self = this;

    this.creation = window.setTimeout(function () {
      var diameter = self.bubble.diameter;
      self.$el.css({
        width: diameter + 'px',
        height: diameter + 'px',
        top: (self.bubble.posY - diameter / 2) + 'px',
        left: (self.bubble.posX - diameter / 2) + 'px',
        fontSize: '14px',
        lineHeight: diameter + 'px'
        // transform: "scale(1)"
      });
      window.clearTimeout(self.creation);
    }, 500);

    this.destruction = window.setTimeout(function () {
      self.$el.css({
        opacity: 0
      });
      self.removal = window.setTimeout(function () {
        self.$el.remove();
        window.clearTimeout(self.removal);
      }, 500);
      window.clearTimeout(self.destruction);
    }, 3000);
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
