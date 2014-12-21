var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var FragmentsView = require('./fragments_view');
var CrackView = require('./crack_view');
var bubbleTmpl = require('../hbs/bubble.hbs');

module.exports = Backbone.View.extend({

  maxDiameter: 120,
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
    this.speed = this.bubble.speed;
    this.bubble.diameter = this.getRandomDiameter();
    this.bubble.color = this.getRandomColor();
    this.bubble.fragmentsColor = this.bubble.color;

    if (this.bubble.text === 'gitcafe') {
      this.bubble.color = 'gitcafe';
    }

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
    // this.log();
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

    var self = this;

    this.explotion = window.setTimeout(function () {
      self.triggerMinify();
      self.triggerFragmental();

      window.clearTimeout(self.explotion);
    }, 500);
  },

  triggerMinify: function () {
    var diameter = this.bubble.diameter;
    this.$wrapper.css({
      width: (diameter / 2) + 'px',
      height: (diameter / 2) + 'px',
      fontSize: '7px',
      lineHeight: (diameter / 2) + 'px',
      top: (diameter / 4) + 'px',
      left: (diameter / 4) + 'px',
      opacity: 0
    });
  },

  triggerFragmental: function () {
    var self = this;

    this.fragmental = window.setTimeout(function () {

      self.fragmentsView = new FragmentsView({
        bubble: self.bubble
      });
      self.$el.html(self.fragmentsView.render().el);
      self.triggerSpreading();

      window.clearTimeout(self.fragmental);

    }, 300);
  },

  triggerSpreading: function () {

    // todo: generate more tiny fragments while spreading

    var self = this;

    this.spreading = window.setTimeout(function () {

      self.fragmentsView.spread();
      self.triggerGathering();
      window.clearTimeout(self.spreading);

    }, 50);

  },

  triggerGathering: function () {
    var self = this;

    this.gathering = window.setTimeout(function () {
      self.fragmentsView.gather();
      self.el.style.top = (parseInt(self.el.style.top, 10) - 30) + 'px';
      self.triggerReducing();
      self.triggerAccelerating();

      self.removal = window.setTimeout(function () {
        self.$el.remove();
      }, 500);
      window.clearTimeout(self.gathering);
    }, 100);
  },

  triggerReducing: function () {
    var self = this;

    this.reducing = window.setTimeout(function () {
      self.fragmentsView.reduce();
      window.clearTimeout(self.reducing);
    }, 300);
  },

  triggerAccelerating: function () {
    var self = this;

    this.accelerating = window.setTimeout(function () {
      self.fragmentsView.loseWeight();
      window.clearTimeout(self.accelerating);
    }, 200);
  },

  triggerCracking: function () {
    var self = this;

    this.cracking = window.setTimeout(function () {
      self.crackView.grow();
      self.triggerMinify();
      self.triggerRemoving();
      window.clearTimeout(self.cracking);
    }, 50);
  },

  triggerRemoving: function () {
    var self = this;

    this.removing = window.setTimeout(function () {
      self.$el.css({
        opacity: '0'
      });
      self.el.addEventListener('transitionend', function () {
        self.$el.remove();
      });
      window.clearTimeout(self.removing);
    }, 500);
  },

  onClickedBubble: function (e) {
    var el = e.currentTarget;

    if (!!el.dataset.clicked) { return true; }

    var self = this;
    var res = this.getResult(el.dataset);
    var score = parseInt(res.score, 10);
    var time = parseInt(res.time, 10);
    var clickedTxt = '';

    el.dataset.clicked = '1';

    this.triggerMinify();
    this.triggerFragmental();
    this.updateBubbleCount();
    this.updateScore(res.score);
    this.updateTime(res.time);

    window.clearTimeout(self.destruction);
  },

  onSettled: function () {
    // todo: 
    // 1. rewrite with animation frame

    var self = this;

    this.$wrapper = this.$el.find('.bubble-wrapper');

    this.creation = window.setTimeout(function () {
      var diameter = self.bubble.diameter;
      var textLen = self.bubble.text.length;
      var fontSize;

      if (textLen === 0) {
        fontSize = diameter / 5;
      } else {
        fontSize = diameter / textLen * 1.1;
      }

      self.$wrapper.css({
        width: diameter + 'px',
        height: diameter + 'px',
        top: '0px',
        left: '0px',
        fontSize: fontSize + 'px',
        lineHeight: diameter + 'px'
      });
      window.clearTimeout(self.creation);
    }, 500);

    this.destructionTimeout = 3000 / (1 + 0.04 * this.speed);

    this.destruction = window.setTimeout(function () {
      self.crackView = new CrackView({
        bubble: self.bubble
      });
      self.$el.append(self.crackView.render().el);
      self.$el.addClass('destruction');
      self.triggerCracking();

      window.clearTimeout(self.destruction);
    }, this.destructionTimeout);
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
