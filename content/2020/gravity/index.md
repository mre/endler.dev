+++
title="Gravity"
date=2020-05-29
[extra]
excerpt = "Here's a test to check your age: Do you still remember that funny JavaScript gravity effect, which Google used on their homepage ten years ago?"
logo="foo.svg"
css=true
+++


Here's a test to show your age:

Do you still remember [that funny JavaScript gravity effect](https://josephpcohen.com/w/gravityscript/), which Google used on their homepage ten years ago? This one?

{{ video(id="wskgClFNlJw", preview="gravity.jpg")}}

I wanted to have some fun and integrated it into a website I was building.
Unfortunately, it didn't work out-of-the-box.
It choked on some DOM elements that were not strictly classes (like SVG elements).
So, in good hacker fashion,  I quickly patched up the script (it's just a three-line change), and now it's back to its former glory.

Test it here! (Caution: you'll have to reload the page after that. 😏)

<a class="btn" href='#' id='gravity'>Apply Gravity</a>

<script type="text/javascript">
    var myLink = document.getElementById('gravity');

    myLink.onclick = function(){

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "gravity.js"; 
        document.getElementsByTagName("head")[0].appendChild(script);
        return false;
    }
</script>

Anyway, feel free to add it to your own sites and have some fun.
It's also great to prank your friends.
Simply add that single line to any website and weeee!

```html
<script type="text/javascript" src="https://endler.dev/2020/gravity/gravity.js"></script>
```

Sometimes I miss those simple times of the early web...