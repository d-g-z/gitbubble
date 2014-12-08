var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = window.$ = $;

var TipsView = require('./tips_view');
var HeaderView = require('./header_view');
var PoolView = require('./pool_view');
var BubbleView = require('./bubble_view');
var bubbleData = require('./bubble_data.json');

var bubbleApp = {
  $container: $('#app'),

  painted: [],

  bubbles: bubbleData,

  timer: {
    left: 5000,
    interval: 250,
    ticktock: null,

    onTickTock: function () {},

    onRunOut: function () {
      console.log('run out of time');
    },

    add: function (time) {
      this.left += time;
      this.onTickTock();
    },

    reduce: function (time) {
      if (this.left - time > 0) {
        this.left -= time;
        console.log('timer left: ' + this.left + 's');
      } else {
        this.left = 0;
        this.onRunOut();
        this.end();
      }
      this.onTickTock();
    },

    start: function () {
      var self = this;
      this.onTickTock();

      this.ticktock = window.setInterval(function () {
        self.reduce(self.interval);
      }, this.interval);
    },

    end: function () {
      window.clearInterval(this.ticktock);
      this.ticktock = null;
      console.log('ended');
    }
  },

  score: {
    val: 0,

    onScoreChanged: function (score) {},

    change: function (score) {
      if (this.val + score >= 0) {
        this.val += score;
      } else {
        this.val = 0;
      }
      this.onScoreChanged(this.val);
      console.log('current score: ' + this.val);
    }
  },

  init: function () {
    AppConfig.initTime = new Date().getTime();
    this.initViews();
    this.initTimer();
    this.initScore();
    console.log('Inited in ' + (AppConfig.initTime - AppConfig.startTime) / 1000 + 's.');
  },

  initViews: function () {
    // todo || consider: 
    // 1. loading: 3 seconds.
    var self = this;

    this.tipsView = new TipsView({
      triggerStartGame: function () {
        // todo:
        // 1. adjust tips container height, make it vertical center
        // 2. animate hide tip box.
        this.$el.hide();
        self.poolView.trigger('startGame');
      }
    });

    this.headerView = new HeaderView();

    this.poolView = new PoolView({
      initStyle: function () {
        this.areaHeight = $(document).height() - self.headerView.$el.height();
        this.areaWidth = $(document).width();
      },

      startTimer: function () {
        self.timer.start();
      },

      startBubbling: function () {
        var thisView = this;
        this.interval = window.setInterval(function () {
          var coord = thisView.getRandomCoord();
          var bubbleView = self.createBubbleView(coord);
          thisView.$el.append(bubbleView.el);
          self.painted.push(bubbleView);
        }, 500);
      }
    });

    this.$container.find('.welcome').remove();
    this.$container.append(this.headerView.el);
    this.$container.append(this.tipsView.el);
    this.$container.append(this.poolView.el);
  },

  initTimer: function () {
    var self = this;

    this.timer.onTickTock = function () {
      if (this.left % 1000 === 0) {
        self.headerView.updateTime(this.left / 1000); 
      }
    };

    this.timer.onRunOut = function () {
      self.poolView.trigger('endGame');
    };
  },

  initScore: function () {
    var self = this;

    this.score.onScoreChanged = function (score) {
      self.headerView.updateScore(score);
    };
  },

  getRandomBubble: function () {
    if (Math.random() >= 0.5) {
      // empty bubble
      return {
        text: '',
        score: 0,
        time: -1
      };
    }
    return this.bubbles[_.random(0, this.bubbles.length - 1)];
  },

  createBubbleView: function (coord) {
    var self = this;
    var bubble = this.getRandomBubble();
    
    _.extend(bubble, coord);

    return new BubbleView({
      bubble: bubble,
      updateScore: function (score) {
        self.score.change(parseInt(score, 10));
      },

      updateTime: function (time) {
        self.timer.add(parseInt(time, 10));
      }
    });
  }
};

bubbleApp.init();

