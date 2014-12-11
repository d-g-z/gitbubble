var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var bubbleTmpl = require('../hbs/bubble.hbs');
var fragmentTmpl = require('../hbs/fragment.hbs');

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

    _.extend(this.bubble, {
      relativePosX: this.bubble.diameter / 2,
      relativePosY: this.bubble.diameter / 2
    });

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

  triggerExplotion: function () {

    var self= this;

    this.explotion = window.setTimeout(function () {
      // todo: bubble clicked, disappear animation
      var diameter = self.bubble.diameter;
      self.$wrapper.css({
        width: (diameter / 2) + 'px',
        height: (diameter / 2) + 'px',
        fontSize: '7px',
        lineHeight: (diameter / 2) + 'px',
        top: (diameter / 4) + 'px',
        left: (diameter / 4) + 'px'
      });

      self.triggerFragmental();

      window.clearTimeout(self.explotion);
      window.clearTimeout(self.destruction);
    }, 50);
  },

  triggerFragmental: function () {
    var self = this;

    this.fragmental = window.setTimeout(function () {
      var htmlArr = [];
      var fragments = [];
      var htmlStr = '';
      var color = self.bubble.color;
      var diameter = self.bubble.diameter;
      
      for (var i = 0; i < 10; i += 1) {
        var d = _.random(2, diameter / 3);
        fragments.push({
          diameter: d,
          color: self.bubble.color,
          posX: (diameter - d) / 2,
          posY: (diameter - d) / 2
        });
      }

      self.$el.html(fragmentTmpl({
        fragments: fragments
      }));

      window.clearTimeout(self.fragmental);

      self.triggerSpreading();

    }, 500);
  },

  triggerSpreading: function () {

    // todo: reduce fragment bubble count, 

    var self = this;

    self.spreading = window.setTimeout(function () {
      var elFragments = self.$el.find('.bubble-fragment img');

      for (var i = 0; i < 10; i += 1) {
        elFragments[i].style.top = _.random(0, self.bubble.diameter / 2) + 'px';
        elFragments[i].style.left = _.random(0, self.bubble.diameter / 2) + 'px';
      }

      self.$el.css({
        top: (self.bubble.posY - 50) + 'px'
      });

      self.removal = window.setTimeout(function () {
        self.$el.remove();
      }, 1500);
      window.clearTimeout(self.spreading);

    }, 50);

  },

  onClickedBubble: function (e) {
    var el = e.currentTarget;

    if (!!el.dataset.clicked) { return true; }

    var self = this;
    var res = this.getResult(el.dataset);
    var score = parseInt(res.score);

    el.dataset.clicked = '1';
    $(el).find('span').html((score > 0) ? '+' + score : score);

    this.triggerExplotion();
    this.updateScore(res.score);
    this.updateTime(res.time);
  },

  onSettled: function () {
    // todo: 
    // 1. rewrite with animation frame
    // 2. reduce destuction timeout according to timer
    // 3. remove image border.

    var self = this;

    this.$wrapper = this.$el.find('.bubble-wrapper');

    this.creation = window.setTimeout(function () {
      var diameter = self.bubble.diameter;
      self.$wrapper.css({
        width: diameter + 'px',
        height: diameter + 'px',
        top: '0px',
        left: '0px',
        fontSize: '14px',
        lineHeight: diameter + 'px'
        // transform: "scale(1)"
      });
      window.clearTimeout(self.creation);
    }, 500);

    this.destruction = window.setTimeout(function () {
      // todo: disable click event while destruction
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
