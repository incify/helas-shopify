var NW = NW || {};
(function ($) {
    var pixelRatio = !!window.devicePixelRatio ? window.devicePixelRatio : 1;
    var $window = $(window),
        $document = $(document),
        body = $("body"),
        $body = $("body"),
        deviceAgent = navigator.userAgent.toLowerCase(),
        isMobileAlt = deviceAgent.match(/(iphone|ipod|ipad|android|iemobile)/),
        imageZoomThreshold = 20;
    var loading = false;
    var infinite_loaded_count = 0;
    var defaultConfig = {
        rootMargin: '0px',
        threshold: 0.1,
        load: function load(element) {

            var base_src = element.getAttribute('data-src') || element.getAttribute('data-lazy') || element.getAttribute('data-lazy-src') || element.getAttribute('data-lazy-original'),
                base_srcset = element.getAttribute('data-src') || element.getAttribute('data-lazy-srcset'),
                base_sizes = element.getAttribute('data-sizes') || element.getAttribute('data-lazy-sizes');

            if (base_src) {
                element.src = base_src;
            }
            if (base_srcset) {
                element.srcset = base_srcset;
            }
            if (base_sizes) {
                element.sizes = base_sizes;
            }
            if (element.getAttribute('data-background-image')) {
                element.style.backgroundImage = 'url(' + element.getAttribute('data-background-image') + ')';
            }
            if (element.getAttribute('data-auto-padding') == 'true') {
              getimgMeta(
                element.getAttribute('data-background-image'),
                function(width, height) {

                  element.style.paddingBottom = (height/width)*100 + '%';
                }
              );
            }
        }
    };
    function getimgMeta(url, callback) {
      var img = new Image();
      img.src = url;
      img.onload = function() { callback(this.width, this.height); }
    }
    function markAsLoaded(element) {
        element.setAttribute('data-element-loaded', true);
    }

    var isLoaded = function isLoaded(element) {
        return element.getAttribute('data-element-loaded') === 'true';
    };
    var onIntersection = function onIntersection(load) {
        return function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.intersectionRatio > 0) {
                    observer.unobserve(entry.target);

                    if (!isLoaded(entry.target)) {
                        load(entry.target);
                        markAsLoaded(entry.target);
                    }
                }
            });
        };
    };
    jQuery.exists = function(selector) {return ($(selector).length > 0);}

    NW.Browser = (function() {
        var name, version, platform_name, _tmp;
        var ua = navigator.userAgent.toLowerCase(),
            platform = navigator.platform.toLowerCase(),
            UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', '0'];

        function getInternetExplorerVersion() {
            var rv = -1;
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua2 = navigator.userAgent;
                var re2 = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re2.exec(ua2) != null)
                    rv = parseFloat(RegExp.$1);
            } else if (navigator.appName == 'Netscape') {
                var ua2 = navigator.userAgent;
                var re2 = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (re2.exec(ua2) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        }
        _tmp = getInternetExplorerVersion();
        if (_tmp != -1) {
            name = 'ie';
            version = _tmp;
        } else {
            name = (UA[1] == 'version') ? UA[3] : UA[1];
            version = UA[2].substring(0, 2);
        }
        platform_name = ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0];
        $('html').addClass(name).addClass(name + ' ' + name + version + ' platform-' + platform_name);
        return {
            name: name,
            version: version,
            platform: platform_name
        };
    })();
    NW.SitePreload = {
      init: function(){
        setTimeout(function() {
            $body.removeClass('site-loading');
        }, 500);
        $window.load(function() {
            $body.removeClass('site-loading');
        });
        $window.on('beforeunload', function(e) {
            if (NW.Browser.name != 'safari') {
                $('.page').css('opacity', '0');
                $body.addClass('site-loading');
            }
        });
        $window.on('pageshow', function(e) {
            if (e.originalEvent.persisted) {
                $body.removeClass('site-loading');
            }
        });
      },
    };
    NW.header = {
        init: function(){
            //header vertical
            $('.header-container.type2').parent().parent().parent().parent().parent().find('.page').addClass('page-have-header-vertical');
            $(window).load(function(){

                $.mCustomScrollbar.defaults.scrollButtons.enable=false; //enable scrolling buttons by default
                $.mCustomScrollbar.defaults.axis="y"; //enable 2 axis scrollbars by default
                $.mCustomScrollbar.defaults.setWidth= false;

                $("#header-aside").mCustomScrollbar({theme:"dark-2"});
                // $(".sidebar-special").mCustomScrollbar({theme:"dark-2"});

            });

            //menu overlay
            $('#open-aside-header-left').click(function () {
                $('.overlay-menu').addClass('active');
            });
            $('.btn-close-menu').click(function () {
               $(this).parent().removeClass('active');
            });

            $('.setting-account .icon-account').click(function (e) {
               $(this).parent('.setting-account').children('.content-inner').slideToggle('300');
                e.stopPropagation();
            });
            $('.setting-account .content-inner').click(function (e) {
                e.stopPropagation();
            });


            //header aside
            $('.currency-wrapper a').click(function (e) {
                $('.setting-currency').slideToggle('300');
                e.stopPropagation();
            });
            $('.language-wrapper a').click(function (e) {
                $('.select-language').slideToggle('300');
                e.stopPropagation();
            });
            $('.setting-currency').click(function (e) {
                e.stopPropagation();
            });
            $('.select-language').click(function (e) {
                e.stopPropagation();
            });

            $('html, body').click(function () {
                $('.setting-currency').slideUp('300');
                $('.select-language').slideUp('300');
                $('.setting-account .content-inner').slideUp('300');
            });
            $('#open-aside-header-right').click(function () {
                $('#header-aside').addClass('show-aside');
                $('body').addClass('open-header-aside');
            });
            $('.btn-close-aside-header').click(function () {
                $(this).parent().parent().parent().parent().removeClass('show-aside');
                $('body').removeClass ('open-header-aside');
            });

            //end header aside

            //header type 8

            $('.toggle-category-menu').click(function (e) {
                $('.nav_categories_inner').slideToggle('300');
                e.stopPropagation();
            })
            $('.nav_categories_inner').click(function (e) {
                e.stopPropagation();
            })
            $('html, body').click(function () {
                $('.nav_categories_inner').slideUp('300');
            });
            $(".top-links-icon").click(function(e){
                if($(this).parent().children("ul.links").hasClass("show")){
                    $(this).parent().children("ul.links").removeClass("show");
                }
                else
                    $(this).parent().children("ul.links").addClass("show");
                e.stopPropagation();
            });
            $('.btn-close-cart-wrapper').click(function () {
                $(this).parent('.cart-wrapper').removeClass('show');
                $('.overlay-background').removeClass('active');
            });

            $('.icon-cart-header').click(function () {
                if ($(this).parent().children('.cart-wrapper').hasClass('show')){
                    $(this).parent().children('.cart-wrapper').removeClass('show');
                }else{
                    $(this).parent().children('.cart-wrapper').addClass('show');
                }
                if ($('.overlay-background').hasClass('active')){
                    $('.overlay-background').removeClass('active');
                }else{
                    $('.overlay-background').addClass('active');
                }
            });
            $('.addtocart .btn-cart-wrapper,.product-options-bottom .addtocart').click(function () {
                setTimeout(function(){
                    $('.cart-wrapper').addClass('show');
                },1000);
            });
            //counter number to target
            $('.count').each(function () {
                $(this).prop('Counter',0).animate({
                    Counter: $(this).text()
                }, {
                    duration: 4000,
                    easing: 'swing',
                    step: function (now) {
                        $(this).text(Math.ceil(now));
                    }
                });
            });
            // $(".mini-cart").hover(function() {
            //     $(this).children().children('.cart-wrapper').fadeIn(200);
            // }, function() {
            //     $(this).children().children('.cart-wrapper').fadeOut(200);
            // });
            $("html,body").click(function(){
                $(".top-links-icon").parent().children("ul.links").removeClass("show");
            });
            $('.menu-icon, .mobile-nav-overlay').click(function(event) {
                if(!$('body').hasClass('md-mobile-menu') && ($(".header-container").hasClass('type11') || $(".header-container").hasClass('type13') || $(".header-container").hasClass('type7')))
                    $('body').addClass('md-mobile-menu');
                if(!$('body').hasClass('mobile-nav-shown')) {
                    $('body').addClass('mobile-nav-shown', function() {
                        setTimeout(function(){
                            $(document).one("click",function(e) {
                                var target = e.target;
                                if (!$(target).is('.mobile-nav') && !$(target).parents().is('.mobile-nav')) {
                                    $('body').removeClass('mobile-nav-shown');
                                }
                            });
                        }, 111);
                    });
                } else{
                    $('body').removeClass('mobile-nav-shown');
                    $(".mobile-nav").removeClass("show");
                }
            });
        }
    };
    NW.megamenu = {
        init: function(){
            $(".main-navigation .top-navigation .static-dropdown .menu-wrap-sub, .main-navigation .top-navigation .m-dropdown .menu-wrap-sub").each(function(){
                $(this).css("left","-9999px");
                $(this).css("right","auto");
            });
            $('.main-navigation').find("li.m-dropdown .menu-wrap-sub ul > li.parent").mouseover(function(){
                var popup = $(this).children(".menu-wrap-sub");
                var w_width = $(window).innerWidth();

                if(popup) {
                    var pos = $(this).offset();
                    var c_width = $(popup).outerWidth();
                    if(w_width <= pos.left + $(this).outerWidth() + c_width) {
                        $(popup).css("left","auto");
                        $(popup).css("right","100%");
                    } else {
                        $(popup).css("left","100%");
                        $(popup).css("right","auto");
                    }
                }
            });
            $('.main-navigation').find("li.static-dropdown.parent,li.m-dropdown.parent").mouseover(function(){
                var popup = $(this).children(".menu-wrap-sub");
                var w_width = $(window).innerWidth();
                if(popup) {
                    var pos = $(this).offset();
                    var c_width = $(popup).outerWidth();
                    if(w_width <= pos.left + $(this).outerWidth() + c_width) {
                        $(popup).css("left","auto");
                        $(popup).css("right","0");
                    } else {
                        $(popup).css("left","0");
                        $(popup).css("right","auto");
                    }
                }
            });
            $(window).resize(function(){
                $(".main-navigation .top-navigation .static-dropdown .menu-wrap-sub, .main-navigation .top-navigation .m-dropdown .menu-wrap-sub").each(function(){
                    $(this).css("left","-9999px");
                    $(this).css("right","auto");
                });
            });
        }
    };
    NW.slideshow = {
        init: function(){
            if($('.slideshow.owl-carousel').length > 0) {
                var carousel = $('.slideshow.owl-carousel');
                carousel.each(function(){
                    NW.slideshow.carouselInit($(this));
                });
                if($(".full-screen-slider").length > 0) {
                    NW.slideshow.fullScreenInit();
                    $(window).resize( function() {
                        NW.slideshow.fullScreenInit();
                    });
                }
            }
            if($('.slick-carousel').length > 0) {
              var slick_carousel = $('.slick-carousel');
              slick_carousel.each(function(){
                  NW.slideshow.slickSlider($(this));
              });
            }
        },

        carouselInit: function(carousel) {
            var data_carousel = carousel.parent().find('.data-slideshow');
            if(data_carousel.data('auto')) {
                var autoplay = true;
                var autoplayTime = data_carousel.data('auto');
            }else{
                var autoplay = false;
                var autoplayTime = 5000;
            }
            if(data_carousel.data('transition') == 'fade' && data_carousel.data('transition') != ''){
                var transition = 'fadeOut';
            }else {
                var transition = false;
            }

            carousel.owlCarousel({
                items: 1,
                smartSpeed: 500,
                autoplay: autoplay,
                lazyLoad: true,
                loop: true,
                autoplayTimeout:autoplayTime,
                autoplayHoverPause: true,
                animateOut: transition,
                dots: data_carousel.data('paging'),
                nav: data_carousel.data('nav'),
                navText: [data_carousel.data('prev'),data_carousel.data('next')]
            });
        },
        slickSlider: function(carousel) {
          carousel.slick();
        },
        fullScreenInit: function() {
            var s_width = $(window).innerWidth();
            var s_height = $(window).innerHeight();
            var s_ratio = s_width/s_height;
            var v_width=320;
            var v_height=240;
            var v_ratio = v_width/v_height;
            $(".full-screen-slider div.item").css("position","relative");
            $(".full-screen-slider div.item").css("overflow","hidden");
            $(".full-screen-slider div.item").width(s_width);
            $(".full-screen-slider div.item").height(s_height);
            $(".full-screen-slider div.item > video").css("position","absolute");
            $(".full-screen-slider div.item > video").bind("loadedmetadata",function(){
                v_width = this.videoWidth;
                v_height = this.videoHeight;
                v_ratio = v_width/v_height;
                if(s_ratio>=v_ratio){
                    $(this).width(s_width);
                    $(this).height("");
                    $(this).css("left","0px");
                    $(this).css("top",(s_height-s_width/v_width*v_height)/2+"px");
                }else{
                    $(this).width("");
                    $(this).height(s_height);
                    $(this).css("left",(s_width-s_height/v_height*v_width)/2+"px");
                    $(this).css("top","0px");
                }
                $(this).get(0).play();
            });
        }
    };
    NW.page = {
        init: function() {
            NW.page.InsertCustomCSS();
            NW.page.dataStyles();
            NW.page.BannerHover();
            if($('body').find('#resultLoading').attr('id') != 'resultLoading'){
                $('body').append('<div id="resultLoading" style="display:none"><div class="spinner"><div class="circle"></i></div><div class="bg"></div></div>');
            }
            if($('#popup_newsletter').length > 0){
                var newsletter = $('#popup_newsletter');
                NW.page.newsletterPopupInit(newsletter);
            }
            NW.page.setVisualState();
            $('.smart_input').on('change', function() {
                'use strict';
                NW.page.setVisualState();
            });
            NW.page.setSelect();
            NW.page.parallaxInit();
            if($('.carousel-init.owl-carousel').length > 0) {
                var carousel = $('.carousel-init.owl-carousel');
                carousel.each(function(){
                    NW.page.carouselInit($(this));
                });
            }
            $(".checkout-info .shipping a").click(function() {
                if ($(this).hasClass('collapsed')) {
                    $(this).parent().removeClass('closed');
                } else {
                    $(this).parent().addClass('closed');
                }
            });
            NW.page.CustomLazyLoad($('.incify-lazyload-image')).observe();
            NW.page.wordRotateInit();
            NW.page.lazyLoadInit();
            NW.page.ElementClickEvent();

            //paralax position
            $(window).scroll(function() {
                var x = $(this).scrollTop();
                $('.parallax-box').each(function(){
                    var top = $(this).offset().top;
                    var height = $(this).outerHeight();
                    var window_height = $(window).height();
                    var scroll_top = $(this).scrollTop();
                    //if(scroll_top > (top-window_height))

                    $(this).css('background-position', '50%' + parseInt(-(x-top) / 10) + 'px');

                });
            });
            //lightcase
            $(document).ready(function() {
                $('a[data-rel^=lightcase]').lightcase();
            });
            //masonry
            $(window).load(function () {
                $('.grid-masonry').masonry({
                    // options
                    itemSelector: '.item-masonry'
                });
                $('.masonry-grid').masonry({
                    // options
                    itemSelector: '.item'
                });
            });

            //Skill Bar
            window.onscroll = function() {myFunction()};
            function myFunction() {
                var local = $('.our_skills');
                if (local.length){
                    var x = 0,
                        x = x + local.offset().top;
                }
                if (document.body.scrollTop > (x-500) || document.documentElement.scrollTop > (x-500)) {
                    $('.skillbar').each(function(){
                        var percent = $(this).data("percent");
                        $(this).find('.skillbar-bar').animate({
                            width:$(this).attr('data-percent')
                        },3000);
                        $(this).find('.percen_text').animate({
                            width:$(this).attr('data-percent')
                        },3000);
                        $(this).find('.percen_text').html(percent);
                    });
                }
            }

            //faqs script
            $('.pertinacia .faqs').click(function(){
                $(this).parent().parent().parent().parent().parent().find('.faqs2').removeClass('active').slideUp(400);
                $(this).parent().parent().parent().parent().parent().find('.item').removeClass('active');
                $(this).parent().parent().parent().parent().parent().find('.ui-2_small-delete').addClass('ui-2_small-add').removeClass('ui-2_small-delete');
                if ($(this).parent().find('.faqs2').is(":hidden")){
                    $(this).parent().find('.faqs2').addClass('active').slideDown(400);
                    $(this).parent().find('.ui-2_small-add').addClass('ui-2_small-delete').removeClass('ui-2_small-add');
                    $(this).parent().parent().parent().parent('.item').addClass('active');
                }else{
                    $(this).parent().find('.faqs2').removeClass('active').slideUp(400);
                    $(this).parent().find('.ui-2_small-delete').addClass('ui-2_small-add').removeClass('ui-2_small-delete');
                    $(this).parent().parent().parent().parent('.item').removeClass('active');
                }

            });

        },
        CustomLazyLoad: function (){
          var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _defaultConfig$option = $.extend({}, defaultConfig, options),
              rootMargin = _defaultConfig$option.rootMargin,
              threshold = _defaultConfig$option.threshold,
              load = _defaultConfig$option.load;

          var observer = void 0;

          if (window.IntersectionObserver) {
              observer = new IntersectionObserver(onIntersection(load), {
                  rootMargin: rootMargin,
                  threshold: threshold
              });
          }

          return {
              triggerSingleLoad: function triggerSingleLoad(){
                  if(!$.exists(selector)){
                      return;
                  }
                  var element = selector.get(0);
                  if(isLoaded(element)){
                      return;
                  }
                  if (observer) {
                      observer.observe(element);
                      return;
                  }
                  load(element);
                  markAsLoaded(element);

              },
              observe: function observe() {
                  if ( !$.exists(selector) ) {
                      return;
                  }
                  for (var i = 0; i < selector.length; i++) {
                      if (isLoaded(selector[i])) {
                          continue;
                      }
                      if (observer) {
                          observer.observe(selector[i]);
                          continue;
                      }
                      load(selector[i]);
                      markAsLoaded(selector[i]);
                  }
              },
              triggerLoad: function triggerLoad(element) {
                  if (isLoaded(element)) {
                      return;
                  }
                  load(element);
                  markAsLoaded(element);
              }
          };
        },
        lazyLoadInit: function(){
            $(".lazy").lazyload({
                effect : "fadeIn",
                data_attribute: "src"
            });
        },
        ElementClickEvent: function(){
          $document.on('click', '.search-control .search-icon', function(e) {
              e.preventDefault();
              $body.addClass('open-search-form');
              setTimeout(function() {
                  $('.searchform-fly .search-field').focus();
              }, 600);
          }).on('click', '.footer-handheld-footer-bar .la_com_action--dropdownmenu .component-target', function(e) {
              e.preventDefault();
              var $_parent = $(this).parent();
              $body.removeClass('open-mobile-menu open-search-form');
              if ($_parent.hasClass('active')) {
                  $_parent.removeClass('active');
                  $body.removeClass('open-overlay');
              } else {
                  $_parent.addClass('active');
                  $_parent.siblings().removeClass('active');
                  $body.addClass('open-overlay');
              }
          }).on('click', '.footer-handheld-footer-bar .la_com_action--searchbox', function(e) {
              e.preventDefault();
              var $this = $(this);
              if ($this.hasClass('active')) {
                  $body.removeClass('open-mobile-menu open-search-form');
                  $this.removeClass('active');
              } else {
                  $body.addClass('open-search-form');
                  $this.addClass('active');
                  $this.siblings().removeClass('active');
                  $body.removeClass('open-overlay');
              }
          }).on('click', '.btn-close-search', function(e) {
              e.preventDefault();
              $body.removeClass('open-search-form');
              if ($('.footer-handheld-footer-bar .la_com_action--searchbox').hasClass('active')) {
                  $('.footer-handheld-footer-bar .la_com_action--searchbox').removeClass('active');
              }
          });
        },
        newsletterPopupInit: function(newsletter){
            $('#popup_newsletter .subcriper_label input').on('click', function(){
                if($(this).parent().find('input:checked').length){
                    NW.collection.createCookie('newsletterSubscribe', 'true', 1);
                } else {
                    NW.collection.readCookie('newsletterSubscribe');
                }
            });
            $('#popup_newsletter .input-box button.button').on('click', function(){
                var button = $(this);
                setTimeout(function(){
                    if(!button.parent().find('input#popup-newsletter').hasClass('validation-failed')){
                        NW.collection.createCookie('newsletterSubscribe', 'true', 1);
                    }
                }, 500);
            });
            if (NW.collection.readCookie('newsletterSubscribe') == null) {
                setTimeout(function(){
                    $.magnificPopup.open({
                        items: {
                            src: $('#popup_newsletter'),
                            type: 'inline'
                        },
                        mainClass: 'mfp-move-from-top',
                        removalDelay: 200,
                        midClick: true
                    });
                }, newsletterData.delay);
            }
        },
        translateBlock: function(blockSelector) {
            if (multi_language && translator.isLang2()) {
                translator.doTranslate(blockSelector);
            }
        },
        translateText: function(str) {
            if (!multi_language || str.indexOf("|") < 0)
                return str;

            if (multi_language) {
                var textArr = str.split("|");
                if (translator.isLang2())
                    return textArr[1];
                return textArr[0];
            }
        },
        setVisualState: function(){
            'use strict';
            $('.smart_input').each(function() {
                'use strict';
                var $value = $(this).val();
                if ($(this).is(':checked')) {
                    $(this).next().addClass("checked");
                } else {
                    $(this).next().removeClass("checked");
                }
            });
        },
        setSelect: function() {
            'use strict';
            if (($.isFunction($.fn.selectize))) {
                if ($('.bootstrap-select').length) {
                    $('.bootstrap-select').selectize();
                }
            }
        },
        carouselInit: function(carousel) {
            var data_carousel = carousel.parent().find('.data-carousel');
            if(data_carousel.data('auto')) {
                var autoplay = true;
                var autoplayTime = data_carousel.data('auto');
            }else{
                var autoplay = false;
                var autoplayTime = 5000;
            }
            if(data_carousel.data('320')){
                var item_320 = data_carousel.data('320');
            }else {
                var item_320 = 1;
            }
            if(data_carousel.data('480')){
                var item_480 = data_carousel.data('480');
            }else {
                var item_480 = 1;
            }
            if(data_carousel.data('640')){
                var item_640 = data_carousel.data('640');
            }else {
                var item_640 = 1;
            }
            if(data_carousel.data('768')) {
                var item_768 = data_carousel.data('768')
            }else{
                var item_768 = 1;
            }
            if(data_carousel.data('992')) {
                var item_992 = data_carousel.data('992')
            }else{
                var item_992 = 1;
            }
            if(data_carousel.data('1200')) {
                var item_1200 = data_carousel.data('1200')
            }else{
                var item_1200 = 1;
            }
            carousel.owlCarousel({
                items: data_carousel.data('items'),
                smartSpeed: 500,
                autoplay: autoplay,
                lazyLoad: true,
                autoplayTimeout:autoplayTime,
                autoplayHoverPause: true,
                dots: data_carousel.data('paging'),
                margin: data_carousel.data('margin'),
                nav: data_carousel.data('nav'),
                navText: [data_carousel.data('prev'),data_carousel.data('next')],
                responsive: {
                    0: {
                        items:item_320
                    },
                    480: {
                        items:item_480
                    },
                    640: {
                        items:item_640
                    },
                    768: {
                        items:item_768
                    },
                    992: {
                        items:item_992
                    },
                    1200: {
                        items:item_1200
                    }
                }
            });
        },
        parallaxInit: function() {
            $(window).stellar({
                responsive: true,
                scrollProperty: 'scroll',
                parallaxElements: false,
                horizontalScrolling: false,
                horizontalOffset: 0,
                verticalOffset: 0
            });
        },
        wordRotateInit: function() {
            $(".word-rotate").each(function() {
                var $this = $(this),
                    itemsWrapper = $(this).find(".word-rotate-items"),
                    items = itemsWrapper.find("> span"),
                    firstItem = items.eq(0),
                    firstItemClone = firstItem.clone(),
                    itemHeight = 0,
                    currentItem = 1,
                    currentTop = 0;
                itemHeight = firstItem.height();
                itemsWrapper.append(firstItemClone);
                $this
                    .height(itemHeight)
                    .addClass("active");
                setInterval(function() {
                    currentTop = (currentItem * itemHeight);
                    itemsWrapper.animate({
                        top: -(currentTop) + "px"
                    }, 300, function() {
                        currentItem++;
                        if(currentItem > items.length) {
                            itemsWrapper.css("top", 0);
                            currentItem = 1;
                        }
                    });
                }, 2000);
            });
        },
        dataStyles: function() {
          var $style_tag = $('#latheme_custom_css');
          if (!$.exists($style_tag)) {
              $style_tag = $('<style></style>', {
                  'id': 'latheme_custom_css'
              }).appendTo('head');
          }
          $('.incify-styles').each(function(){
              var json = $(this).data("styles");
              var section_id = $(this).data('section-id');
              var ctag = '#shopify-section-'+section_id+' [data-section-id="'+section_id+'"]';
              var css_format = JSON.stringify(json).replace(/,/gi, ';').replace(/\"/gi, '');
              ctag += css_format;
              $style_tag.append(ctag);
          });
        },
        InsertCustomCSS: function() {
            var $style_tag = $('#nova_insert_custom_css');

            if (!$.exists($style_tag)) {
                $style_tag = $('<style></style>', {
                    'id': 'nova_insert_custom_css'
                }).appendTo('head');
            }
            $('.custom-styles-css').each(function(){
              var custom_css = $(this).html();
              $style_tag.append(custom_css);
            });
        },
        BannerHover: function() {
          $('.wine-hover-box__inner').each(function(){
              var background = $(this).data("background");
              var hover = $(this).data("hover");
              $(this).css("background-image","url("+background+")");
              $(this).hover(function() {
                $(this).css("background-image","url("+hover+")");
              }, function() {
                $(this).css("background-image","url("+background+")");
              });
          });
        }
    };
    NW.collection = {
        init: function() {
            NW.collection.productGridSetup();
            if($('.product-deal .product-date').length > 0){
                var productsDeal = $('.product-date');
                productsDeal.each(function(){
                    NW.collection.productDealInit($(this));
                });
            }
            NW.collection.layoutSwitch();
            if (NW.collection.readCookie('products-listmode') != null) {
                NW.collection.layoutListInit();
            }
            $(document).on("click", ".close-box", function(){
                $(this).parents('.box-popup').removeClass('show');
            });
            $(document).on("click", ".btn-remove-cart", function(e) {
                e.preventDefault();
                NW.collection.removeCartInit($(this).data('id'));
            });
            $(document).on("click", ".filter-bar a", function(e) {
                e.preventDefault();
                if ($('.filter-option-group').is('.open')) {
                    $('.filter-option-group').removeClass('open');
                }
                else{
                    $('.filter-option-group').addClass('open');
                }
            });
          /* moving action links into product image area */
            $("[data-with-product]").each(function(){
                NW.collection.prevNextProductData($(this));
            });
            NW.collection.addToCart();
            NW.collection.quickshopInit();
            NW.collection.sidebarMenuInit();
            NW.collection.layerFilterInit();
            NW.collection.colorSwatchGridInit();
            NW.collection.tabInfinityScrollInit();
            NW.collection.countDowntInit();
            NW.collection.initInfiniteScrolling();
            NW.collection.sidebarInitToggle();
            NW.collection.sidebarCategoryInitToggle();
            NW.collection.ShopMetro();
            $(window).resize(function(){
              NW.collection.ShopMetro();
            });
        },
        createCookie:function(name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
                expires = "";
            }
            document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
        },
        readCookie:function(name) {
            var nameEQ = escape(name) + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
            }
            return null;
        },
        eraseCookie: function(name) {
            NW.collection.createCookie(name, "", -1);
        },
        productGridSetup: function(){
            $('.category-products .products-grid li.item:nth-child(2n)').addClass('nth-child-2n');
            $('.category-products .products-grid li.item:nth-child(2n+1)').addClass('nth-child-2np1');
            $('.category-products .products-grid li.item:nth-child(3n)').addClass('nth-child-3n');
            $('.category-products .products-grid li.item:nth-child(3n+1)').addClass('nth-child-3np1');
            $('.category-products .products-grid li.item:nth-child(4n)').addClass('nth-child-4n');
            $('.category-products .products-grid li.item:nth-child(4n+1)').addClass('nth-child-4np1');
            $('.category-products .products-grid li.item:nth-child(5n)').addClass('nth-child-5n');
            $('.category-products .products-grid li.item:nth-child(5n+1)').addClass('nth-child-5np1');
            $('.category-products .products-grid li.item:nth-child(6n)').addClass('nth-child-6n');
            $('.category-products .products-grid li.item:nth-child(6n+1)').addClass('nth-child-6np1');
            $('.category-products .products-grid li.item:nth-child(7n)').addClass('nth-child-7n');
            $('.category-products .products-grid li.item:nth-child(7n+1)').addClass('nth-child-7np1');
            $('.category-products .products-grid li.item:nth-child(8n)').addClass('nth-child-8n');
            $('.category-products .products-grid li.item:nth-child(8n+1)').addClass('nth-child-8np1');
        },
        colorSwatchGridInit: function(){
            $('.configurable-swatch-list li a').on('mouseenter', function(e){
                e.preventDefault();
                var productImage = $(this).parents('.item-area').find('.product-figure').find('.product-image');
                productImage.find('img.main').attr('src', $(this).data('image'));
            });
        },
        animateItems: function(productsInstance) {
            productsInstance.find(".product").each(function(aj) {
                $(this).css('opacity', 1);
                $(this).addClass("item-animated");
                $(this).delay(aj * 200).animate({
                    opacity: 1
                }, 500, "easeOutExpo", function() {
                    $(this).addClass("item-animated")
                });
            });
        },
        layoutSwitch: function() {
            var isSwitchingLayout = false;
            $(document).on('click', 'span.layout-opt', function(e) {
                var products = $('#products-grid'),
                    selectedLayout = $(this).data('layout');

                $('.toolbar .view-mode .layout-opt').removeClass('active');
                $(this).addClass('active');
                if(selectedLayout == 'list') {
                    if (NW.collection.readCookie('products-listmode') == null) {
                        NW.collection.createCookie('products-listmode', 1, 10);
                    }
                }else{
                    NW.collection.eraseCookie('products-listmode');
                }
                if (isSwitchingLayout) {
                    return;
                }
                isSwitchingLayout = true;
                products.animate({
                    'opacity': 0
                }, 300);
                setTimeout(function() {
                    products.find('.product').removeClass('product-layout-list product-layout-grid');
                    products.find('.product').addClass('product-layout-' + selectedLayout);
                    if ( $('.products-grid').length > 0 ) {
                        $('.products-grid').children().css('min-height','0');
                    }
                    NW.collection.productGridSetup();
                    products.animate({
                        'opacity': 1
                    }, 200);
                    isSwitchingLayout = false;
                }, 300);
                e.preventDefault();
            });
        },
        layoutListInit: function(){
            var products = $('#products-grid');
            products.css('opacity',0);
            $('.toolbar .view-mode span[data-layout="grid"]').removeClass('active');
            $('.toolbar .view-mode span[data-layout="list"]').addClass('active');
            products.find('.product').removeClass('product-layout-list product-layout-grid');
            products.find('.product').addClass('product-layout-list');
            setTimeout(function() {
                products.animate({
                    'opacity': 1
                }, 200);
            }, 300);
        },
        productDealInit: function(productDeal){
            var date = productDeal.data('date');
            if(date){
                var config = {date: date};
                $.extend(config, countdown);
                $.extend(config, countdownConfig);
                if(countdownTemplate){
                    config.template = countdownTemplate;
                }
                productDeal.countdown(config);
            }
        },
        quickshopInit: function(){
            $(document).on("initproduct", "#product-form", function() {
                var product_handle = $(this).data('id');
                var template = $('.product-view');
                Shopify.getProduct(product_handle, function(product) {
                    template.find('.product-shop').attr('id', 'product-' + product.id);
                    template.find('.product-form').attr('id', 'product-actions-' + product.id);
                    template.find('.product-form .product-options select').attr('id', 'product-select-' + product.id);
                    NW.collection.createSwatch(product, template);
                });
            });
            $("#product-form").trigger("initproduct");
            $(document).on("click", ".quickview", function() {
                var $prod = $(this).closest(".product");
                eval($prod.find("[data-id^=product-block-json-]").html());
                var template = $prod.find("[data-id^=product-block-template-]").html();
                return $.magnificPopup.open({
                    items: {
                        src: [template].join(""),
                        type: 'inline'
                    },
                    mainClass: 'mfp-move-from-top',
                    removalDelay: 200,
                    midClick: true,
                    preloader: true,
                    callbacks: {
                        open: function() {
                            NW.verticleScroll.init();
                            if($('.carousel-init.owl-carousel').length > 0) {
                                var carousel = $('.carousel-init.owl-carousel');
                                carousel.each(function(){
                                    NW.page.carouselInit($(this));
                                });
                            }
                            NW.productMediaManager.init();
                            $("#product-form").trigger("initproduct");
                            NW.collection.countDowntInit();
                            NW.page.translateBlock('.quick-view');
                            if(frontendData.enableCurrency) {
                                currenciesCallbackSpecial(".quick-view span.money");
                            }
                            if ($(".spr-badge").length > 0) {
                                SPR.registerCallbacks();
                                SPR.initRatingHandler();
                                SPR.initDomEls();
                                SPR.loadProducts();
                                SPR.loadBadges();
                            }
                        },
                        close: function() {
                            NW.productMediaManager.destroyZoom();
                        }
                    },
                });
            });
        },
        createSwatch: function(product, layout){
            if (product.variants.length >= 1) { //multiple variants
                for (var i = 0; i < product.variants.length; i++) {
                    var variant = product.variants[i];
                    var option = '<option value="' + variant.id + '">' + variant.title + '</option>';
                    layout.find('form.product-form > select').append(option);
                }
                new Shopify.OptionSelectors("product-select-" + product.id, {
                    product: product,
                    onVariantSelected: NW.collection.selectCallback
                });

                //start of quickview variant;
                var filePath = asset_url.substring(0, asset_url.lastIndexOf('/'));
                var assetUrl = asset_url.substring(0, asset_url.lastIndexOf('/'));
                var options = "";
                for (var i = 0; i < product.options.length; i++) {
                    options += '<div class="swatch clearfix" data-option-index="' + i + '">';
                    options += '<div class="header">' + product.options[i].name + '</div>';
                    var is_color = false;
                    if (/Color|Colour/i.test(product.options[i].name)) {
                        is_color = true;
                    }
                    var optionValues = new Array();
                    for (var j = 0; j < product.variants.length; j++) {
                        var variant = product.variants[j];
                        var value = variant.options[i];
                        var valueHandle = NW.collection.convertToSlug(value);
                        var forText = 'swatch-' + i + '-' + valueHandle;
                        if (optionValues.indexOf(value) < 0) {
                            //not yet inserted
                            options += '<div data-value="' + value + '" class="swatch-element '+(is_color ? "color" : "")+' ' + (is_color ? "color" : "") + valueHandle + (variant.available ? ' available ' : ' soldout ') + '">';

                            if (is_color) {
                                options += '<div class="tooltip">' + value + '</div>';
                            }
                            options += '<input id="' + forText + '" type="radio" name="option-' + i + '" value="' + value + '" ' + (j == 0 ? ' checked ' : '') + (variant.available ? '' : ' disabled') + ' />';

                            if (is_color) {
                                options += '<label for="' + forText + '" style="background-color: ' + valueHandle + '; background-image: url(' + filePath + valueHandle + '.png)"><img class="crossed-out" src="' + assetUrl + 'soldout.png" /></label>';
                            } else {
                                options += '<label for="' + forText + '">' + value + '<img class="crossed-out" src="' + assetUrl + 'soldout.png" /></label>';
                            }
                            options += '</div>';
                            if (variant.available) {
                                $('.product-view .swatch[data-option-index="' + i + '"] .' + valueHandle).removeClass('soldout').addClass('available').find(':radio').removeAttr('disabled');
                            }
                            optionValues.push(value);
                        }
                    }
                    options += '</div>';
                }
                if(swatch_color_enable){
                    layout.find('form.product-form .product-options > select').after(options);
                    layout.find('.swatch :radio').change(function() {
                        var optionIndex = $(this).closest('.swatch').attr('data-option-index');
                        var optionValue = $(this).val();
                        $(this)
                            .closest('form')
                            .find('.single-option-selector')
                            .eq(optionIndex)
                            .val(optionValue)
                            .trigger('change');
                    });
                }
                if (product.available) {
                    Shopify.optionsMap = {};
                    Shopify.linkOptionSelectors(product);
                }

                //end of quickview variant
            } else { //single variant
                layout.find('form.product-form .product-options > select').remove();
                var variant_field = '<input type="hidden" name="id" value="' + product.variants[0].id + '">';
                layout.find('form.product-form').append(variant_field);
            }
        },
        convertToSlug: function(e) {
            return e.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
        },
        selectCallback: function(variant, selector) {
            if (variant) {
                if (variant.available) {
                    if (variant.compare_at_price > variant.price) {
                        $("#price").html('<del class="price_compare">' + Shopify.formatMoney(variant.compare_at_price, money_format) + "</del>" + '<div class="price">' + Shopify.formatMoney(variant.price, money_format) + "</div>")
                    } else {
                        $("#price").html('<div class="price">' + Shopify.formatMoney(variant.price, money_format) + "</div>");
                    }
                    frontendData.enableCurrency && currenciesCallbackSpecial("#price span.money"),
                        $(".product-shop-wrapper .add-to-cart").removeClass("disabled").removeAttr("disabled").html(window.inventory_text.add_to_cart),
                        variant.inventory_management && variant.inventory_quantity <= 0 ? ($("#selected-variant").html(selector.product.title + " - " + variant.title), $("#backorder").removeClass("hidden")) : $("#backorder").addClass("hidden");
                    if (variant.inventory_management!=null) {
                        $(".product-inventory span.in-stock").text(variant.inventory_quantity + " " + window.inventory_text.in_stock);
                    } else {
                        $(".product-inventory span.in-stock").text(window.inventory_text.many_in_stock);
                    }
                    $('.product-sku span.sku').text(variant.sku);
                }else{
                    $("#backorder").addClass("hidden"), $(".product-shop-wrapper .add-to-cart").html(window.inventory_text.sold_out).addClass("disabled").attr("disabled", "disabled");
                    $(".product-inventory span.in-stock").text(window.inventory_text.out_of_stock);
                    $('.product-sku span.sku').empty();
                }
                if(swatch_color_enable){
                    var form = $('#' + selector.domIdPrefix).closest('form');
                    for (var i=0,length=variant.options.length; i<length; i++) {
                        var radioButton = form.find('.swatch[data-option-index="' + i + '"] :radio[value="' + variant.options[i] +'"]');
                        if (radioButton.size()) {
                            radioButton.get(0).checked = true;
                        }
                    }
                }
            }
            if (variant && variant.featured_image) {
                var n = Shopify.Image.removeProtocol(variant.featured_image.src);
                var n_2 = n.split('?')[0];
                $(".product-image-thumbs .thumb-link").filter('[data-zoom-image="' + n_2 + '"]').trigger("click");
            }
            variant && variant.sku ? $("#sku").removeClass("hidden").find("span").html(variant.sku) : $("#sku").addClass("hidden").find("span").html("");
        },
        prevNextProductData:function(el) {
            var e = el.data("with-product"),
                t = el.find('script[type="text/template"]'),
                i = t.html();
            $.getJSON("/products/" + e + ".json", function(e) {
                var a = e.product;
                for (var o in a) i = i.replace(new RegExp("\\[" + o + "\\]", "ig"), a[o]);
                var r = a.image.src.lastIndexOf(".");
                i = i.replace(/\[img:([a-z]*)\]/gi, a.image.src.slice(0, r) + "_$1" + a.image.src.slice(r)), t.replaceWith(i)
            })
        },
        addToCart: function(){
            $(document).on("click", ".add-to-cart", function(e) {
                e.preventDefault();
                var a = $(this);
                var form = a.closest("form");
                return $.ajax({
                    type: "POST",
                    url: "/cart/add.js",
                    async: !0,
                    data: form.serialize(),
                    dataType: "json",
                    beforeSend: function() {
                        if(a.parents('.item-area').length > 0) {
                            a.parents('.item-area').find(".process-cart").show();
                        }else {
                            $("#resultLoading").show();
                        }
                    },
                    error: function(t) {
                        var box = $('#error-notice'),
                            i = $.parseJSON(t.responseText);
                        box.find(".heading").html(i.message);
                        box.find(".message").html(i.description);
                        setTimeout(function() {
                            $(".process-cart").hide();
                            $("#resultLoading").hide();
                            box.addClass('show');
                            setTimeout(function() {
                                box.removeClass('show');
                            }, 5e3);
                        }, 500);
                    },
                    success: function(t) {
                        Shopify.getCart(function(e) {
                            var i = parseInt(form.find('input[name="quantity"]').val()),
                                box = $('#cart-box');
                            box.find(".product-link").attr("href", t.url),
                                box.find(".product-img").attr("src", Shopify.resizeImage(t.image, "medium")).attr("alt", NW.page.translateText(t.title)),
                                box.find(".product-title .product-link").html(NW.page.translateText(t.title)),
                                box.find(".product-price").html(Shopify.formatMoney(t.price, money_format)),
                            frontendData.enableCurrency && currenciesCallbackSpecial("#cart-box span.money");
                            setTimeout(function() {
                                $(".process-cart").hide();
                                $("#resultLoading").hide();
                                box.addClass('show');
                                setTimeout(function() {
                                    box.removeClass('show');
                                }, 5e3)
                            }, 500), NW.collection.updateCartInfo(e, ".cart-container .cart-wrapper .cart-inner-content")
                        });
                        return false;
                    },
                    cache: !1
                });
            });
        },
        updateCartInfo: function(cart, e){
            var c = $(e);
            var t = $('.icon-cart-header .price');
            var d = $('.icon-cart-header .cart-total');
            var cart_count = $('.la-cart-count');
            if (c.length) {
                c.empty();
                t.empty();
                $.each(cart, function(key,value){
                    if(key == 'items'){
                        var $html ='';
                        if(value.length){
                            t.html(Shopify.formatMoney(cart.total_price, money_format));
                            d.html('<span class="cart-qty">'+cart.item_count+'</span><span>'+cartData.totalNumb+'</span><span class="price">'+Shopify.formatMoney(cart.total_price, money_format)+'</span>');
                            cart_count.html(cart.item_count);
                            $html += '<div class="text-your-cart"><span>'+cartData.yourcart+'</span></div>';
                            $html += '<div class="cart-content">';
                            $html += '<ul class="clearfix">';
                            $.each(value, function(i, item) {
                                $html += '<li class="item-cart">';
                                $html += '<a class="product-image" href="'+ item.url +'"><img alt="'+ NW.page.translateText(item.title) +'" src="'+ Shopify.resizeImage(item.image, 'small') +'" /></a>';
                                $html += '<div class="product-details row-fluid show-grid">';
                                $html += '<p class="product-name"><a href="'+ item.url +'"><span>'+ NW.page.translateText(item.title) +'</span></a></p>';
                                $html += '<div class="items"><span class="price">'+item.quantity+' × <span class="amount">'+ Shopify.formatMoney(item.price, money_format) +'</span></span></div>';
                                $html += '<div class="access"><a href="javascript: void(0);" class="btn-remove btn-remove-cart" data-id="'+item.variant_id+'" title="'+cartData.removeItemLabel+'"><i class="zyra-icon icon-ui-1-simple-remove"></i></a></div>';
                                $html += '</div>';
                                $html += '</li>';
                            });
                            $html += '</ul>';
                            $html += '</div>';
                            $html += '<div class="cart-checkout">';
                            $html += '<div class="cart-info"><p class="subtotal"><span class="label">'+cartData.totalLabel+'</span><span class="price">'+Shopify.formatMoney(cart.total_price, money_format)+'</span></p></div>';
                            $html += '<div class="actions">';
                            $html += '<a href="/cart" class="btn-button black uppercase full-width mb-1"><span>'+cartData.buttonViewCart+'</span></a> ';
                            $html += '<a href="/checkout" class="btn-button black uppercase full-width"><span>'+cartData.buttonCheckout+'<i class="nc-icon-outline arrows-1_tail-right"></i></span></a>';
                            $html += '</div>';
                            $html += '</div>';
                        }else{
                            t.html(Shopify.formatMoney(cart.total_price, money_format));
                            d.html('<span class="cart-qty">'+cart.item_count+'</span><span>'+cartData.totalNumb+'</span><span class="price">'+Shopify.formatMoney(cart.total_price, money_format)+'</span>');
                            $html += '<div class="text-your-cart"><span>'+cartData.yourcart+'</span></div>';
                            $html += '<div class="cart-content">';
                            $html += '<p class="no-items-in-cart">'+cartData.noItemLabel+'</p>';
                            $html += '</div>';
                        }
                    }
                    c.append($html);
                });
            }
            if($('.icon-cart-header .cart-count').length > 0){
                $('.icon-cart-header .cart-count').html(cart.item_count);
            }
            if(frontendData.enableCurrency){
                currenciesCallbackSpecial('.cart-wrapper .cart-inner span.money');
                currenciesCallbackSpecial('.icon-cart-header span.money');
            }
        },
        removeCartInit: function(id,r){
            $.ajax({
                type: 'POST',
                url: '/cart/change.js',
                data:  'quantity=0&id='+id,
                dataType: 'json',
                beforeSend: function() {
                    $(".cartloading").show();
                },
                success: function(t) {
                    if ((typeof r) === 'function') {
                        r(t);
                    }else {
                        NW.collection.updateCartInfo(t, ".cart-container .cart-wrapper .cart-inner-content");
                        $(".cartloading").hide();
                    }
                },
                error: function(XMLHttpRequest, textStatus) {
                    Shopify.onError(XMLHttpRequest, textStatus);
                }
            });
        },
        sidebarMenuInit: function(){
            $("#mobile-menu, #categories_nav").mobileMenu({
                accordion: true,
                speed: 400,
                closedSign: 'collapse',
                openedSign: 'expand',
                mouseType: 0,
                easing: 'easeInOutQuad'
            });
        },
        sortbyFilter: function() {
            $(document).on("change", ".sort-by .field", function(e) {
                e.preventDefault();
                var t = $(this), i = t.val();
                Shopify.queryParams.sort_by = i;
                NW.collection.filterAjaxRequest();
            });
        },
        limitedAsFilter: function(){
            $(document).on("change", ".limited-view .field", function(e) {
                e.preventDefault();
                var t = $(this), i = t.val();
                Shopify.queryParams.view = i;
                NW.collection.filterAjaxRequest();
            });
        },
        swatchListFilter: function() {
            $(document).on("click", ".narrow-by-list .item:not(.disable), .advanced-filter .field:not(.disable)", function() {
                var e = $(this),
                    t = e.find("input").val(),
                    i = [];
                if (Shopify.queryParams.constraint && (i = Shopify.queryParams.constraint.split("+")), !e.hasClass("active")) {
                    var a = e.parents(".layer-filter, .advanced-filter").find(".active");
                    a.length > 0 && a.each(function() {
                        var e = $(this).data("handle");
                        if ($(this).removeClass("active"), e) {
                            var t = i.indexOf(e);
                            t >= 0 && i.splice(t, 1)
                        }
                    })
                }
                if (t) {
                    var o = i.indexOf(t);
                    0 > o ? (i.push(t), e.addClass("active")) : (i.splice(o, 1), e.removeClass("active"))
                }
                i.length ? Shopify.queryParams.constraint = i.join("+") : delete Shopify.queryParams.constraint, NW.collection.filterAjaxRequest()
            });
        },
        paginationActionInit: function(){
            $(document).on("click", ".pagination-page a", function(e) {
                var page = $(this).attr("href").match(/page=\d+/g);
                if (page) {
                    Shopify.queryParams.page = parseInt(page[0].match(/\d+/g));
                    if (Shopify.queryParams.page) {
                        var newurl = NW.collection.filterCreateUrl();
                        History.pushState({
                            param: Shopify.queryParams
                        }, newurl, newurl);
                        NW.collection.filterGetContent(newurl);
                    }
                }
                e.preventDefault();
            });
        },
        layerFilterInit: function() {
            NW.collection.sortbyFilter();
            NW.collection.limitedAsFilter();
            NW.collection.paginationActionInit();
            NW.collection.swatchListFilter();
            NW.collection.layerClearAllFilter();
            NW.collection.layerClearFilter();
        },
        filterCreateUrl: function(baseLink) {
            var newQuery = $.param(Shopify.queryParams).replace(/%2B/g, '+');
            if (baseLink) {
                //location.href = baseLink + "?" + newQuery;
                if (newQuery != "")
                    return baseLink + "?" + newQuery;
                else
                    return baseLink;
            }
            return location.pathname + "?" + newQuery;
        },
        filterAjaxRequest: function(baseLink) {
            delete Shopify.queryParams.page;
            var newurl = NW.collection.filterCreateUrl(baseLink);
            History.pushState({
                param: Shopify.queryParams
            }, newurl, newurl);
            NW.collection.filterGetContent(newurl);
        },
        filterGetContent: function(e) {
            $.ajax({
                type: "get",
                url: e,
                beforeSend: function() {
                    $("#resultLoading").show();
                },
                success: function(t) {
                    infinite_loaded_count = 0;
                    var i = t.match("<title>(.*?)</title>")[1];
                    $("#collection-main").empty().html($(t).find("#collection-main").html()),
                        $(".narrow-by-list").empty().html($(t).find(".narrow-by-list").html()),
                        $(".pagination").empty().html($(t).find(".pagination").html()),
                        $(".main-breadcrumbs").empty().html($(t).find(".main-breadcrumbs").html()),
                        History.pushState({
                            param: Shopify.queryParams
                        }, i, e), setTimeout(function() {
                        $("html,body").animate({
                            scrollTop: $(".toolbar").offset().top
                        }, 500)
                    }, 100);
                    $("#resultLoading").hide();
                    if (NW.collection.readCookie('products-listmode') != null) {
                        NW.collection.layoutListInit();
                    }
                    NW.collection.productGridSetup();
                    NW.collection.layerClearFilter();
                    NW.collection.layerClearAllFilter();
                    NW.collection.colorSwatchGridInit();
                    NW.page.setVisualState();
                    NW.collection.initInfiniteScrolling();
                    NW.page.setSelect();
                    NW.collection.sidebarInitToggle();
                    NW.page.translateBlock('.main-wrapper');
                    if ($(".spr-badge").length > 0) {
                        SPR.registerCallbacks();
                        SPR.initRatingHandler();
                        SPR.initDomEls();
                        SPR.loadProducts();
                        SPR.loadBadges();
                    }
                    frontendData.enableCurrency && currenciesCallbackSpecial(".products-grid span.money");
                },
                error: function() {
                    $("#resultLoading").hide();
                }
            });
        },
        sidebarInitToggle: function() {
            if ($(".sidebar-toogle").length > 0) {
                $(".sidebar-toogle .block-title span.collapse").click(function() {
                    if ($(this).hasClass('click')) {
                        $(this).removeClass('click');
                        $(this).parent().removeClass('closed');
                    } else {
                        $(this).parent().addClass('closed');
                        $(this).addClass('click');
                    }
                    $(this).parents(".sidebar-toogle").find(".sidebar-content").slideToggle();
                });
            }
        },
        sidebarCategoryInitToggle: function() {
            if ($(".sidebar-cate-toogle").length > 0) {
                $(".sidebar-cate-toogle .block-title span.collapse").click(function() {
                    if ($(this).hasClass('click')) {
                        $(this).removeClass('click');
                        $(this).parent().removeClass('closed');
                    } else {
                        $(this).parent().addClass('closed');
                        $(this).addClass('click');
                    }
                    $(this).parents(".sidebar-cate-toogle").find(".sidebar-content").slideToggle();
                });
            }
        },
        layerClearFilter: function() {
            $(".narrow-by-list .narrow-item").each(function() {
                var e = $(this);
                e.find("input:checked").length > 0 && e.find(".clear").click(function(t) {
                    var i = [];
                    Shopify.queryParams.constraint && (i = Shopify.queryParams.constraint.split("+")), e.find("input:checked").each(function() {
                        var e = jQuery(this),
                            t = e.val();
                        if (t) {
                            var a = i.indexOf(t);
                            a >= 0 && i.splice(a, 1)
                        }
                    }), i.length ? Shopify.queryParams.constraint = i.join("+") : delete Shopify.queryParams.constraint, NW.collection.filterAjaxRequest(), t.preventDefault()
                })
            })
        },
        layerClearAllFilter: function() {
            $(document).on("click", ".narrow-by-list .clearall, .filter-option-inner .clearall", function(e) {
                e.preventDefault();
                delete Shopify.queryParams.constraint, delete Shopify.queryParams.q, NW.collection.filterAjaxRequest();
            })
        },
        tabInfinityScrollInit: function(){
            var $maintab = $('.tab-content .category-products'),
                $limit = $maintab.find('.data-tab').data('limit'),
                $show = $maintab.find('.data-tab').data('show'),
                $text = $maintab.find('.data-tab').data('text'),
                $translate = $maintab.find('.data-tab').data('translate'),
                $total = $maintab.find('.products-grid .item').length;
            if(!$maintab.find('.data-tab').data('showmore')) return;
            console.log($show);
            for(i =0; i <= $total; i++) {

                if(i > $show){
                    console.log(i);
                }
            }
            if($total > $limit){
                $mainsc = $('<div/>').addClass('infinite-scrolling-homepage wow fadeIn');
                $in = $('<span/>').addClass('sc-show-more').attr("data-translate", $translate).text($text).appendTo($mainsc);
                $maintab.append($mainsc);
            }
        },
        countDowntInit: function(){
            $('.product-date').each(function(i,item){
                var date = $(item).attr('data-date');
                var countdown = {
                    "yearText": window.date_text.year_text,
                    "monthText": window.date_text.month_text,
                    "weekText": window.date_text.week_text,
                    "dayText": window.date_text.day_text,
                    "hourText": window.date_text.hour_text,
                    "minText": window.date_text.min_text,
                    "secText": window.date_text.sec_text,
                    "yearSingularText": window.date_text.year_singular_text,
                    "monthSingularText": window.date_text.month_singular_text,
                    "weekSingularText": window.date_text.week_singular_text,
                    "daySingularText": window.date_text.day_singular_text,
                    "hourSingularText": window.date_text.hour_singular_text,
                    "minSingularText": window.date_text.min_singular_text,
                    "secSingularText": window.date_text.sec_singular_text
                };
                var template = '<div class="day"><span class="no">%d</span><span class="text">%td</span></div><div class="hours"><span class="no">%h</span><span class="text">%th</span></div><div class="min"><span class="no">%i</span><span class="text">%ti</span></div><div class="second"><span class="no">%s</span><span class="text">%ts</span></div>';
                if(date){
                    var config = {date: date};
                    $.extend(config, countdown);
                    if(template){
                        config.template = template;
                    }
                    $(item).countdown(config);
                }
            });
        },
        initInfiniteScrolling: function(){
            $(window).scroll(function(){
                if($('.infinite-loader').length > 0 && $(window).scrollTop() >= $(".infinite-loader").offset().top-$(window).height()+100){
                    if(infinite_loaded_count < 2){
                        $('.infinite-loader a').trigger('click');
                    }
                }
            });
            if ($('.infinite-loader').length > 0) {
                $('.infinite-loader a').click(function(e) {
                    e.preventDefault();
                    if (!$(this).hasClass('disabled')) {
                        NW.collection.doInfiniteScrolling();
                    }
                });
            }
        },
        doInfiniteScrolling: function() {
            var currentList = $('#collection-main .products-grid');
            var products = $('#products-grid');
            infinite_loaded_count = infinite_loaded_count + 1;
            if (currentList) {
                var showMoreButton = $('.infinite-loader a').first();
                $.ajax({
                    type: 'GET',
                    url: showMoreButton.attr("href"),
                    beforeSend: function() {
                        $('.infinite-loader .btn-load-more').hide();
                        $('.infinite-loader .loading').fadeIn(300);
                    },
                    success: function(data) {
                        loading = false;
                        var items = $(data).find('#collection-main .products-grid .item');
                        if (items.length > 0) {

                            products.append(items);
                            NW.page.translateBlock("." + currentList.attr("class"));

                            //get link of Show more
                            if ($(data).find('.infinite-loader').length > 0) {
                                showMoreButton.attr('href', $(data).find('.infinite-loader a').attr('href'));
                                if(infinite_loaded_count >= 2){
                                    $('.infinite-loader .loading').fadeOut(300);
                                    $('.infinite-loader .btn-load-more').show();
                                }else{
                                    $('.infinite-loader .loading').fadeOut(300);
                                }
                            } else {
                                //no more products
                                $('.infinite-loader .loading').fadeOut(300);
                                showMoreButton.hide();
                            }

                            if (NW.collection.readCookie('products-listmode') != null) {
                                NW.collection.layoutListInit();
                            }
                            NW.collection.productGridSetup();
                            NW.collection.layerClearFilter();
                            NW.collection.layerClearAllFilter();
                            NW.collection.colorSwatchGridInit();
                            NW.page.setVisualState();
                            frontendData.enableCurrency && currenciesCallbackSpecial(".products-grid span.money");
                            if ($(".spr-badge").length > 0) {
                                SPR.registerCallbacks();
                                SPR.initRatingHandler();
                                SPR.initDomEls();
                                SPR.loadProducts();
                                SPR.loadBadges();
                            }
                        }
                    },
                    error: function(xhr, text) {
                        $('.infinite-loader .btn-load-more').hide();
                        $('.infinite-loader .loading').fadeOut(300);
                    },
                    dataType: "html"
                });
            }
        },
        ShopMetro: function(){
          $('.shop-metro .masonry-grid li.item').each(function() {
            var ww = $window.width();
            var _base_w =   $('.masonry-grid').data('item-width'),
                _base_h = $('.masonry-grid').data('item-height'),
                thiswidth = parseFloat($(this).data('width') || 1),
                thisheight = parseFloat($(this).data('height') || 1),
                wrapperwidth = $('.masonry-grid').width(),
                _css = {};
            var get_isotope_column_number = function(w_w, item_w) {
                w_w = (w_w > 1824) ? 1824 : w_w;
                return Math.round(w_w / item_w);
            };
            var item_number = get_isotope_column_number(wrapperwidth, _base_w);
            if (ww < 1200) {
                item_number = $('.masonry-grid').data('md-col');
                $('.masonry-grid').removeClass('cover-img-bg');
            } else {
                $('.masonry-grid').addClass('cover-img-bg');
            }
            if (ww < 800) {
                item_number = $('.masonry-grid').data('sm-col');
            }
            if (ww < 768) {
                item_number = $('.masonry-grid').data('xs-col');
            }
            if (ww < 500) {
                item_number = $('.masonry-grid').data('mb-col');
            }
            var itemwidth = Math.floor(wrapperwidth / item_number),
                dimension = parseFloat(_base_w / _base_h);
                if (isNaN(thiswidth)) thiswidth = 1;
                if (isNaN(thisheight)) thisheight = 1;
                if (ww < 1200) {
                    thiswidth = thisheight = 1;
                }
                _css.width = Math.floor(itemwidth * thiswidth);
                _css.height = Math.floor((itemwidth / dimension) * thisheight);
                if (ww < 1200) {
                    _css.height = 'auto';
                }
                $(this).css(_css);
                $('.metro-masonry-grid').masonry({
                    // options
                    itemSelector: '.item'
                });
          });
        }
    };
    NW.productMediaManager = {
        destroyZoom: function() {
            $('.zoomContainer').remove();
            $('.product-image-gallery .gallery-image').removeData('elevateZoom');
        },
        createZoom: function(image){
            NW.productMediaManager.destroyZoom();
            if(isMobileAlt){
                return;
            }
            if(image.length <= 0) { //no image found
                return;
            }
            if(image[0].naturalWidth && image[0].naturalHeight) {
                var widthDiff = image[0].naturalWidth - image.width() - imageZoomThreshold;
                var heightDiff = image[0].naturalHeight - image.height() - imageZoomThreshold;

                if(widthDiff < 0 && heightDiff < 0) {
                    //image not big enough
                    image.parents('.product-image').removeClass('zoom-available');
                    return;
                } else {
                    image.parents('.product-image').addClass('zoom-available');
                }
            }
            if(dataZoom.position == 'inside'){
                image.elevateZoom({
                  /*gallery:'more-slides',*/
                    zoomType: "inner",
                    easing : true,
                    cursor: "crosshair"
                });
            }else {
                image.elevateZoom({
                  /*gallery:'more-slides',*/
                    zoomWindowPosition: 1,
                    easing : true,
                    zoomWindowFadeIn: 500,
                    zoomWindowFadeOut: 500,
                    lensFadeIn: 500,
                    lensFadeOut: 500,
                    borderSize: 3,
                    lensBorderSize: 2,
                    lensBorderColour: "#999",
                    borderColour: "#ddd"
                });
            }
            if(dataZoom.lightbox) {
                image.bind("click", function(e) {
                    var ez =   image.data('elevateZoom');
                    ez.closeAll();
                    $.fancybox(ez.getGalleryList());
                    return false;
                });
            }
        },
        swapImage: function(targetImage) {
            targetImage = $(targetImage);
            targetImage.addClass('gallery-image');

            NW.productMediaManager.destroyZoom();

            var imageGallery = $('.product-image-gallery');

            if(targetImage[0].complete) { //image already loaded -- swap immediately

                imageGallery.find('.gallery-image').removeClass('visible');

                //move target image to correct place, in case it's necessary
                imageGallery.append(targetImage);

                //reveal new image
                targetImage.addClass('visible');

                //wire zoom on new image
                NW.productMediaManager.createZoom(targetImage);

            } else { //need to wait for image to load

                //add spinner
                imageGallery.addClass('loading');

                //move target image to correct place, in case it's necessary
                imageGallery.append(targetImage);

                //wait until image is loaded
                imagesLoaded(targetImage, function() {
                    //remove spinner
                    imageGallery.removeClass('loading');

                    //hide old image
                    imageGallery.find('.gallery-image').removeClass('visible');

                    //reveal new image
                    targetImage.addClass('visible');

                    //wire zoom on new image
                    NW.productMediaManager.createZoom(targetImage);
                });

            }
        },
        wireThumbnails: function() {
            //trigger image change event on thumbnail click
            $('.product-image-thumbs .thumb-link').click(function(e) {
                e.preventDefault();
                var jlink = $(this);
                var target = $('#image-' + jlink.data('image-index'));
                NW.productMediaManager.swapImage(target);
            });
        },
        initZoom: function() {
            NW.productMediaManager.createZoom($(".gallery-image.visible")); //set zoom on first image
        },
        init: function() {
            NW.productMediaManager.imageWrapper = $('.product-img-box');
            // Re-initialize zoom on viewport size change since resizing causes problems with zoom and since smaller
            $(window).resize( function() {
                NW.productMediaManager.initZoom();
            });
            NW.productMediaManager.initZoom();
            NW.productMediaManager.wireThumbnails();
            $("a.fancy_click").fancybox({
                'transitionIn'	:	'fade',
                'transitionOut'	:	'fade',
                'overlayShow'	:	false
            });
        }
    };
    NW.verticleScroll = {
        init: function(){
            if($('.product-img-box .verticl-carousel').length > 0){
                var carousel = $('.product-img-box .verticl-carousel');
                NW.verticleScroll.carouselInit(carousel);
            }
        },
        carouselInit: function(carousel){
            var count = carousel.find('a').length;
            if (count <= 3) {
                carousel.parents('.more-views-verticle').find('.more-views-nav').hide();
            }
            $(".product-img-box #carousel-up").on("click", function () {
                if (!$(".product-img-box .verticl-carousel").is(':animated')) {
                    var bottom = $(".product-img-box .verticl-carousel > a:last-child");
                    var clone = $(".product-img-box .verticl-carousel > a:last-child").clone();
                    clone.prependTo(".product-img-box .verticl-carousel");
                    $(".product-img-box .verticl-carousel").animate({
                        "top": "-=85"
                    }, 0).stop().animate({
                        "top": '+=85'
                    }, 250, function () {
                        bottom.remove();
                    });
                    NW.productMediaManager.init();
                }
            });
            $(".product-img-box #carousel-down").on("click", function () {
                if (!$(".product-img-box .verticl-carousel").is(':animated')) {
                    var top = $(".product-img-box .verticl-carousel > a:first-child");
                    var clone = $(".product-img-box .verticl-carousel > a:first-child").clone();
                    clone.appendTo(".product-img-box .verticl-carousel");
                    $(".product-img-box .verticl-carousel").animate({
                        "top": '-=85'
                    }, 250, function () {
                        top.remove();
                        $(".product-img-box .verticl-carousel").animate({
                            "top": "+=85"
                        }, 0);
                    });
                    NW.productMediaManager.init();
                }
            });
        }
    }
    NW.footer = {
        init: function() {
            NW.footer.backToTopInit();
        },
        backToTopInit: function() {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('#back-top').fadeIn();
                } else {
                    $('#back-top').fadeOut();
                }
            });
            $('#back-top a').click(function () {
                $('body,html').animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        }
    };
    NW.shortcodes = {
        init: function () {
            NW.shortcodes.progress();
            NW.shortcodes.lightcase_popup();
            NW.shortcodes.counter();
        },
        progress: function () {
            $('.progress-percent').each(function() {
                $(this).css('right', 100-$(this).attr('data-progress') + '%');
            });
            $('.progress-bar').each(function() {
                $(this).css('width', $(this).attr('data-progress') + '%');
            });
        },
        lightcase_popup: function () {
            $('a[data-rel^=lightcase]').lightcase();
        },
        counter: function () {
            $('.incify-counter--number').counterUp({
                delay: 10,
                time: 1000
            });
        }
    };
    NW.onReady = {
        init: function() {
            NW.SitePreload.init();
            NW.header.init();
            NW.megamenu.init();
            NW.slideshow.init();
            NW.page.init();
            NW.collection.init();
            NW.footer.init();
            NW.verticleScroll.init();
            NW.productMediaManager.init();
            NW.shortcodes.init();
        }
    };
    NW.onLoad = {
        init: function() {
          $body.addClass('body-loaded');
        }
    };
    $(document).ready(function(){
        NW.onReady.init();
    });
    $(window).load(function(){
        NW.onLoad.init();
    });
})(jQuery);
