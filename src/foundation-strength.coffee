#
# foundation-strength.js
# Author: Alexander Egorov
# Original author: Aaron Lumsden
# Licensed under the MIT license
#

do ($) ->
  defaults =
    show_meter: true
    meterClasses: 'radius'
    show_messages: true
    classes:
      nopassword: 'nopassword'
      weak: 'password-weak'
      moderate: 'password-moderate'
      strong: 'password-strong'

  FoundationStrength = (form, options) ->
    @$form = $(form)
    @options = $.extend({}, defaults, options)
    @init()

  FoundationStrength.prototype = init: ->
    options = @options
    $appendee = undefined
    $form = @$form # Apped to which element
    $pass = $form.find('input[type=password]').first() # Whole form
    # 'Good passwords start to score around 60 scores'
    # http://stackoverflow.com/questions/948172/password-strength-meter

    get_password_score = (p) ->
      score = 0
      if !p
        return score
      # Award every unique letter until 5 repetitions
      letters = new Object
      i = 0
      while i < p.length
        letters[p[i]] = (letters[p[i]] or 0) + 1
        score += 5.0 / letters[p[i]]
        i++
      # Bonus points for mixing it up
      variations =
        digits: /\d/.test(p)
        lower: /[a-z]/.test(p)
        upper: /[A-Z]/.test(p)
        nonWords: /\W/.test(p)
      variationCount = 0
      for check of variations
        variationCount += if variations[check] == true then 1 else 0
      score += (variationCount - 1) * 10
      parseInt score

    get_password_strength = (score) ->
      if score > 60
        return 'strong'
      if score > 40
        return 'moderate'
      'weak'

    if @$form.prop('localName') != 'form'
      # Check if we work with form element
      console.error 'Foundation strength element should be \'form\'.'
    # Check parent element of input
    if $pass.parent().prop('localName') == 'label'
      # If this is label element, append meter and message after it.
      $appendee = $pass.parent()
    else
      # If this is not lable append meter and message after input.
      $appendee = $pass
    # Meter
    if options.show_meter == true
      $appendee.after '<div class=\'strength-meter progress ' + options.meterClasses + '\'>' + '<span class=\'meter\'></span></div>'
      $meter = @$form.find('.strength-meter .meter')
    # Update function

    update = (l, s, p) ->
      `var class_to_add`
      # length, strength, points
      if l == 0
        # don't have any password
        class_to_add = options.classes.nopassword
      else
        class_to_add = options.classes[s]
      classes_all = []
      $.each options.classes, (k, v) ->
        classes_all.push v
      classes_to_remove = $.grep(classes_all, (c) ->
        c != class_to_add
      )
      $form.addClass(class_to_add).removeClass classes_to_remove.join(' ')
      meter_width = if p < 100 then p else 100
      $meter.width meter_width + '%'

    update_caps = (c) ->
      is_on = 'caps-on'
      is_off = 'caps-off'
      if c
        $form.addClass(is_on).removeClass(is_off)
      else
        $form.addClass(is_off).removeClass(is_on)

    update 0, 'weak', 0
    update_caps false
    $inputs = $form.find('[type=text],[type=email],[type=password],:text')
    $inputs.each (event) ->
      $(this).bind 'keypress', (event) ->
        s = String.fromCharCode(event.which)
        # TODO: Bulletprof regexp for char
        if s.match(/[A-Za-zА-Яа-я]/)
          if s.toUpperCase() == s and s.toLowerCase() != s and !event.shiftKey
            update_caps true
          else
            update_caps false

    $pass.bind 'keypress keyup change', (event) ->
      password = $(this).val()
      score = get_password_score(password)
      strength = get_password_strength(score)
      # console.log('Score ' + score + ' it\'s ' + strength + '!');
      # console.log('Password value: ' + password);
      update password.length, strength, score
    # window.wtf = this;

  $.fn.extend strength: (options) ->
    # Wrapper around the constructor preventins multiple instantiations
    @each ->
      if !$.data(this, 'FoundationStrength')
        $.data this, 'FoundationStrength', new FoundationStrength(this, options)
