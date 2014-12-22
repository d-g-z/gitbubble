var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var shareTmpl = require('../hbs/share.hbs');

module.exports = Backbone.View.extend({

  templateData: {},

  template: shareTmpl,

  initialize: function (options) {
    _.extend(this, options);
    this.render();
    this.bindEvents();
    this.$el.hide();
  },

  bindEvents: function () {
    // todo, remove listener
    var self = this;
    var onWrapperTransitionEnd = function () {
      self.$el.hide();
      self.el.removeEventListener('transitionend', onWrapperTransitionEnd);
    };
    this.$el.on('click', function () {
      self.el.addEventListener('transitionend', onWrapperTransitionEnd, true);
      self.$el.css({
        opacity: '0'
      });
    });
  },

  startLoadElements: function () {
    this.$el.show();
    this.$el.css({
      opacity: '1'
    });
  },

  render: function () {
    this.setElement(this.template(this.templateData));
    return this;
  }
});
