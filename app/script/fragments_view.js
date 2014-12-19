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
    var unit = diameter / 5;

    this.unit = unit;
    this.center = diameter / 2;

    for (var i = 1; i <= 3; i++) {
      for (var j = 1; j <= 3; j++) {
        var d = _.random(2, unit + 2);
        this.fragments.push({
          diameter: d,
          posX: i * unit,
          posY: j * unit
        });
      }
    }
  },

  render: function () {
    this.setElement(this.template({
      fragments: this.fragments,
      color: this.bubble.fragmentsColor,
      center: this.center
    }));
    return this;
  },

  spread: function () {
    var elFragments = this.$el.find('img');

    for (var i = 0; i < 9; i += 1) {
      var el = elFragments[i];
      el.style.top = el.dataset.posy + 'px';
      el.style.left = el.dataset.posx + 'px';
      el.style.opacity = '1';
    }
  },

  gather: function () {
    var elFragments = this.$el.find('img');
    var unit = this.unit;
    var base = unit * 2;

    for (var i = 0; i < 9; i += 1) {
      var el = elFragments[i];
      var fragmentDiameter = parseInt(el.dataset.diameter, 10);
      var x = parseInt(el.dataset.posx, 10);
      var y = parseInt(el.dataset.posy, 10);
      var left = x;
      
      if (x !== base) {
        var offset = _.random(0, unit * 1.2);
        left = x < base ? base - offset : base + offset;
        this.edgedFragments.push(el);
      }

      if (fragmentDiameter > 9) {
        this.fatFragments.push(el);
      } else {
        this.smallFragments.push(el);
      }

      el.style.top = y - base / 2 + 'px';
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
      el.style.width = (parseInt(el.dataset.diameter, 10) / 2) + 'px';
      el.style.height = (parseInt(el.dataset.diameter, 10) / 2) + 'px';
      el.style.top = (parseInt(el.style.top, 10) - 15) + 'px';
    }

    for (var i = thins.length - 1; i >= 0; i--) {
      var el = thins[i];
      el.style.top = (parseInt(el.style.top, 10) - 30) + 'px';
    }
  }
});
