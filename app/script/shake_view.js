var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var shakeTmpl = require('../hbs/shake.hbs');

module.exports = Backbone.View.extend({

  ttl: 3000,

  templateData: {},

  onceShaked: function () {},

  onShakingStarted: function () {},

  onShakingEnded: function () {},

  template: shakeTmpl,

  threshold: 15,

  initShakeHandler: function () {

    this.lastTime = new Date();

    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;

    if (typeof document.CustomEvent === 'function') {
      this.event = new document.CustomEvent('shake', {
        bubbles: true,
        cancelable: true
      });
    } else if (typeof document.createEvent === 'function') {
      this.event = document.createEvent('Event');
      this.event.initEvent('shake', true, true);
    } else { 
      return false;
    }
  },

  reset: function () {
    this.lastTime = new Date();
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
  },

  start: function () {
    this.reset();
    window.addEventListener('devicemotion', this, false);
  },

  stop: function () {

    window.removeEventListener('devicemotion', this, false);
    this.reset();
  },

  devicemotion: function (e) {

    var current = e.accelerationIncludingGravity,
      currentTime,
      timeDifference,
      deltaX = 0,
      deltaY = 0,
      deltaZ = 0;

    if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
      this.lastX = current.x;
      this.lastY = current.y;
      this.lastZ = current.z;
      return;
    }

    deltaX = Math.abs(this.lastX - current.x);
    deltaY = Math.abs(this.lastY - current.y);
    deltaZ = Math.abs(this.lastZ - current.z);

    if (((deltaX > this.threshold) && (deltaY > this.threshold)) || ((deltaX > this.threshold) && (deltaZ > this.threshold)) || ((deltaY > this.threshold) && (deltaZ > this.threshold))) {
      currentTime = new Date();
      timeDifference = currentTime.getTime() - this.lastTime.getTime();

      if (timeDifference > 20) {
        window.dispatchEvent(this.event);
        this.lastTime = new Date();
      }
    }

    this.lastX = current.x;
    this.lastY = current.y;
    this.lastZ = current.z;

  },

  handleEvent: function (e) {

    if (typeof (this[e.type]) === 'function') {
      return this[e.type](e);
    }
  },

  initialize: function (options) {
    _.extend(this, options);
    this.render();
    this.$el.hide();
  },

  render: function () {
    this.setElement(this.template(this.templateData));
    return this;
  },

  initShaking: function () {
    var self = this;

    this.$el.show();
    this.initShakeHandler();

    this.start();
    this.onShakingStarted();

    window.addEventListener('shake', function () {
      self.onceShaked();
    }, false);

    this.shakingTimer = window.setTimeout(function () {
      self.stop();
      self.$el.hide();
      self.onShakingEnded();
    }, this.ttl);
  }
});
