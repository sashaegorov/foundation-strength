/*
 * foundation-strength.js
 * Author: Alexander Egorov
 * Original author: Aaron Lumsden
 * Licensed under the MIT license
 */

(function($) {
  'use strict';

  var plugin_name = "strength";
  var defaults = {
    show_meter: true,
    meter_style: 'radius', // 'round' or 'radius'
    show_messages: true,
    classes: {
      nopassword: 'nopassword',
      weak: 'password-weak',
      moderate: 'password-moderate',
      strong: 'password-strong',
    }
  };

  function FoundationPassworder(form, options) {
    this.$form = $(form);
    this.options = $.extend({}, defaults, options);
    this.init();
  }

  FoundationPassworder.prototype = {
    init: function() {
      var options = this.options;
      var $appendee; // Apped to whom
      var $form = this.$form; // Whole form
      var $pass = $form.find('input[type=password]').first();

      if (this.$form.prop('localName') != 'form') {
        // Check if we work with form element
        console.error('Foundation strength element should be \'form\'.');
        return;
      }

      // Check parent element of input
      if ($pass.parent().prop('localName') == 'label') {
        // If this is label element, append meter and message after it.
        $appendee = $pass.parent();
      } else {
        // If this is not lable append meter and message after input.
        $appendee = $pass;
      }

      // Meter
      if (options.show_meter === true) {
        $appendee.after('<div class="strength-meter progress ' +
          options.meter_style + '">' + '<span class="meter"></span></div>');
        var $meter = this.$form.find('.strength-meter .meter');
      }

      // Update function
      var update = function(l, s, p) {
        // length, strength, points
        if (l === 0) { // don't have any password
          var class_to_add = options.classes.nopassword;
        } else {
          var class_to_add = options.classes[s];
        }
        var classes_all = [];
        $.each(options.classes, function(k, v) {
          classes_all.push(v);
        });
        var classes_to_remove = $.grep(classes_all, function(c) {
          return c !== class_to_add;
        });
        $form.addClass(class_to_add).removeClass(classes_to_remove.join(' '));

        var meter_width = p < 100 ? p : 100;
        $meter.width(meter_width + '%');
      }

      var update_caps = function(c) {
        var on = 'caps-on';
        var off = 'caps-off';
        if (c) {
          $form.addClass(on).removeClass(off);
        } else {
          $form.addClass(off).removeClass(on);
        }
      }

      update(0, 'weak', 0);
      update_caps(false);

      var $inputs = $form.find(
        '[type=text],[type=email],[type=password],:text');

      $inputs.each(function(event) {
        $(this).bind('keypress', function(event) {
          var s = String.fromCharCode(event.which);
          // TODO: Bulletprof regexp for char
          if (s.match(/[A-Za-zА-Яа-я]/)) {
            if (s.toUpperCase() === s && s.toLowerCase() !== s && !event.shiftKey) {
              update_caps(true);
            } else {
              update_caps(false);
            }
          }
        });
      });

      $pass.bind('keypress keyup change', function(event) {
        var password = $(this).val();
        var score = get_password_score(password);
        var strength = get_password_strength(score);
        // console.log('Score ' + score + ' it\'s ' + strength + '!');
        // console.log('Password value: ' + password);
        update(password.length, strength, score);
      });

      // "Good passwords start to score around 60 scores"
      // http://stackoverflow.com/questions/948172/password-strength-meter
      function get_password_score(p) {
        var score = 0;
        if (!p)
          return score;
        // Award every unique letter until 5 repetitions
        var letters = new Object();
        for (var i = 0; i < p.length; i++) {
          letters[p[i]] = (letters[p[i]] || 0) + 1;
          score += 5.0 / letters[p[i]];
        };
        // Bonus points for mixing it up
        var variations = {
          digits: /\d/.test(p),
          lower: /[a-z]/.test(p),
          upper: /[A-Z]/.test(p),
          nonWords: /\W/.test(p),
        }
        var variationCount = 0;
        for (var check in variations) {
          variationCount += (variations[check] == true) ? 1 : 0;
        }
        score += (variationCount - 1) * 10;
        return parseInt(score);
      };

      function get_password_strength(score) {
        if (score > 60)
          return 'strong';
        if (score > 40)
          return 'moderate';
        return 'weak';
      };
      // window.wtf = this;
    },
  }

  // Wrapper around the constructor preventins multiple instantiations
  $.fn[plugin_name] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + plugin_name)) {
        $.data(this, "plugin_" + plugin_name, new FoundationPassworder(this, options));
      }
    });
  };
})($);
