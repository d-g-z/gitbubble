var $ = require('zepto-browserify').$;
var _ = require('underscore');
var Backbone = require('backbone');
var AppConfig = window.AppConfig;
var fragmentTmpl = require('../hbs/fragment.hbs');

module.exports = Backbone.View.extend({
  template: fragmentTmpl,
  fragments: [],

  initialize: function (options) {
    _.extend(this, options);

    this.fragments = [];
    this.edgedFragments = [];
    this.fatFragments = [];
    this.smallFragments = [];

    var diameter = options.bubble.diameter;

    for (var i = 0; i < 10; i += 1) {
      var d = _.random(2, diameter / 3);
      this.fragments.push({
        diameter: d,
        posX: (diameter - d) / 2,
        posY: (diameter - d) / 2
      });
    }
  },

  render: function () {
    this.setElement(this.template({
      fragments: this.fragments,
      color: this.bubble.color
    }));
    return this;
  },

  spread: function () {
    var elFragments = this.$el.find('img');
    var d = this.bubble.diameter / 2;

    for (var i = 0; i < 10; i += 1) {
      var el = elFragments[i];
      var left = _.random(0, d);
      var fragmentDiameter = parseInt(el.dataset.diameter, 10);
      
      if (left < d * 0.15 || left > d * 0.85) {
        this.edgedFragments.push(el);
      } else if (fragmentDiameter > 10) {
        this.fatFragments.push(el);
      } else {
        this.smallFragments.push(el);
      }

      el.style.top = _.random(0, d) + 'px';
      el.style.left = left + 'px';
    }
  },

  reduce: function () {
    var edged = this.edgedFragments;
    for (var i = edged.length - 1; i >= 0; i--) {
      edged[i].style.opacity = 0;
    }
  },

  loseWeight: function () {
    var fats = this.fatFragments;
    var thins = this.smallFragments;
    for (var i = fats.length - 1; i >= 0; i--) {
      var el = fats[i];
      el.style.opacity = 0;
      el.style.top = (parseInt(el.style.top, 10) - 10) + 'px';
    }

    for (var i = thins.length - 1; i >= 0; i--) {
      var el = thins[i];
      el.style.top = (parseInt(el.style.top, 10) - 20) + 'px';
    }
  }
});
