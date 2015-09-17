/*
 * foundation-strength.js
 * Author: Alexander Egorov
 * Original author: Aaron Lumsden
 * Licensed under the MIT license
 */

(function($) {
  'use strict';

  var plugin_name = "passworder";
  var defaults = {
    show_meter: true,
    meter_style: 'radius', // can be 'round' or 'radius'
    show_messages: true,
    messages: {
      strength: 'This password is {s}', // marker will be replaced
      nopassword: 'No password.',
      weak: 'too weak...',
      moderate: 'moderate.',
      strong: 'strong!'
    },
    classes: {
      nopassword: 'nopassword',
      weak: 'password-weak',
      moderate: 'password-moderate',
      strong: 'password-strong'
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
      var $appende;
      var $form = this.$form;
      var $pass = $form.find('input[type=password]').first();

      // Check if we work with form element
      if (this.$form.prop('localName') != 'form') {
        console.error('Foundation passworder element should be \'form\'.');
        return;
      }

      // Check parent element of input
      if ($pass.parent().prop('localName') == 'label') {
        // If this is label element, append meter and message after it.
        $appende = $pass.parent();
      } else {
        // If this is not lable append meter and message after input.
        $appende = this.$pass;
      }

      // Message
      if (options.show_messages === true) {
        $appende.after('<small class="passworder-message">' +
          options.messages.nopassword +
          '</small>');

        var $message = this.$form.children('.passworder-message');

        // Update message function
        var update_message = function(l,s) {
          if (l === 0) { // don't have any password
            $message.text(options.messages.nopassword);
          } else {
            var msg = options.messages.strength;
            $message.text(msg.replace(/\{s\}/, options.messages[s]));
          }
        };
      }

      // Meter (create only)
      if (options.show_meter === true) {
        $appende.after('<div class="passworder-meter progress ' +
          options.meter_style + '">' + '<span class="meter"></span></div>');
      }

      // Update function
      var update = function(l,s) {
        // Update message
        if (typeof update_message !== 'undefined' && $.isFunction(update_message)) {
          update_message(l,s);
        }

        if (l === 0) { // don't have any password
          var class_to_add = options.classes.nopassword;
        } else {
          var class_to_add = options.classes[s];
        }
        var classes_all = [];
        $.each( options.classes, function(k, v) {
          classes_all.push(v);
        });

        var classes_to_remove = $.grep(classes_all, function(c) {
          return c !== class_to_add;
        });

        $form.addClass(class_to_add);
        $form.removeClass(classes_to_remove.join(' '));
      }

      $pass.bind('keyup', function(event) {
        var password = $(this).val();
        var score = get_password_score(password);
        var strength = get_password_strength(score);
        update(password.length, strength);
        // console.log('Score ' + score + ' it\'s ' + strength + '!');
        // console.log('Password value: ' + password);
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
