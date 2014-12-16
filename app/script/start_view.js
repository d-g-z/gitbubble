var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var startTmpl = require('../hbs/start.hbs');

module.exports = Backbone.View.extend({

  events: {
    'click .js_show_tips': 'startShowTips'
  },

  template: startTmpl,

  triggerShowTips: function () {},

  initialize: function (options) {
    _.extend(this, options);
    this.on('startLoadElements', this.startLoadElements);
    this.render();
    this.$el.hide();
  },

  startShowTips: function () {
    this.$reindeer.css({
      backgroundPositionX: '-400px'
    });
    this.$santa.css({
      backgroundPositionX: $(document).width() + 400 + 'px'
    });
    this.$start.css({
      width: '0px',
      height: '0px'
    });
    this.triggerShowTips();
  },

  startLoadElements: function (dimension) {
    // todo: on resize
    var mascotSize = dimension.h * 0.3431 * 4 / 3;
    this.mascotSize = mascotSize;
    this.$el.show();
    
    this.$reindeer.css({
      height: mascotSize * 0.9 + 'px',
      backgroundPositionY: mascotSize * 0.9 * 0.25 + 'px',
      backgroundPositionX: -mascotSize * 0.9 * 0.2 + 'px'
    });

    this.$santa.css({
      height: mascotSize + 'px',
      backgroundPositionY: mascotSize * 0.25 + 'px',
      backgroundPositionX: dimension.w - mascotSize * 0.7 + 'px'
    });

    this.$start.css({
      width: '100px',
      height: '100px'
    });
  },

  render: function () {
    this.setElement(this.template({
      santaBackgroundPosX: $(document).width() + 400
    }));
    this.$reindeer = this.$el.find('.reindeer-start-wrapper');
    this.$santa = this.$el.find('.santa-start-wrapper');
    this.$start = this.$el.find('.start-button-wrapper a');
    return this;
  }
});
