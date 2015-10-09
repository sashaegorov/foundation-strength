# Foundation-strength.js

Dead simple password strength plugin for [Foundation](http://foundation.zurb.com/).
Just. Show me. The demo.

`Foundation-strength.js` featuring:
- Password strength indicator with *colors*!
- Simple yet enough `Caps lock` detection

## Documentation

Provides strength indicator to show how secure a users password is.

## Install

Make sure assets below added after `foundation.js`  and `foundation.css`.

```
<script type='text/javascript' src='../src/foundation-strength.js'></script>
<link href='../src/foundation-strength.css' rel='stylesheet' type='text/css'>
```

Create a `password` input field within `form`.

```
<form class='strength strength-1'>
...
<input class='radius' type='password' placeholder='Password'>
...
</form>
```

Initiate the plugin.

```
<script>
  $(document).ready(function($) {
    $('.strength-1').strength();
    $(document).foundation();
  });
</script>
```

# TODO

- Demo!
- Ability to block submit of form
