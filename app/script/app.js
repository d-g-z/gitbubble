var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = window.$ = $;

var WelcomeView = require('./welcome_view');
var BackgroundView = require('./background_view');
var StartView = require('./start_view');
var TipsView = require('./tips_view');
var HeaderView = require('./header_view');
var PoolView = require('./pool_view');
var ShakeView = require('./shake_view');
var ResultView = require('./result_view');
var BubbleView = require('./bubble_view');
var bubbleData = require('./bubble_data.json');

var bubbleApp = {
  $container: $('#app'),

  painted: [],

  lastBubble: {},

  combo: 0,

  bubbles: bubbleData,

  timer: {
    left: 25000,
    interval: 250,
    ticktock: null,
    running: true,

    onTickTock: function () {},

    onRunOut: function () {},

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

      this.running = true;
      this.onTickTock();

      this.ticktock = window.setInterval(function () {
        self.reduce(self.interval);
      }, this.interval);
    },

    end: function () {
      window.clearInterval(this.ticktock);
      this.ticktock = null;
      console.log('ended');
    },

    reset: function () {
      this.running = true;
      this.left = 25000;
    },

    pause: function () {
      this.running = false;
      window.clearInterval(this.ticktock);
      console.log('paused');
    },

    resume: function () {
      var self = this;

      this.running = true;
      
      this.ticktock = window.setInterval(function () {
        self.reduce(self.interval);
      }, this.interval);

      console.log('resumed');
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
    },

    reset: function () {
      this.val = 0;
      this.onScoreChanged(this.val);
    }
  },

  init: function () {
    // todo: preload all resources.
    AppConfig.initTime = new Date().getTime();
    this.hasDeviceMotion = 'ondevicemotion' in window;
    this.initViews();
    this.initTimer();
    this.initScore();
    this.loadResources();
    console.log('Inited in ' + (AppConfig.initTime - AppConfig.startTime) / 1000 + 's.');
  },

  loadResources: function () {
    // todo: use real resources load time, not a temporary timer
    var self = this;

    this.fakeLoadingProcess = window.setTimeout(function () {
      self.welcomeView.updateLoadingProcess(100);
      window.clearTimeout(self.fakeLoadingProcess);
    }, 100);

    this.loadingResources = window.setTimeout(function () {
      self.onResourcesLoaded();
      window.clearTimeout(this.loadingResources);
      self.loadResources = null;
    }, 500);
  },

  onResourcesLoaded: function () {
    this.docHeight = $(document).height();
    this.docWidth = $(document).width();

    var dimension = {
      w: this.docWidth,
      h: this.docHeight
    };

    this.welcomeView.trigger('loadEnded');
    this.startView.trigger('startLoadElements', dimension);
    this.backgroundView.trigger('setBackground');
  },

  initViews: function () {
    var self = this;

    this.welcomeView = new WelcomeView({
      $welcome: this.$container.find('.welcome')
    });

    this.backgroundView = new BackgroundView({
      $background: this.$container.find('.background')
    });

    this.tipsView = new TipsView({
      triggerStartGame: function () {
        self.headerView.trigger('startGame');
        self.poolView.trigger('startGame');
      }
    });

    this.startView = new StartView({
      triggerShowTips: function () {
        self.welcomeView.hideLogo();
        self.tipsView.startLoadElements();
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

      startShaking: function () {
        if (!self.hasDeviceMotion) {
          return;
        }

        var thisView = this;
        var totalTime = self.timer.left - 7000;
        var amount = _.random(1, 2);
        var timeIndex = 10000;
        var timeoutShake = function () {
          self.shakeView.initShaking();
        };

        for (var i = 1; i <= amount; i++) {

          var randomStart = timeIndex;
          var randomEnd = totalTime / amount * i;
          var shakeTime = _.random(randomStart, randomEnd);

          console.log('shake time', shakeTime);

          timeIndex = shakeTime + 7000;

          this.shakings.push(window.setTimeout(timeoutShake, shakeTime));
        }
      },

      startBubbling: function () {
        var thisView = this;
        
        this.interval = window.setInterval(function () {
          var coord = thisView.getRandomCoord();
          var bubbleView = self.createBubbleView(coord);
          thisView.$el.append(bubbleView.el);
          bubbleView.trigger('onSettled');
        }, 600);
      },

      pauseBubbling: function () {
        window.clearInterval(this.interval);
      },

      // resumeBubbling: function () {
      //   this.startBubbling();
      // },

      onEndGame: function () {
        window.clearInterval(this.interval);
        this.$el.empty();
        this.$el.hide();
        self.resultView.triggerEndGame(self.score.val);
        self.timer.running = false;

        this.shakings.forEach(function (timer) {
          window.clearTimeout(timer);
        }); 
        console.log('game ended after ' + ((new Date().getTime() - AppConfig.startTime) / 1000) + 's');
      }
    });
  
    this.resultView = new ResultView({
      triggerRestartGame: function () {
        this.$el.hide();
        self.lastBubble = {};
        self.score.reset();
        self.timer.reset();
        self.poolView.trigger('startGame');
      }
    });

    if (this.hasDeviceMotion) {
      this.shakeView = new ShakeView({
        onceShaked: function () {
          self.score.change(1000);
        },

        onShakingStarted: function () {
          self.timer.pause();
          self.poolView.pauseBubbling();
        },

        onShakingEnded: function () {
          self.timer.resume();
          self.poolView.startBubbling();
        }
      });
    }

    this.$container.append(this.headerView.el);
    this.$container.append(this.startView.el);
    this.$container.append(this.tipsView.el);
    this.$container.append(this.poolView.el);
    this.$container.append(this.resultView.el);

    if (this.hasDeviceMotion) {
      this.$container.append(this.shakeView.el);
    }
  },

  initTimer: function () {
    // todo: rewrite with animation frame
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
        score: -100,
        time: 0
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
        self.timer.running && self.score.change(parseInt(score, 10));
      },

      updateTime: function (time) {
        self.timer.running && self.timer.add(parseInt(time, 10));
      },

      getResult: function (bubble) {
        var score = 0, time = 0, square = 0;

        if (!!bubble.text && self.lastBubble.text && bubble.text === self.lastBubble.text) {
          self.combo++;
          square = self.combo - 1;
        } else {
          self.combo = 0;
          square = 0;
        }

        score = parseInt(bubble.score, 10) * Math.pow(2, square);

        self.lastBubble = bubble;

        return {
          score: score,
          time: bubble.time
        };
      }
    });
  }
};

bubbleApp.init();

