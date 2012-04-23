
(function($) {

    $.neat = function(el, options) {

        var defaults = {
                speed: 250,
                itemClass: '.item',
                fluidPic: '.sr-pic',
                fluidPicMargin: 100,
                fluidPicMinSize: 400,
                easing: 'swing',
                easingAfterScroll: 'swing',
                forceScrolling: true,
                horizontal: false,
                hidePrevious: false,
                hidePreviousWith3d: false
            },
            cfg = {},
            cacheImages = {},
            plugin = this,
            w = $(window),
            d = $(document),
            b = $('body'),
            $element = $(el),
            $items,
            $fluidPics,
            $active,
            element = el;

        /**
         * Init plugin
         */
        plugin.settings = {};
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            $.Android = (navigator.userAgent.match(/Android/i));
            $.iPhone = ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)));
            $.iPad = ((navigator.userAgent.match(/iPad/i)));
            $.iOs4 = (/OS [1-4]_[0-9_]+ like Mac OS X/i.test(navigator.userAgent));

            $items = $element.find(plugin.settings.itemClass);

            // Set global var
            cfg.scroll = ($.browser.mozilla || $.browser.msie) ? $('html') : b;
            cfg.scrollSpeed = plugin.settings.speed;
            cfg.scrollwheel = true;
            cfg.timer = null;
            cfg.dir = 'up';
            cfg.fluidPictures = ($(plugin.settings.fluidPic).length) ? true : false;
            cfg.mobile = ($.iPhone || $.iPad || $.Android) ? true : false;

            cfg.scrollPos = (plugin.settings.horizontal) ? w.scrollLeft() : w.scrollTop();
            cfg.winSize = (plugin.settings.horizontal) ? w.width() : w.height();
            cfg.half = (plugin.settings.horizontal) ? cfg.winSize/2 : cfg.winSize/2;
            cfg.offsetActive = 0;

            if(cfg.fluidPictures){
                $fluidPics =  $(plugin.settings.fluidPic);
                var images = [],
                    imagesLoaded = 0,
                    loadAllImages = function loadAllImages(callback){
                        if(images.length === 0){
                            callback();
                            return false;
                        }
                        var img = new Image();
                        $(img).attr('src',images[imagesLoaded]).load(function(){
                        imagesLoaded++;
                        if(imagesLoaded == images.length)
                            callback();
                        else
                            loadAllImages(callback);
                        });
                    };

                $fluidPics.each(function(i,el){
                    images.push(el.src);
                });

                loadAllImages(function(){
                    $fluidPics.addClass('loaded');
                    scaleImage();
                });
            }

            if(plugin.settings.horizontal){
                setHorizontalLayout();
                b.addClass('horizontal');
            }

            setActive();
            setEvents();
        };

        plugin.reInit = function(){

            $items = $element.find(plugin.settings.itemClass);
            cfg.fluidPictures = ($(plugin.settings.fluidPic).length) ? true : false;

            if(cfg.fluidPictures){
                $fluidPics = $(plugin.settings.fluidPic);
                var images = [],
                    imagesLoaded = 0,
                    loadAllImages = function loadAllImages(callback){
                        if(images.length === 0){
                            callback();
                            return false;
                        }
                        var img = new Image();
                        $(img).attr('src',images[imagesLoaded]).load(function(){
                        imagesLoaded++;
                        if(imagesLoaded == images.length)
                            callback();
                        else
                            loadAllImages(callback);
                        });
                    };

                $fluidPics.not('.loaded').each(function(i,el){
                    images.push(el.src);
                });

                loadAllImages(function(){
                    $fluidPics.addClass('loaded');
                    scaleImage();
                });
            }

            if(plugin.settings.horizontal){
                setHorizontalLayout();
            }

            setActive();
        };


        // Public methods ========================

        /**
         * Set events for plugin
         */
        var setEvents = function setEvents() {

            w.bind('scroll', function(){
                // Set essential mixins
                cfg.scrollPos = (plugin.settings.horizontal) ? w.scrollLeft() : w.scrollTop();

                setActive();

                if(plugin.settings.forceScrolling && !cfg.mobile)
                    getStopScrolling();
                if(plugin.settings.hidePrevious && !cfg.mobile)
                    hidePrevious();
            });

            if(plugin.settings.forceScrolling && !cfg.mobile){

                d.mousewheel(function(e, delta, deltaX, deltaY) {

                    if(plugin.settings.horizontal){

                        if (deltaX > 0){
                            cfg.scrollwheel = true;
                        } else if (deltaX < 0){
                            cfg.scrollwheel = true;
                        }

                    } else {

                        if (deltaY > 0){
                            cfg.scrollwheel = true;
                        } else if (deltaY < 0){
                            cfg.scrollwheel = true;
                        }

                    }
                    
                });

            }

             d.on('keydown', function(e){

                if(e.keyCode === 38 || e.keyCode === 37) {
                    goTo('up');
                    e.preventDefault();
                    return false;
                }

                if(e.keyCode === 40 || e.keyCode === 39){
                    goTo('down');
                    e.preventDefault();
                    return false;
                }

            });

            d.click(function(e){

                // @TODO
               if( !((($(e.target).parents('a').length) ? true : false) || $(e.target).is('a')) &&
                !((($(e.target).parents('button').length) ? true : false) || $(e.target).is('button')) &&
                !((($(e.target).parents('input').length) ? true : false) || $(e.target).is('input')) &&
                !((($(e.target).parents('iframe').length) ? true : false) || $(e.target).is('iframe')) &&
                !((($(e.target).parents('embed').length) ? true : false) || $(e.target).is('embed')) &&
                !((($(e.target).parents('video').length) ? true : false) || $(e.target).is('video')) &&
                !((($(e.target).parents('audio').length) ? true : false) || $(e.target).is('audio')) &&
                !((($(e.target).parents('object').length) ? true : false) || $(e.target).is('object'))){
                goTo(cfg.dir);
               }

            });

            d.mousemove(function(e){
                var pos = (plugin.settings.horizontal) ? e.pageX-cfg.scrollPos : e.pageY-cfg.scrollPos;

                if (pos < cfg.half){
                    b.removeClass('godown');
                    cfg.dir = 'up';
                } else if (pos > cfg.half) {
                    b.addClass('godown');
                    cfg.dir = 'down';
                }
            });

            w.bind('resize', function(){
                // Set essential mixins
                cfg.scrollPos = (plugin.settings.horizontal) ? w.scrollLeft() : w.scrollTop();
                cfg.winSize = (plugin.settings.horizontal) ? w.width() : w.height();
                cfg.half = (plugin.settings.horizontal) ? cfg.winSize/2 : cfg.winSize/2;
                

                if(cfg.fluidPictures)
                    scaleImage();

                if(plugin.settings.hidePrevious && !cfg.mobile)
                    hidePrevious();

                if(plugin.settings.forceScrolling && !cfg.mobile){
                    cfg.scrollwheel = true;
                    getStopScrolling();
                }
                    
            });
        };


        // Private methods ========================
        
        /**
         * Set active item during scroll
         */
        var setActive = function setActive() {

            $.each($items, function(i,el){
                var $el = $(el),
                    elOffset = (plugin.settings.horizontal) ? $el.offset().left : $el.offset().top;

                if(cfg.scrollPos >= elOffset && cfg.scrollPos < elOffset+cfg.winSize){
                    if(!$el.hasClass('active')){
                        $items.removeClass('active');
                        $el.addClass('active');
                        cfg.offsetActive = elOffset;
                        $active = $el;
                        return false;
                    }
                }

            });
        };

        var hidePrevious = function hidePrevious(){
            var st, pos, opacity, threeD;

            if($active.length){
                
                st = (plugin.settings.horizontal) ? cfg.scrollPos - $active.offset().left : cfg.scrollPos - $active.offset().top;
                threeD = ((st/5) >= 90) ? 90 : (st/5);
                opacity = (plugin.settings.horizontal) ? 1-(st/1000) : 1-(st/400);

                if(cfg.winSize <= 400){
                    pos = (plugin.settings.horizontal) ? st/6 :  st/5;
                } else if(cfg.winSize <= 600){
                    pos = (plugin.settings.horizontal) ? st/5.25 :  st/3.85;
                } else {
                    pos = (plugin.settings.horizontal) ? st/4 : st/2.5;
                }

                if(plugin.settings.hidePreviousWith3d){
                    $active.find('>div').css({
                        '-webkit-transform': (plugin.settings.horizontal) ? 'rotateY('+threeD+'deg) translateX('+pos+'px)'  : 'rotateX('+threeD+'deg) translateY('+pos+'px)',
                        '-moz-transform': (plugin.settings.horizontal) ? 'rotateY('+threeD+'deg) translateX('+pos+'px)'  : 'rotateX('+threeD+'deg) translateY('+pos+'px)',
                        'transform': (plugin.settings.horizontal) ? 'rotateY('+threeD+'deg) translateX('+pos+'px)'  : 'rotateX('+threeD+'deg) translateY('+pos+'px)',
                        opacity: opacity,
                        visibility: (opacity <= 0) ? 'none' : 'table-cell'
                    });
                } else {
                    $active.find('>div').css({
                      '-webkit-transform': (plugin.settings.horizontal) ? 'translateX('+pos+'px) translateZ(0)' : 'translateY('+pos+'px) translateZ(0)',
                      '-moz-transform': (plugin.settings.horizontal) ? 'translateX('+pos+'px) translateZ(0)' : 'translateY('+pos+'px) translateZ(0)',
                      'transform': (plugin.settings.horizontal) ? 'translateX('+pos+'px) translateZ(0)' : 'translateY('+pos+'px) translateZ(0)',
                      opacity: opacity,
                      display: (opacity <= 0) ? 'none' : 'table-cell'
                    });
                }
            }
        };

        var getStopScrolling = function getStopScrolling(){
            // Detect stop scrolling
            function time(){
                cfg.timer = window.setTimeout(function(){
                    if(cfg.scrollwheel === true){
                        cfg.scrollwheel = false;

                        if((cfg.scrollPos - cfg.offsetActive ) >= cfg.half){
                            goTo('down',true);
                        } else {
                            goTo('active',true);
                        }
                    }
                }, 400);
            }
            
            window.clearTimeout(cfg.timer);
            time();

        };

        var goTo = function goTo(direction, fast){
            var $next = null,
                position = null,
                speed = (fast) ? cfg.scrollSpeed*1.25 : cfg.scrollSpeed,
                easing = (fast) ? plugin.settings.easingAfterScroll : plugin.settings.easing;

            if(cfg.scroll.is(':animated')){
                return false;
            }

            if(direction === 'up'){
                $next = $active.prev();
                if($next.length){
                    position = (plugin.settings.horizontal) ? $next.offset().left : $next.offset().top;
                }
            } else if (direction === 'down') {
                $next = $active.next();
                if($next.length){
                    position = (plugin.settings.horizontal) ? $next.offset().left : $next.offset().top;
                }
            } else if (direction === 'active') {
                $next = $active;
                if($next.length){
                    position = (plugin.settings.horizontal) ? $next.offset().left : $next.offset().top;
                }
            }
                

            if($next.length && plugin.settings.horizontal) {
                cfg.scroll.animate({
                    scrollLeft: position
                },{ duration: speed, easing: easing });
            } else if($next.length){
                cfg.scroll.animate({
                    scrollTop: position
                },{ duration: speed, easing: easing });
            }
            

        };

        var getImageSize = function getImageSize(el, callback){
            var screenImage = el,
                src = screenImage.attr('src'),
                theImage = new Image();
            
            if(cacheImages[src] === undefined) {
                theImage.src = src;
                $(theImage).load(function(){
                    cacheImages[src] = {
                        width: theImage.width,
                        height: theImage.height
                    };
                    callback({width: cacheImages[src].width, height: cacheImages[src].height});
                });
            } else {
                callback({width: cacheImages[src].width, height: cacheImages[src].height});
            }
            
        };

        var scaleSize = function scaleSize(maxW, maxH, currW, currH){
            var ratio = currH / currW;
            
            if(currW >= maxW && ratio <= 1){
                currW = maxW;
                currH = currW * ratio;
            }
            if(currH >= maxH){
                currH = maxH;
                currW = currH / ratio;
            }

            return [currW, currH];
        };

        var scaleImage = function scaleImage(){
            var winWidth = w.width(),
                winHeigth = w.height();

            $.each($fluidPics, function(i,el){
                var $el = $(el);

                getImageSize($el, function(sizes){
                    var width = (winWidth >= plugin.settings.fluidPicMinSize) ? winWidth : plugin.settings.fluidPicMinSize,
                        height = (winHeigth >= plugin.settings.fluidPicMinSize) ? winHeigth : plugin.settings.fluidPicMinSize;

                    var newSize = scaleSize(width - plugin.settings.fluidPicMargin,
                                            height - plugin.settings.fluidPicMargin,
                                            sizes.width,
                                            sizes.height);
                    $el.css({
                        width: newSize[0],
                        height: newSize[1]
                    });

                });

            });
        };


        var setHorizontalLayout = function setHorizontalLayout(){
            var len = $items.length;
            $items.css({
                width: (100/len)+'%',
                position:'relative',
                float:'left'
            });
            $element.css({width: 100*len+'%'});
        };

        plugin.init();

    };

    $.fn.neat = function(options) {

        return this.each(function() {
            if (undefined === $(this).data('neat')) {
                var plugin = new $.neat(this, options);
                $(this).data('neat', plugin);
            }
        });

    };

})(jQuery);