var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var crackTmpl = require('../hbs/crack.hbs');

module.exports = Backbone.View.extend({
  template: crackTmpl,
  fragments: [],

  initialize: function (options) {
    _.extend(this, options);
  },

  render: function () {
    this.pos = this.bubble.diameter / 2 * 0.62;
    this.setElement(this.template({
      pos: this.pos
    }));
    return this;
  },

  grow: function () {
    var diameter = this.bubble.diameter;
    var $img = this.$el.find('.js_crack_img');

    this.$el.css({
      top: '0px',
      left: '0px',
      opacity: '0.5'
    });

    $img.css({
      width: (this.bubble.diameter - this.pos) + 'px',
      height: (this.bubble.diameter - this.pos) + 'px'
    });
  },

  disappear: function () {
    this.$el.css({
      opacity: '0'
    });
  }
});
