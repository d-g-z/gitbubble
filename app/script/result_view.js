var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var resultTmpl = require('../hbs/result.hbs');

module.exports = Backbone.View.extend({

  templateData: {},

  events: {
  },

  template: resultTmpl,

  initialize: function (options) {
    _.extend(this, options);
    this.render();
  },

  render: function () {
    this.setElement(this.template(this.templateData));
    return this;
  },

  triggerEndGame: function (score) {
    this.$el.find('.js_result_score').text(score);
    this.$el.show();
  }
});
