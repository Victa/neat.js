# neat.js


The jQuery plugin written for [Neat Tumblr Theme](http://neat.victorcoulon.fr/) will be released on MIT licence soon.

Stay tuned 



## DRAFT 


### Markup

```html
<section class="items">

    <article class="item">
        [...]
    </article>

    [...]

    <article class="item photo">
      <div>

        <figure>
          <img src="pic.jpg" class="neat-pic" alt="My awesome pic">
        </figure>

      </div>
    </article>

    [...]

</section>
```

### Launch the plugin

```js
$('.items').neat({
      speed: 200,
      fluidPicMargin: 200,
      fluidPicMinSize: 400,
      forceScrolling: true,
      horizontal: false,
      hidePrevious: true,
      hidePreviousWith3d: false
});
```