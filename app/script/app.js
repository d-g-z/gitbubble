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
var resourceData = require('./resource_data.json');

var bubbleApp = {
  $container: $('#app'),

  painted: [],

  lastBubble: {},

  combo: 0,
  clickedCnt: 0,

  bubbles: bubbleData,

  timer: {
    initial: 60000,
    left: 0,
    passed: 0,
    interval: 250,
    accelerateInterval: 5000,
    ticktock: null,
    running: true,

    onTickTock: function () {},

    onRunOut: function () {},

    add: function (time) {
      this.left += time;
      this.passed += time;
      this.onTickTock();
    },

    reduce: function (time) {
      if (this.left - time > 0) {
        this.left -= time;
        // console.log('timer left: ' + this.left + 'ms, passed: ' + this.passed + 'ms');
      } else {
        this.left = 0;
        this.onRunOut();
        this.end();
      }

      this.passed += time;
      this.onTickTock();
    },

    start: function () {
      var self = this;

      this.reset();
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
      this.left = this.initial;
      this.passed = 0;
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
    shakeScore: 500,

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
    AppConfig.initTime = new Date().getTime();
    this.hasDeviceMotion = 'ondevicemotion' in window;
    this.initViews();
    this.initTimer();
    this.initScore();
    this.loadResources();
    console.log('Inited in ' + (AppConfig.initTime - AppConfig.startTime) / 1000 + 's.');
  },

  loadResources: function () {
    var self = this;
    var total = resourceData.length;
    var resourceQueue = _.clone(resourceData);
    var loaded = 0;
    var handleLoadingProcess = function (loaded) {
      if (loaded === total) {
        AppConfig.loadedTime = new Date().getTime();
        if (AppConfig.loadedTime - AppConfig.startTime < 3000) {
          var loadLegacy = window.setTimeout(function () {
            self.onResourcesLoaded();
          }, 2000 - (AppConfig.loadedTime - AppConfig.startTime));
        } else {
          self.onResourcesLoaded(); 
        }
      } else {
        self.welcomeView.updateLoadingProcess(loaded / total * 100);
      }
    };
    var loadSingleResource = function (url) {
      if (/\/image\//.test(url)) {
        var img = new Image();
        img.onload = img.onerror = function () {
          loaded++;
          handleLoadingProcess(loaded);
        };
        img.src = url;
      } else {
        $.ajax({
          type: 'get',
          url: url,
          success: function () {
            loaded++;
            handleLoadingProcess(loaded);
          },
          error: function () {
            loaded++;
            handleLoadingProcess(loaded);
          }
        }); 
      }
    };

    while (resourceQueue.length > 0) {
      var resourceUrl = resourceQueue.pop();
      loadSingleResource(resourceUrl);
    } 
  },

  onResourcesLoaded: function () {
    this.docHeight = $(document).height();
    this.docWidth = $(document).width();

    var self = this;
    var dimension = {
      w: this.docWidth,
      h: this.docHeight
    };

    $.ajax({
      type: 'get',
      url: 'http://localhost:3000/visitor/new',
      success: function (res) {
        AppConfig.uuid = res;
        self.loadComplete = window.setTimeout(function () {
          self.welcomeView.trigger('loadEnded');
          self.startView.trigger('startLoadElements', dimension);
          self.backgroundView.trigger('setBackground');
          window.clearTimeout(self.loadComplete);
        }, 2000);
      } 
    });
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

    this.headerView = new HeaderView({
      initialTime: this.timer.initial / 1000
    });

    this.poolView = new PoolView({
      initStyle: function () {
        this.areaHeight = $(window).height() - self.headerView.$el.height();
        this.areaWidth = $(window).width();
      },

      startTimer: function () {
        self.timer.start();
      },

      startShaking: function () {
        if (!self.hasDeviceMotion) {
          return;
        }

        var thisView = this;
        var totalTime = self.timer.initial - 10000;
        var amount = _.random(1, 2);
        var timeIndex = 10000;
        var timeoutShake = function () {
          self.shakeView.initShaking();
        };

        for (var i = 1; i <= amount; i++) {

          var randomStart = timeIndex;
          var randomEnd = totalTime / amount * i;
          
          if (randomEnd > randomStart) {
            var shakeTime = _.random(randomStart, randomEnd);
            timeIndex = shakeTime + 10000;
            this.shakings.push(window.setTimeout(timeoutShake, shakeTime));
          }
        }
      },

      startBubbling: function () {
        var thisView = this;

        this.bubbling = window.setInterval(function () {
          var options = thisView.getRandomCoord();
          _.extend(options, { speed: thisView.speed });
          var bubbleView = self.createBubbleView(options);
          thisView.$el.append(bubbleView.el);
          bubbleView.trigger('onSettled');
        }, this.interval);
      },

      pauseBubbling: function () {
        window.clearInterval(this.bubbling);
      },

      onEndGame: function () {
        var thisView = this;
        this.playing = false;
        this.speed = 0;
        
        this.setSpeed();
        this.$el.empty();
        this.$el.hide();
        this.shakings.forEach(function (timer) {
          window.clearTimeout(timer);
        }); 

        window.clearInterval(this.bubbling);
        self.timer.running = false;
        AppConfig.gameEndTime = new Date().getTime();

        $.ajax({
          type: 'post',
          url: 'http://localhost:3000/game/save',
          data: {
            uuid: AppConfig.uuid,
            score: self.score.val,
            bubble_cnt: self.clickedCnt,
            shake_cnt: thisView.shakings.length,
            gaming_time: ~~((AppConfig.gameEndTime - AppConfig.gameStartTime) / 1000),
            load_time: (AppConfig.loadedTime - AppConfig.startTime) / 1000
          },
          success: function (res) {
            thisView.shakings = [];
            AppConfig.startTime = AppConfig.loadedTime;
            self.resultView.triggerEndGame(self.score.val);
          }
        });
      }
    });
  
    this.resultView = new ResultView({
      triggerRestartGame: function () {
        this.$el.hide();
        self.combo = 0;
        self.clickedCnt = 0;
        self.lastBubble = {};
        self.score.reset();
        self.timer.reset();
        self.poolView.trigger('startGame');
      }
    });

    if (this.hasDeviceMotion) {
      this.shakeView = new ShakeView({
        onceShaked: function () {
          self.score.change(self.score.shakeScore);
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

      if (this.passed % this.accelerateInterval === 0) {
        self.accelerateGame(this.passed / this.accelerateInterval);
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

  accelerateGame: function (speed) {
    if (speed > 0) {
      this.poolView.changeInterval(speed); 
    }
  },

  getRandomBubble: function () {
    var bubble;
    var rand = Math.random();

    if (rand >= 0.7) {
      // empty bubble
      bubble = {
        text: '',
        score: -1000,
        time: 0
      };
    } else if (rand <= 0.04) {
      // gitcafe bubble
      bubble =  {
        text: 'gitcafe',
        score: 0,
        time: 5000
      };
    } else {
      bubble = this.bubbles[_.random(0, this.bubbles.length - 1)];
    }

    return bubble;
  },

  createBubbleView: function (options) {
    var self = this;
    var bubble = this.getRandomBubble();
    
    _.extend(bubble, options);

    return new BubbleView({
      bubble: bubble,
      updateBubbleCount: function () {
        self.clickedCnt++;
      },
      updateScore: function (score) {
        if (self.timer.running) {
          self.score.change(parseInt(score, 10));
          self.headerView.updateChangedScore(score);
        } 
      },

      updateTime: function (time) {
        if (self.timer.running) {
          self.timer.add(parseInt(time, 10));
          self.headerView.updateChangedTime(time);
        } 
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

