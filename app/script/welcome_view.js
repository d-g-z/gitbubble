var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;

module.exports = Backbone.View.extend({

  initialize: function (options) {
    _.extend(this, options);
    this.on('loadEnded', this.onLoadEnded);
    this.render();
  },

  onLoadEnded: function () {
    this.$el.find('.loading').remove();
    this.$el.find('.team').remove();
    this.$el.css({
      top: '7%'
    });
  },

  hideLogo: function () {
    var self = this;

    this.$el.css({
      top: '-20%'
    });

    this.el.addEventListener('transitionend', function () {
      self.$el.remove();
    }, true);
  },

  updateLoadingProcess: function (percentage) {
    this.$santa.css({
      backgroundPositionX: percentage + '%'
    });
    this.$blood.css({
      width: percentage + '%'
    });
  },

  render: function () {
    this.setElement(this.$welcome);
    this.$blood = this.$el.find('.loading-process');
    this.$santa = this.$el.find('.loading-process-santa');
    return this;
  }
});
