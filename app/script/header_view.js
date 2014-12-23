var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var headerTmpl = require('../hbs/header.hbs');

module.exports = Backbone.View.extend({

  $score: null,
  $time: null,

  template: headerTmpl,

  triggerStartGame: function () {},

  initialize: function (options) {
    _.extend(this, options);
    this.on('startGame', this.showHeader);
    this.render();
    this.$el.hide();
  },

  updateTime: function (timeLeft) {
    if (!isNaN(timeLeft) && parseInt(timeLeft, 10) >= 0) {
      this.$time.text(timeLeft);
    }
  },

  updateScore: function (score) {
    if (!isNaN(score) && parseInt(score, 10) >= 0) {
      this.$score.text(score);
    }
  },

  updateChangedScore: function (score) {
    if (parseInt(score, 10) === 0) {
      return;
    }

    this.$changedScore.css({
      fontSize: '24px',
      opacity: '1'
    });
    this.$changedScore.html(score > 0 ? '+' + score : score); 
  },

  updateChangedTime: function (time) {
    if (parseInt(time, 10) === 0) {
      return;
    }

    this.$changedTime.css({
      fontSize: '24px',
      opacity: '1'
    });
    this.$changedTime.html('+' + time / 1000 + 's');
  },

  showHeader: function () {
    this.$el.show();
  },

  render: function () {
    var self = this;

    this.setElement(this.template({
      initialTime: this.initialTime,
      initialScore: 0
    }));

    this.$score = this.$el.find('.js_score');
    this.$time = this.$el.find('.js_time');

    this.$changedScore = this.$el.find('.js_changed_score');
    this.$changedTime = this.$el.find('.js_changed_time');
    
    this.$changedScore.get(0).addEventListener('transitionend', function () {
      self.$changedScore.css({
        fontSize: '0px',
        opacity: '0'
      });
    });

    this.$changedTime.get(0).addEventListener('transitionend', function () {
      self.$changedTime.css({
        fontSize: '0px',
        opacity: '0'
      });
    });

    return this;
  }
});
