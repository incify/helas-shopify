(function($) {
    "use strict";
    var LA = {
        core: {},
        ui: {},
        utils: {},
        component: {}
    };
    window.LA = LA;
    $.exists = function($selector) {
        return ($selector.length > 0);
    };
    $.getCachedScript = function(url) {
        var options = {
            dataType: "script",
            cache: true,
            url: url
        };
        return $.ajax(options);
    };
    $.fn.LA_ImagesLoaded = function() {
        var $imgs = this.find('img[src!=""]');
        if (!$imgs.length) {
            return $.Deferred().resolve().promise();
        }
        var dfds = [];
        $imgs.each(function() {
            var dfd = $.Deferred();
            dfds.push(dfd);
            var img = new Image();
            img.onload = function() {
                dfd.resolve();
            };
            img.onerror = function() {
                dfd.resolve();
            };
            img.src = this.src;
        });
        return $.when.apply($, dfds);
    };
    $.expr[':'].appeared = function(element) {
        var $element = $(element),
            $window = $(window);
        if (!$element.is(':visible')) {
            return false;
        }
        var window_left = $window.scrollLeft();
        var window_top = $window.scrollTop();
        var offset = $element.offset();
        var left = offset.left;
        var top = offset.top;
        if (top + $element.height() >= window_top && top - ($element.data('appear-top-offset') || 0) <= window_top + $window.height() && left + $element.width() >= window_left && left - ($element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
            return true;
        } else {
            return false;
        }
    };
    var la_hover_effect = function(selector) {
        this.$el = $(selector);
        this._init();
    };
    la_hover_effect.prototype = {
        _init: function() {
            this._loadEvents();
        },
        _loadEvents: function() {
            var self = this;
            this.$el.on('mouseenter.hoverdir, mouseleave.hoverdir', function(event) {
                var $el = $(this),
                    direction = self._getDir($el, {
                        x: event.pageX,
                        y: event.pageY
                    }),
                    _cls = self._getClass(direction),
                    _prefix = (event.type === 'mouseenter') ? 'in-' : 'out-';
                $el.removeClass('in-top in-left in-right in-bottom out-top out-left out-right out-bottom');
                $el.addClass(_prefix + _cls)
            })
        },
        _getDir: function($el, coordinates) {
            var w = $el.width(),
                h = $el.height(),
                x = (coordinates.x - $el.offset().left - (w / 2)) * (w > h ? (h / w) : 1),
                y = (coordinates.y - $el.offset().top - (h / 2)) * (h > w ? (w / h) : 1);
            return Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
        },
        _getClass: function(direction) {
            var _cls;
            switch (direction) {
                case 0:
                    _cls = 'top';
                    break;
                case 1:
                    _cls = 'right';
                    break;
                case 2:
                    _cls = 'bottom';
                    break;
                case 3:
                    _cls = 'left';
                    break;
            }
            return _cls;
        }
    };
    $.fn.la_hover_effect = function() {
        return new la_hover_effect(this);
    };
})(jQuery);
(function($) {
    'use strict';
    var LA = window.LA || {};
    LA.utils = window.LA.utils || {};
    LA.utils.isDebug = true;
    LA.utils.logger = {
        $cache: {},
        display: function(msg) {
            if (!LA.utils.isDebug) return;
            return console.log(msg);
        },
        set: function(msg, group_name, group_title) {
            if (!LA.utils.isDebug) return;
            if (typeof group_name !== "undefined") {
                if (typeof group_title === "undefined") {
                    group_title = group_name;
                }
            } else {
                group_name = "anonymous";
                group_title = "Anonymous";
            }
            var self = this,
                _o_obj = self.$cache[group_name] || [];
            _o_obj.push([msg, group_title]);
            self.$cache[group_name] = _o_obj;
        },
        get: function(group) {
            if (!LA.utils.isDebug) return;
            var self = this;
            if (typeof group === "undefined") {
                console.group('ALL');
                $.each(self.$cache, function(key, val) {
                    $.each(val, function(k, v) {
                        console.group("Com [" + key + "] : " + v[1]);
                        console.log(v[0]);
                        console.groupEnd();
                    })
                });
                console.groupEnd();
            } else {
                $.each(self.$cache[group], function(k, v) {
                    console.group("Com [" + group + "] : " + v[1]);
                    console.log(v[0]);
                    console.groupEnd();
                })
            }
        }
    };
    LA.utils.isCookieEnable = function() {
        if (navigator.cookieEnabled) return true;
        document.cookie = "cookietest=1";
        var ret = document.cookie.indexOf("cookietest=") != -1;
        document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
        return ret;
    };
    LA.utils.browser = (function() {
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
    LA.utils.isMobile = function() {
        function android() {
            return navigator.userAgent.match(/Android/i);
        }

        function blackBerry() {
            return navigator.userAgent.match(/BlackBerry/i);
        }

        function iOS() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        }

        function opera() {
            return navigator.userAgent.match(/Opera Mini/i);
        }

        function windows() {
            return navigator.userAgent.match(/IEMobile/i);
        }
        return (android() || blackBerry() || iOS() || opera() || windows());
    };
    LA.utils.getUrlParameter = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    LA.utils.isRTL = function() {
        return $(document.body).hasClass('rtl');
    };
    LA.utils.isActiveVC = function() {
        return $(document.body).hasClass('wpb-js-composer');
    };
    LA.utils.sanitizeSlug = function(text) {
        return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
    };
    LA.utils.randomID = function() {
        var text = "",
            char = "abcdefghijklmnopqrstuvwxyz",
            num = "0123456789",
            i;
        for (i = 0; i < 5; i++) {
            text += char.charAt(Math.floor(Math.random() * char.length));
        }
        for (i = 0; i < 5; i++) {
            text += num.charAt(Math.floor(Math.random() * num.length));
        }
        return text;
    };
    LA.utils.getAdminbarHeight = function() {
        var $adminBar = $('#wpadminbar');
        return ($.exists($adminBar) && $adminBar.css('position') == 'fixed') ? $adminBar.height() : 0;
    };
    LA.utils.addStyleSheet = function(css) {
        var head, styleElement;
        head = document.getElementsByTagName('head')[0];
        styleElement = document.createElement('style');
        styleElement.setAttribute('type', 'text/css');
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = css;
        } else {
            styleElement.appendChild(document.createTextNode(css));
        }
        head.appendChild(styleElement);
        return styleElement;
    };
    LA.utils.addQueryArg = function(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) return uri.replace(re, '$1' + key + "=" + value + '$2');
        else return uri + separator + key + "=" + value;
    };
    LA.utils.removeURLParameter = function(url, parameter) {
        var urlparts = url.split('?');
        if (urlparts.length >= 2) {
            var prefix = encodeURIComponent(parameter) + '=';
            var pars = urlparts[1].split(/[&;]/g);
            for (var i = pars.length; i-- > 0;) {
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }
            url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
            return url;
        } else {
            return url;
        }
    };

    function getHtmlScroll() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    }

    function isHtmlBodyTag(element) {
        return (/^(?:body|html)$/i).test(element.tagName);
    }

    function getElementScroll(elem) {
        var element = elem.parentNode,
            position = {
                x: 0,
                y: 0
            };
        while (element && !isHtmlBodyTag(element)) {
            position.x += element.scrollLeft;
            position.y += element.scrollTop;
            element = element.parentNode;
        }
        return position;
    }

    function getStyleToString(element, style) {
        return $(element).css(style);
    }

    function getStyleToNumber(element, style) {
        return parseInt(getStyleToString(element, style)) || 0;
    }

    function getTopBorderOfElement(element) {
        return getStyleToNumber(element, 'border-top-width');
    }

    function getTopLeftOfElement(element) {
        return getStyleToNumber(element, 'border-left-width');
    }

    function elementHasBorderBox(element) {
        return getStyleToString(element, '-moz-box-sizing') == 'border-box';
    }

    function getOffset(elem) {
        if (elem.getBoundingClientRect && LA.utils.browser.platform != 'ios') {
            var bound = elem.getBoundingClientRect(),
                html = elem.ownerDocument.documentElement,
                htmlScroll = getHtmlScroll(),
                elemScrolls = getElementScroll(elem),
                isFixed = (getStyleToString(elem, 'position') == 'fixed');
            return {
                x: parseInt(bound.left) + elemScrolls.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
                y: parseInt(bound.top) + elemScrolls.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
            };
        }
        var element = elem,
            position = {
                x: 0,
                y: 0
            };
        if (isHtmlBodyTag(elem)) return position;
        while (element && !isHtmlBodyTag(element)) {
            position.x += element.offsetLeft;
            position.y += element.offsetTop;
            if (LA.utils.browser.name == 'firefox') {
                if (!elementHasBorderBox(element)) {
                    position.x += getTopLeftOfElement(element);
                    position.y += getTopBorderOfElement(element);
                }
                var parent = element.parentNode;
                if (parent && getStyleToString(parent, 'overflow') != 'visible') {
                    position.x += getTopLeftOfElement(parent);
                    position.y += getTopBorderOfElement(parent);
                }
            } else if (element != elem && LA.utils.browser.name == 'safari') {
                position.x += getTopLeftOfElement(element);
                position.y += getTopBorderOfElement(element);
            }
            element = element.offsetParent;
        }
        if (LA.utils.browser.name == 'firefox' && !elementHasBorderBox(elem)) {
            position.x -= getTopLeftOfElement(elem);
            position.y -= getTopBorderOfElement(elem);
        }
        return position;
    }
    LA.utils.getOffset = function($element) {
        return $.exists($element) ? getOffset($element.get(0)) : {
            x: 0,
            y: 0
        };
    };
}(jQuery));
(function($) {
    "use strict";
    var LA = window.LA || {};
    LA.utils = window.LA.utils || {};
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
        }
    };

    function markAsLoaded(element) {
        element.setAttribute('data-element-loaded', true);
    }
    var isLoaded = function isLoaded(element) {
        return element.getAttribute('data-element-loaded') === 'true';
    };
    var onIntersection = function onIntersection(load) {
        return function(entries, observer) {
            entries.forEach(function(entry) {
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
    LA.utils.LazyLoad = function() {
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
            triggerSingleLoad: function triggerSingleLoad() {
                if (!$.exists(selector)) {
                    return;
                }
                var element = selector.get(0);
                if (isLoaded(element)) {
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
                if (!$.exists(selector)) {
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
    };
}(jQuery));
(function($) {
    "use strict";
    var doc, win;
    win = $(window);
    doc = $(document);
    $.fn.la_sticky = function(opts) {
        var doc_height, elm, enable_bottoming, inner_scrolling, manual_spacer, offset_top, outer_width, parent_selector, recalc_every, sticky_class, win_height, _fn, _i, _len;
        if (opts == null) {
            opts = {};
        }
        sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
        win_height = win.height();
        doc_height = doc.height();
        if (offset_top == null) {
            offset_top = 0;
        }
        if (parent_selector == null) {
            parent_selector = void 0;
        }
        if (inner_scrolling == null) {
            inner_scrolling = true;
        }
        if (sticky_class == null) {
            sticky_class = "is_stuck";
        }
        if (enable_bottoming == null) {
            enable_bottoming = true;
        }
        outer_width = function(el) {
            var computed, w, _el;
            if (window.getComputedStyle) {
                _el = el[0];
                computed = window.getComputedStyle(el[0]);
                w = parseFloat(computed.getPropertyValue("width")) + parseFloat(computed.getPropertyValue("margin-left")) + parseFloat(computed.getPropertyValue("margin-right"));
                if (computed.getPropertyValue("box-sizing") !== "border-box") {
                    w += parseFloat(computed.getPropertyValue("border-left-width")) + parseFloat(computed.getPropertyValue("border-right-width")) + parseFloat(computed.getPropertyValue("padding-left")) + parseFloat(computed.getPropertyValue("padding-right"));
                }
                return w;
            } else {
                return el.outerWidth(true);
            }
        };
        _fn = function(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
            var bottomed, detach, fixed, last_pos, last_scroll_height, offset, parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;
            if (elm.data("la_sticky")) {
                return;
            }
            elm.data("la_sticky", true);
            last_scroll_height = doc_height;
            parent = elm.parent();
            if (parent_selector != null) {
                parent = parent.closest(parent_selector);
            }
            if (!parent.length) {
                throw "failed to find stick parent";
            }
            fixed = false;
            bottomed = false;
            spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
            if (spacer) {
                spacer.css('position', elm.css('position'));
            }
            recalc = function() {
                var border_top, padding_top, restore;
                if (detached) {
                    return;
                }
                win_height = win.height();
                doc_height = doc.height();
                last_scroll_height = doc_height;
                border_top = parseInt(parent.css("border-top-width"), 10);
                padding_top = parseInt(parent.css("padding-top"), 10);
                padding_bottom = parseInt(parent.css("padding-bottom"), 10);
                parent_top = parent.offset().top + border_top + padding_top;
                parent_height = parent.height();
                if (fixed) {
                    fixed = false;
                    bottomed = false;
                    if (manual_spacer == null) {
                        elm.insertAfter(spacer);
                        spacer.detach();
                    }
                    elm.css({
                        position: "",
                        top: "",
                        width: "",
                        bottom: ""
                    }).removeClass(sticky_class);
                    restore = true;
                }
                top = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;
                height = elm.outerHeight(true);
                el_float = elm.css("float");
                if (spacer) {
                    spacer.css({
                        width: outer_width(elm),
                        height: height,
                        display: elm.css("display"),
                        "vertical-align": elm.css("vertical-align"),
                        "float": el_float
                    });
                }
                if (restore) {
                    return tick();
                }
            };
            recalc();
            if (height === parent_height) {
                return;
            }
            last_pos = void 0;
            offset = offset_top;
            recalc_counter = recalc_every;
            tick = function() {
                var css, delta, recalced, scroll, will_bottom;
                if (detached) {
                    return;
                }
                recalced = false;
                if (recalc_counter != null) {
                    recalc_counter -= 1;
                    if (recalc_counter <= 0) {
                        recalc_counter = recalc_every;
                        recalc();
                        recalced = true;
                    }
                }
                if (!recalced && doc_height !== last_scroll_height) {
                    recalc();
                    recalced = true;
                }
                scroll = win.scrollTop();
                if (last_pos != null) {
                    delta = scroll - last_pos;
                }
                last_pos = scroll;
                if (fixed) {
                    if (enable_bottoming) {
                        will_bottom = scroll + height + offset > parent_height + parent_top;
                        if (bottomed && !will_bottom) {
                            bottomed = false;
                            elm.css({
                                position: "fixed",
                                bottom: "",
                                top: offset
                            }).trigger("la_sticky:unbottom");
                        }
                    }
                    if (scroll <= top) {
                        fixed = false;
                        offset = offset_top;
                        if (manual_spacer == null) {
                            if (el_float === "left" || el_float === "right") {
                                elm.insertAfter(spacer);
                            }
                            spacer.detach();
                        }
                        css = {
                            position: "",
                            width: "",
                            top: ""
                        };
                        elm.css(css).removeClass(sticky_class).trigger("la_sticky:unstick");
                    }
                    if (inner_scrolling) {
                        if (height + offset_top > win_height) {
                            if (!bottomed) {
                                offset -= delta;
                                offset = Math.max(win_height - height, offset);
                                offset = Math.min(offset_top, offset);
                                if (fixed) {
                                    elm.css({
                                        top: offset + "px"
                                    });
                                }
                            }
                        }
                    }
                } else {
                    if (scroll > top) {
                        fixed = true;
                        css = {
                            position: "fixed",
                            top: offset
                        };
                        css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
                        elm.css(css).addClass(sticky_class);
                        if (manual_spacer == null) {
                            elm.after(spacer);
                            if (el_float === "left" || el_float === "right") {
                                spacer.append(elm);
                            }
                        }
                        elm.trigger("la_sticky:stick");
                    }
                }
                if (fixed && enable_bottoming) {
                    if (will_bottom == null) {
                        will_bottom = scroll + height + offset > parent_height + parent_top;
                    }
                    if (!bottomed && will_bottom) {
                        bottomed = true;
                        if (parent.css("position") === "static") {
                            parent.css({
                                position: "relative"
                            });
                        }
                        return elm.css({
                            position: "absolute",
                            bottom: padding_bottom,
                            top: "auto"
                        }).trigger("la_sticky:bottom");
                    }
                }
            };
            recalc_and_tick = function() {
                recalc();
                return tick();
            };
            detach = function() {
                detached = true;
                win.off("touchmove", tick);
                win.off("scroll", tick);
                win.off("resize", recalc_and_tick);
                $(document.body).off("la_sticky:recalc", recalc_and_tick);
                elm.off("la_sticky:detach", detach);
                elm.removeData("la_sticky");
                elm.css({
                    position: "",
                    bottom: "",
                    top: "",
                    width: ""
                });
                parent.position("position", "");
                if (fixed) {
                    if (manual_spacer == null) {
                        if (el_float === "left" || el_float === "right") {
                            elm.insertAfter(spacer);
                        }
                        spacer.remove();
                    }
                    return elm.removeClass(sticky_class);
                }
            };
            win.on("touchmove", tick);
            win.on("scroll", tick);
            win.on("resize", recalc_and_tick);
            $(document.body).on("la_sticky:recalc", recalc_and_tick);
            elm.on("la_sticky:detach", detach);
            return setTimeout(tick, 0);
        };
        for (_i = 0, _len = this.length; _i < _len; _i++) {
            elm = this[_i];
            _fn($(elm));
        }
        return this;
    };
}(jQuery));
(function($) {
    'use strict';
    var LA = window.LA || {};
    LA.utils = window.LA.utils || {};
    LA.utils.eventManager = {};
    LA.utils.eventManager.subscribe = function(evt, func) {
        $(this).on(evt, func);
    };
    LA.utils.eventManager.unsubscribe = function(evt, func) {
        $(this).off(evt, func);
    };
    LA.utils.eventManager.publish = function(evt, params) {
        $(this).trigger(evt, params);
    };
}(jQuery));
(function($) {
    'use strict';
    var LA_ProductGallery = function($target, args) {
        this.$target = $target;
        this.$images = $('.woocommerce-product-gallery__image', $target);
        if (!$target.parent('.product--large-image').data('old_gallery')) {
            $target.parent('.product--large-image').data('old_gallery', $target.find('.woocommerce-product-gallery__wrapper').html()).data('prev_gallery', $target.find('.woocommerce-product-gallery__wrapper').html());
        }
        if (0 === this.$images.length) {
            this.$target.css('opacity', 1);
            this.$target.parent().addClass('no-gallery');
            return;
        }
        if (1 === this.$images.length) {
            this.$target.parent().addClass('no-gallery');
        } else {
            this.$target.parent().removeClass('no-gallery');
        }
        $target.data('product_gallery', this);
        this.flexslider_enabled = true;
        if ($target.hasClass('no-slider-script') || $target.hasClass('force-disable-slider-script')) {
            this.flexslider_enabled = false;
        }
        this.zoom_enabled = $.isFunction($.fn.zoom) && wc_single_product_params.zoom_enabled;
        this.photoswipe_enabled = typeof PhotoSwipe !== 'undefined' && wc_single_product_params.photoswipe_enabled;
        if (args) {
            this.flexslider_enabled = false === args.flexslider_enabled ? false : this.flexslider_enabled;
            this.zoom_enabled = false === args.zoom_enabled ? false : this.zoom_enabled;
            this.photoswipe_enabled = false === args.photoswipe_enabled ? false : this.photoswipe_enabled;
        }
        if ($target.hasClass('force-disable-slider-script')) {
            this.flexslider_enabled = false;
            this.zoom_enabled = false;
        }
        this.thumb_verital = false;
        if (this.$images.length < 2) {
            this.flexslider_enabled = false;
        }
        try {
            if (la_theme_config.product_single_design == 2) {
                this.thumb_verital = true;
            }
        } catch (ex) {
            this.thumb_verital = false;
        }
        if ($target.closest('.lightcase-contentInner').length) {
            this.thumb_verital = true;
            this.flexslider_enabled = true;
        }
        this.initSlickslider = this.initSlickslider.bind(this);
        this.initZoom = this.initZoom.bind(this);
        this.initPhotoswipe = this.initPhotoswipe.bind(this);
        this.onResetSlidePosition = this.onResetSlidePosition.bind(this);
        this.getGalleryItems = this.getGalleryItems.bind(this);
        this.openPhotoswipe = this.openPhotoswipe.bind(this);
        if (this.flexslider_enabled) {
            if ($.isFunction($.fn.slick)) {
                this.initSlickslider();
                $target.on('woocommerce_gallery_reset_slide_position', this.onResetSlidePosition);
            } else {
                var _self = this;
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.slick.js'], function() {
                    _self.initSlickslider();
                    $target.on('woocommerce_gallery_reset_slide_position', _self.onResetSlidePosition);
                })
            }
        } else {
            this.$target.css('opacity', 1);
            $target.removeClass('la-rebuild-product-gallery').parent().removeClass('swatch-loading');
        }
        if (this.zoom_enabled) {
            this.initZoom();
            $target.on('woocommerce_gallery_init_zoom', this.initZoom);
        }
        if (this.photoswipe_enabled) {
            this.initPhotoswipe();
        }
    };
    LA_ProductGallery.prototype.initSlickslider = function() {
        var images = this.$images,
            $target = this.$target,
            $slides = $target.find('.woocommerce-product-gallery__wrapper'),
            $thumb = $target.parent().find('.la-thumb-inner'),
            rand_num = Math.floor((Math.random() * 100) + 1),
            thumb_id = 'la_woo_thumb_' + rand_num,
            target_id = 'la_woo_target_' + rand_num;
        $slides.attr('id', target_id);
        $thumb.attr('id', thumb_id);
        images.each(function() {
            var $that = $(this);
            var video_code = $that.find('a[data-videolink]').data('videolink');
            var image_h = $slides.css('height');
            var thumb_html = '<div class="la-thumb"><img src="' + $that.attr('data-thumb') + '"/></div>';
            if (typeof video_code != 'undefined' && video_code) {
                if (video_code.indexOf("http://selfhosted/") == 0) {
                    video_code = video_code.replace('http://selfhosted/', '');
                    thumb_html = '<div class="la-thumb has-thumb-video"><div><img src="' + $that.attr('data-thumb') + '"/><span class="play-overlay"><i class="fa fa-play-circle-o" aria-hidden="true"></i></span></div></div>';
                    $that.LA_ImagesLoaded().then(function() {
                        $that.unbind('click');
                        $that.find('.zoomImg').css({
                            'display': 'none!important'
                        });
                        $that.append('<video class="selfhostedvid  noLightbox" width="460" height="315" controls preload="auto"><source src="' + video_code + '" /></video>');
                        $that.attr('data-video', '<div class="la-media-wrapper"><video class="selfhostedvid  noLightbox" width="460" height="315" controls preload="auto"><source src="' + video_code + '" /></video></div>');
                        $that.find('img').css({
                            'opacity': '0',
                            'z-index': '-1'
                        });
                        $that.find('iframe').next().remove();
                    });
                } else {
                    thumb_html = '<div class="la-thumb has-thumb-video"><div><img src="' + $that.attr('data-thumb') + '"/><span class="play-overlay"><i class="fa-play-circle-o"></i></span></div></div>';
                    $that.LA_ImagesLoaded().then(function() {
                        $that.unbind('click');
                        $that.find('.zoomImg').css({
                            'display': 'none!important'
                        });
                        $that.append('<iframe src ="' + video_code + '" width="460" " style="height:' + image_h + '; z-index:999999;" frameborder="no"></iframe>');
                        $that.attr('data-video', '<div class="la-media-wrapper"><iframe src ="' + video_code + '" width="980" height="551" frameborder="no" allowfullscreen></iframe></div>');
                        $that.find('img').css({
                            'opacity': '0',
                            'z-index': '-1'
                        });
                        $that.find('iframe').next().remove();
                    });
                }
            }
            $(thumb_html).appendTo($thumb);
        });
        $thumb.slick({
            infinite: false,
            slidesToShow: 4,
            slidesToScroll: 1,
            asNavFor: '#' + target_id,
            dots: false,
            arrows: true,
            focusOnSelect: true,
            prevArrow: '<span class="slick-prev"><svg class="dlicon-arrow-left2" width="26px" height="26px"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#dlicon-arrow-left2"></use></svg></span>',
            nextArrow: '<span class="slick-next"><svg class="dlicon-arrow-right2" width="26px" height="26px"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#dlicon-arrow-right2"></use></svg></span>',
            vertical: this.thumb_verital,
            responsive: [{
                breakpoint: 1024,
                settings: {
                    vertical: this.thumb_verital,
                    slidesToShow: 3
                }
            }, {
                breakpoint: 991,
                settings: {
                    vertical: false,
                    slidesToShow: 3
                }
            }, {
                breakpoint: 768,
                settings: {
                    vertical: false,
                    slidesToShow: 5
                }
            }, {
                breakpoint: 600,
                settings: {
                    vertical: false,
                    slidesToShow: 4
                }
            }, {
                breakpoint: 480,
                settings: {
                    vertical: false,
                    slidesToShow: 3
                }
            }]
        });
        $slides.slick({
            infinite: false,
            swipe: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            asNavFor: '#' + thumb_id,
            rtl: LA.utils.isRTL()
        });
        $target.css('opacity', 1);
        setTimeout(function() {
            $thumb.slick('setPosition');
            $target.parent().removeClass('swatch-loading');
        }, 100);
    };
    LA_ProductGallery.prototype.initZoom = function() {
        var zoomTarget = this.$images,
            galleryWidth = this.$target.width(),
            zoomEnabled = false;
        if (!this.flexslider_enabled) {
            zoomTarget = zoomTarget.first();
        }
        $(zoomTarget).each(function(index, target) {
            var image = $(target).find('img');
            if (image.data('large_image_width') > galleryWidth) {
                zoomEnabled = true;
                return false;
            }
        });
        if (zoomEnabled) {
            var zoom_options = {
                touch: false
            };
            if ('ontouchstart' in window) {
                zoom_options.on = 'click';
            }
            zoomTarget.trigger('zoom.destroy');
            zoomTarget.zoom(zoom_options);
        }
    };
    LA_ProductGallery.prototype.initPhotoswipe = function() {
        if (this.zoom_enabled && this.$images.length > 0) {
            this.$target.prepend('<a href="#" class="woocommerce-product-gallery__trigger"></a>');
            this.$target.on('click', '.woocommerce-product-gallery__trigger', this.openPhotoswipe);
        }
        this.$target.on('click', '.woocommerce-product-gallery__image a', this.openPhotoswipe);
    };
    LA_ProductGallery.prototype.onResetSlidePosition = function() {
        this.$target.parent().removeClass('swatch-loading');
        this.$target.find('.woocommerce-product-gallery__wrapper').slick('slickGoTo', 0);
    };
    LA_ProductGallery.prototype.getGalleryItems = function() {
        var $slides = this.$images,
            items = [];
        if ($slides.length > 0) {
            $slides.each(function(i, el) {
                var img = $(el).find('img'),
                    large_image_src = img.attr('data-large_image'),
                    large_image_w = img.attr('data-large_image_width'),
                    large_image_h = img.attr('data-large_image_height'),
                    item = {
                        src: large_image_src,
                        w: large_image_w,
                        h: large_image_h,
                        title: img.attr('title')
                    };
                if ($(el).attr('data-video')) {
                    item = {
                        html: $(el).attr('data-video')
                    };
                }
                items.push(item);
            });
        }
        return items;
    };
    LA_ProductGallery.prototype.openPhotoswipe = function(e) {
        e.preventDefault();
        var pswpElement = $('.pswp')[0],
            items = this.getGalleryItems(),
            eventTarget = $(e.target),
            clicked;
        if (!eventTarget.is('.woocommerce-product-gallery__trigger')) {
            clicked = eventTarget.closest('.woocommerce-product-gallery__image');
        } else {
            clicked = this.$target.find('.slick-current');
        }
        var options = {
            index: $(clicked).index(),
            shareEl: false,
            closeOnScroll: false,
            history: false,
            hideAnimationDuration: 0,
            showAnimationDuration: 0
        };
        var photoswipe = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        photoswipe.init();
    };
    $.fn.la_product_gallery = function(args) {
        new LA_ProductGallery(this, args);
        return this;
    };
}(jQuery));
(function($) {
    'use strict';

    function variation_calculator(variation_attributes, product_variations) {
        this.recalc_needed = true;
        this.variation_attributes = variation_attributes;
        this.variations_available = product_variations;
        this.variations_current = {};
        this.variations_selected = {};
        this.reset_current = function() {
            for (var attribute in this.variation_attributes) {
                this.variations_current[attribute] = {};
                for (var av = 0; av < this.variation_attributes[attribute].length; av++) {
                    this.variations_current[attribute.toString()][this.variation_attributes[attribute][av].toString()] = 0;
                }
            }
        };
        this.update_current = function() {
            this.reset_current();
            for (var i = 0; i < this.variations_available.length; i++) {
                if (!this.variations_available[i].variation_is_active) {
                    continue;
                }
                var variation_attributes = this.variations_available[i].attributes;
                for (var attribute in variation_attributes) {
                    var maybe_available_attribute_value = variation_attributes[attribute];
                    var selected_value = this.variations_selected[attribute];
                    if (selected_value && selected_value == maybe_available_attribute_value) {
                        this.variations_current[attribute][maybe_available_attribute_value] = 1;
                    } else {
                        var result = true;
                        for (var other_selected_attribute in this.variations_selected) {
                            if (other_selected_attribute == attribute) {
                                continue;
                            }
                            var other_selected_attribute_value = this.variations_selected[other_selected_attribute];
                            var other_available_attribute_value = variation_attributes[other_selected_attribute];
                            if (other_selected_attribute_value) {
                                if (other_available_attribute_value) {
                                    if (other_selected_attribute_value != other_available_attribute_value) {
                                        result = false;
                                    }
                                }
                            }
                        }
                        if (result) {
                            if (maybe_available_attribute_value === "") {
                                for (var av in this.variations_current[attribute]) {
                                    this.variations_current[attribute][av] = 1;
                                }
                            } else {
                                this.variations_current[attribute][maybe_available_attribute_value] = 1;
                            }
                        }
                    }
                }
            }
            this.recalc_needed = false;
        };
        this.get_current = function() {
            if (this.recalc_needed) {
                this.update_current();
            }
            return this.variations_current;
        };
        this.reset_selected = function() {
            this.recalc_needed = true;
            this.variations_selected = {};
        }
        this.set_selected = function(key, value) {
            this.recalc_needed = true;
            this.variations_selected[key] = value;
        };
        this.get_selected = function() {
            return this.variations_selected;
        }
    }

    function la_generator_gallery_html(variation) {
        var _html = '';
        if (typeof variation !== "undefined" && $.isArray(variation.la_additional_images)) {
            $.each(variation.la_additional_images, function(idx, val) {
                _html += '<div data-thumb="' + val.thumb[0] + '" class="woocommerce-product-gallery__image">';
                _html += '<a href="' + val.large[0] + '" data-videolink="' + val.videolink + '">';
                _html += '<img ';
                _html += 'width="' + val.single[1] + '" ';
                _html += 'height="' + val.single[2] + '" ';
                _html += 'src="' + val.single[0] + '" ';
                _html += 'class="attachment-shop_single size-shop_single" ';
                _html += 'alt="' + val.alt + '" ';
                _html += 'title="' + val.title + '" ';
                _html += 'data-caption="' + val.caption + '" ';
                _html += 'data-src="' + val.large[0] + '" ';
                _html += 'data-large_image="' + val.large[0] + '" ';
                _html += 'data-large_image_width="' + val.large[1] + '" ';
                _html += 'data-large_image_height="' + val.large[2] + '" ';
                _html += 'srcset="' + val.srcset + '" ';
                _html += 'sizes="' + val.sizes + '" ';
                _html += '</a>';
                _html += '</div>';
            });
        }
        return _html;
    }

    function la_update_swatches_gallery($form, variation) {
        var $product_selector = $form.closest('.la-p-single-wrap'),
            $main_image_col = $product_selector.find('.product--large-image'),
            _html = '';
        if (variation !== null) {
            _html = la_generator_gallery_html(variation);
        } else {
            var _old_gallery = $main_image_col.data('old_gallery') || false;
            if (_old_gallery) {
                _html = _old_gallery;
            }
        }
        if (_html != '') {
            if (!!$main_image_col.data('prev_gallery')) {
                var $_oldGalleryObject = $($main_image_col.data('prev_gallery')),
                    $_newGalleryObject = $(_html);
                var _donot_swap = true;
                if ($_oldGalleryObject.length == $_newGalleryObject.length) {
                    for (var idx = 0; idx < $_oldGalleryObject.length; idx++) {
                        if ($($_oldGalleryObject[idx]).attr('data-thumb') != $($_newGalleryObject[idx]).attr('data-thumb')) {
                            _donot_swap = false;
                        }
                    }
                } else {
                    _donot_swap = false;
                }
                if (_donot_swap) {
                    return;
                }
            }
            $main_image_col.data('prev_gallery', _html);
            _html = '<div class="woocommerce-product-gallery--with-images la-woo-product-gallery' + ($main_image_col.hasClass('force-disable-slider-script') ? ' force-disable-slider-script' : '') + '"><figure class="woocommerce-product-gallery__wrapper">' + _html + '</figure><div class="la_woo_loading"><div class="la-loader spinner3"><div class="dot1"></div><div class="dot2"></div><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div></div>';
            _html += '<div id="la_woo_thumbs" class="la-woo-thumbs"><div class="la-thumb-inner"></div></div>';
            $main_image_col.css({
                'max-height': $main_image_col.height(),
                'min-height': $main_image_col.height()
            }).addClass('swatch-loading');
            $(_html).LA_ImagesLoaded().then(function() {
                $main_image_col.html(_html);
                var $la_gallery_selector = $main_image_col.find('.la-woo-product-gallery');
                if (variation !== null) {
                    $la_gallery_selector.addClass('la-rebuild-product-gallery');
                }
                $la_gallery_selector.la_product_gallery().addClass('swatch-loaded');
                $main_image_col.css({
                    'max-height': 'none',
                    'min-height': '0'
                });
            });
        }
    }
    $.fn.la_variation_form = function() {
        var $form = this;
        var $product_id = parseInt($form.data('product_id'), 10);
        var calculator = null;
        var $use_ajax = false;
        var $swatches_xhr = null;
        $form.addClass('la-init-swatches');
        $form.find('td.label').each(function() {
            var $label = $(this).find('label');
            $label.append('<span class="swatch-label"></span>');
        });
        $form.on('bind_calculator', function() {
            var $product_variations = $form.data('product_variations');
            $use_ajax = $product_variations === false;
            if ($use_ajax) {
                $form.block({
                    message: null,
                    overlayCSS: {
                        background: '#fff',
                        opacity: 0.6
                    }
                });
            }
            var attribute_keys = {};
            $form.find('.select-option.selected').each(function(index, el) {
                var $this = $(this);
                var $option_wrapper = $this.closest('div.select').eq(0);
                var $label = $option_wrapper.closest('tr').find('.swatch-label').eq(0);
                var $la_select_box = $option_wrapper.find('select').first();
                var attr_val = $('<div/>').html($this.data('value')).text();
                attr_val = attr_val.replace(/'/g, '\\\'');
                attr_val = attr_val.replace(/"/g, '\\\"');
                if ($label) {
                    $label.html($la_select_box.children("[value='" + attr_val + "']").eq(0).text());
                }
                $la_select_box.trigger('change');
            });
            $form.find('.variations select').each(function(index, el) {
                var $current_attr_select = $(el);
                var current_attribute_name = $current_attr_select.data('attribute_name') || $current_attr_select.attr('name');
                attribute_keys[current_attribute_name] = [];
                var current_options = '';
                current_options = $current_attr_select.find('option:gt(0)').get();
                if (current_options.length) {
                    for (var i = 0; i < current_options.length; i++) {
                        var option = current_options[i];
                        attribute_keys[current_attribute_name].push($(option).val());
                    }
                }
            });
            if ($use_ajax) {
                if ($swatches_xhr) {
                    $swatches_xhr.abort();
                }
                var data = {
                    product_id: $product_id,
                    action: 'la_swatch_get_product_variations'
                };
                $swatches_xhr = $.ajax({
                    url: la_swatches.ajax_url,
                    type: 'POST',
                    data: data,
                    success: function(response) {
                        calculator = new variation_calculator(attribute_keys, response.data, null, null);
                        $form.unblock();
                    }
                });
            } else {
                calculator = new variation_calculator(attribute_keys, $product_variations, null, null);
            }
            $form.trigger('woocommerce_variation_has_changed');
        });
        $form.on('change', '.wc-default-select', function(e) {
            var $__that = $(this);
            var $label = $__that.closest('tr').find('.swatch-label').eq(0);
            if ($__that.val() != '') {
                $label.html($__that.find('option:selected').html());
            } else {
                $label.html('');
            }
        });
        $form.find('.wc-default-select').trigger('change');
        $form.on('click', '.reset_variations', function() {
            $form.find('.swatch-label').html('');
            $form.find('.select-option').removeClass('selected');
            $form.find('.radio-option').prop('checked', false);
            return false;
        }).on('click', '.select-option', function(e) {
            e.preventDefault();
            var $this = $(this);
            var $option_wrapper = $this.closest('div.select').eq(0);
            var $label = $option_wrapper.closest('tr').find('.swatch-label').eq(0);
            var $la_select_box = $option_wrapper.find('select').first();
            if ($this.hasClass('disabled')) {
                return false;
            } else if ($this.hasClass('selected')) {
                $this.removeClass('selected');
                $la_select_box.children('option:eq(0)').prop("selected", "selected").change();
                if ($label) {
                    $label.html('');
                }
            } else {
                $option_wrapper.find('.select-option').removeClass('selected');
                $this.addClass('selected');
                var attr_val = $('<div/>').html($this.data('value')).text();
                attr_val = attr_val.replace(/'/g, '\\\'');
                attr_val = attr_val.replace(/"/g, '\\\"');
                $la_select_box.trigger('focusin').children("[value='" + attr_val + "']").prop("selected", "selected").change();
                if ($label) {
                    $label.html($la_select_box.children("[value='" + attr_val + "']").eq(0).text());
                }
            }
        }).on('change', '.radio-option', function(e) {
            var $this = $(this);
            var $option_wrapper = $this.closest('div.select').eq(0);
            var $la_select_box = $option_wrapper.find('select').first();
            var attr_val = $('<div/>').html($this.val()).text();
            attr_val = attr_val.replace(/'/g, '\\\'');
            attr_val = attr_val.replace(/"/g, '\\\"');
            $la_select_box.trigger('focusin').children("[value='" + attr_val + "']").prop("selected", "selected").change();
        }).on('woocommerce_variation_has_changed', function() {
            if (calculator === null) {
                return;
            }
            $form.find('.variations select').each(function() {
                var attribute_name = $(this).data('attribute_name') || $(this).attr('name');
                calculator.set_selected(attribute_name, $(this).val());
            });
            var current_options = calculator.get_current();
            $form.find('div.select').each(function(index, element) {
                var $la_select_box = $(element).find('select').first();
                var attribute_name = $la_select_box.data('attribute_name') || $la_select_box.attr('name');
                var avaiable_options = current_options[attribute_name];
                $(element).find('div.select-option').each(function(index, option) {
                    if (!avaiable_options[$(option).data('value')]) {
                        $(option).addClass('disabled', 'disabled');
                    } else {
                        $(option).removeClass('disabled');
                    }
                });
                $(element).find('input.radio-option').each(function(index, option) {
                    if (!avaiable_options[$(option).val()]) {
                        $(option).attr('disabled', 'disabled');
                        $(option).parent().addClass('disabled', 'disabled');
                    } else {
                        $(option).removeAttr('disabled');
                        $(option).parent().removeClass('disabled');
                    }
                });
            });
            if ($use_ajax) {
                $form.find('.wc-default-select').each(function(index, element) {
                    var $la_select_box = $(element);
                    var attribute_name = $la_select_box.data('attribute_name') || $la_select_box.attr('name');
                    var avaiable_options = current_options[attribute_name];
                    $la_select_box.find('option:gt(0)').removeClass('attached');
                    $la_select_box.find('option:gt(0)').removeClass('enabled');
                    $la_select_box.find('option:gt(0)').removeAttr('disabled');
                    $la_select_box.find('option:gt(0)').each(function(optindex, option_element) {
                        if (!avaiable_options[$(option_element).val()]) {
                            $(option_element).addClass('disabled', 'disabled');
                        } else {
                            $(option_element).addClass('attached');
                            $(option_element).addClass('enabled');
                        }
                    });
                    $la_select_box.find('option:gt(0):not(.enabled)').attr('disabled', 'disabled');
                });
            }
        }).on('found_variation', function(event, variation) {
            la_update_swatches_gallery($form, variation);
        }).on('reset_image', function(event) {
            la_update_swatches_gallery($form, null);
        });
        $form.find('.single_variation').on('show_variation', function(e, variation, purchasable) {
            var $priceWrapper = $form.siblings('.single-price-wrapper');
            $('span.price', $priceWrapper).remove();
            $priceWrapper.append(variation.price_html);
        })
    };
    var forms = [];
    $(document).on('wc_variation_form', '.variations_form', function(e) {
        var $form = $(e.target);
        forms.push($form);
        if (!$form.data('has_swatches_form')) {
            if (true || $form.find('.swatch-control').length) {
                $form.data('has_swatches_form', true);
                $form.la_variation_form();
                $form.trigger('bind_calculator');
                $form.on('reload_product_variations', function() {
                    for (var i = 0; i < forms.length; i++) {
                        forms[i].trigger('woocommerce_variation_has_changed');
                        forms[i].trigger('bind_calculator');
                        forms[i].trigger('woocommerce_variation_has_changed');
                    }
                })
            }
        }
    });
})(jQuery);
(function($) {
    'use strict';
    var LA = window.LA || {};
    LA.core = window.LA.core || {};
    var _loadedDependencies = [],
        _inQueue = {};
    LA.core.initAll = function($scope) {
        var $el = $scope.find('.js-el'),
            $components = $el.filter('[data-la_component]'),
            component = null;
        if ($components.length <= 0) {
            return;
        }
        var init = function init(name, el) {
            var $el = $(el);
            if ($el.data('init-' + name)) return;
            if (typeof LA.component[name] !== 'function') {
                LA.utils.logger.set(name, 'Component', 'Component init error');
            } else {
                component = new LA.component[name](el);
                component.init();
                $el.data('init-' + name, true);
                LA.utils.eventManager.publish('LA:component_inited');
            }
        };
        $components.each(function() {
            var self = this,
                $this = $(this),
                names = $this.data('la_component');
            if (typeof names === 'string') {
                var _name = names;
                init(_name, self);
            } else {
                names.forEach(function(name) {
                    init(name, self);
                });
            }
        });
    };
    LA.core.loadDependencies = function(dependencies, callback) {
        var _callback = callback || function() {};
        if (!dependencies) {
            _callback();
            return;
        }
        var newDeps = dependencies.map(function(dep) {
            if (_loadedDependencies.indexOf(dep) === -1) {
                if (typeof _inQueue[dep] === 'undefined') {
                    LA.utils.logger.display(dep);
                    return dep;
                } else {
                    _inQueue[dep].push(_callback);
                    return true;
                }
            } else {
                return false;
            }
        });
        if (newDeps[0] === true) {
            LA.utils.logger.set({
                new_deps: newDeps[0],
                waitingFor: dependencies[0]
            }, 'Component', 'waitingFor: load js file before running callback');
            return;
        }
        if (newDeps[0] === false) {
            _callback();
            return;
        }
        var queue = newDeps.map(function(script) {
            _inQueue[script] = [_callback];
            return $.getCachedScript(script);
        });
        var onLoad = function onLoad() {
            var index = 0;
            newDeps.map(function(loaded) {
                index++;
                _inQueue[loaded].forEach(function(callback) {
                    if (index == newDeps.length) {
                        callback();
                    }
                });
                delete _inQueue[loaded];
                _loadedDependencies.push(loaded);
            });
        };
        $.when.apply(null, queue).done(onLoad);
    };
    LA.core.path = {
        theme: la_theme_config.theme_path,
        plugins: la_theme_config.js_path,
        ajaxUrl: la_theme_config.ajax_url,
        security: la_theme_config.security
    };
})(jQuery);
(function($) {
    "use strict";
    var LA = window.LA || {},
        $window = $(window),
        $document = $(document),
        $htmlbody = $('html,body'),
        $body = $('body.la-zyra-body'),
        $masthead = $('#masthead'),
        $masthead_inner = $masthead.find('.site-header-inner'),
        $masthead_aside = $('#masthead_aside'),
        $masthead_aside_inner = $masthead_aside.find('.site-header-inner'),
        $masthead_mb = $('.site-header-mobile'),
        $masthead_mb_inner = $masthead_mb.find('.site-header-inner'),
        $footer_colophon = $('#colophon'),
        $la_full_page = $('#la_full_page');
    LA.utils = window.LA.utils || {};
    LA.component = window.LA.component || {};
    LA.ui = window.LA.ui || {};
    LA.core = window.LA.core || {};
    LA.ui.AnimateLoadElement = function(effect_name, $elements, callback) {
        var _callback = callback || function() {};
        var animation_timeout = 0;
        $elements.css({
            'opacity': 0
        });
        if (effect_name == 'fade') {
            $elements.each(function() {
                $(this).stop().animate({
                    'opacity': 1
                }, 1000);
            });
            animation_timeout = 1000;
        } else if (effect_name == 'sequencefade') {
            $elements.each(function(i) {
                var $elm = $(this);
                setTimeout(function() {
                    $elm.stop().animate({
                        'opacity': 1
                    }, 1000);
                }, 100 + (i * 50));
            });
            animation_timeout = 500 + ($elements.length * 50);
        } else if (effect_name == 'upfade') {
            $elements.each(function() {
                var $elm = $(this),
                    t = parseInt($elm.css('top'), 10) + ($elm.height() / 2);
                $elm.css({
                    top: t + 'px',
                    opacity: 0
                });
            });
            $elements.each(function() {
                var $el = $(this);
                $el.stop().animate({
                    top: parseInt($el.css('top'), 10) - ($el.height() / 2),
                    opacity: 1
                }, 1500);
            });
            animation_timeout = 2000;
        } else if (effect_name == 'sequenceupfade') {
            $elements.each(function() {
                var $elm = $(this),
                    t = parseInt($elm.css('top'), 10) + ($elm.height() / 2);
                $elm.css({
                    top: t + 'px',
                    opacity: 0
                });
            });
            $elements.each(function(i) {
                var $elm = $(this);
                setTimeout(function() {
                    $elm.stop().animate({
                        top: parseInt($elm.css('top'), 10) - ($elm.height() / 2),
                        opacity: 1
                    }, 1000);
                }, 100 + i * 50);
            });
            animation_timeout = 500 + ($elements.length * 50);
        } else {
            $elements.css({
                'opacity': 1
            });
            animation_timeout = 1000;
        }
        setTimeout(function() {
            _callback.call();
        }, animation_timeout);
    };
    LA.ui.LazyLoadElementEffect = function(selector, $container) {
        LA.utils.LazyLoad($container, {
            load: function() {
                var _effect_name = false === !!$container.attr('data-la-effect') ? 'sequenceupfade' : $container.attr('data-la-effect');
                LA.ui.AnimateLoadElement(_effect_name, $(selector, $container), function() {
                    $(selector, $container).addClass('showmenow');
                });
            }
        }).observe();
    };
    LA.ui.MobileMenuEffect = function() {
        var animationClasses = {
            classin: 'dl-animate-in-2',
            classout: 'dl-animate-out-2'
        };
        switch (la_theme_config.mm_mb_effect) {
            case "1":
                animationClasses = {
                    classin: 'dl-animate-in-1',
                    classout: 'dl-animate-out-1'
                };
                break;
            case "2":
                animationClasses = {
                    classin: 'dl-animate-in-2',
                    classout: 'dl-animate-out-2'
                };
                break;
            case "3":
                animationClasses = {
                    classin: 'dl-animate-in-3',
                    classout: 'dl-animate-out-3'
                };
                break;
            case "4":
                animationClasses = {
                    classin: 'dl-animate-in-4',
                    classout: 'dl-animate-out-4'
                };
                break;
            case "5":
                animationClasses = {
                    classin: 'dl-animate-in-5',
                    classout: 'dl-animate-out-5'
                };
                break;
        }
        return animationClasses;
    };
    LA.ui.ShowMessageBox = function(html, ex_class) {
        var show_popup = function() {
            lightcase.start({
                href: '#',
                showSequenceInfo: false,
                maxWidth: 600,
                maxHeight: 500,
                onFinish: {
                    insertContent: function() {
                        if (ex_class) {
                            $body.addClass(ex_class);
                        }
                        lightcase.get('content').append('<div class="custom-lightcase-overlay"></div>');
                        lightcase.get('contentInner').children().html('<div class="la-global-message">' + html + '</div>');
                        lightcase.resize();
                        clearTimeout(LA['timeOutMessageBox']);
                        LA['timeOutMessageBox'] = setTimeout(function() {
                            lightcase.close();
                        }, 20 * 1000);
                    }
                },
                onClose: {
                    qux: function() {
                        if (ex_class) {
                            $body.removeClass(ex_class);
                        }
                        clearTimeout(LA['timeOutMessageBox']);
                    }
                }
            });
        };
        if ($.fn.lightcase) {
            show_popup();
        } else {
            LA.core.loadDependencies([LA.core.path.plugins + 'jquery.lightcase.js'], show_popup)
        }
    };
    LA.component.loadCSSFile = function(el) {
        return {
            init: function() {}
        }
    };
    LA.component.UnitResponsive = function(el) {
        var $elm = $(el),
            n = $elm.attr('data-el_media_sizes'),
            target = $elm.attr('data-el_target'),
            tmp_xlg = '',
            tmp_lg = '',
            tmp_md = '',
            tmp_sm = '',
            tmp_xs = '',
            tmp_mb = '';
        var init = function() {
            if (typeof n !== 'undefined' || n != null) {
                $.each($.parseJSON(n), function(i, v) {
                    var css_prop = i;
                    if (typeof v !== 'undefined' && v != null && v != '') {
                        $.each(v.split(";"), function(i, vl) {
                            if (typeof vl !== 'undefined' && vl != null && vl != '') {
                                var splitval = vl.split(":"),
                                    _elm_attr = css_prop + ":" + splitval[1] + ";";
                                switch (splitval[0]) {
                                    case 'xlg':
                                        tmp_xlg += _elm_attr;
                                        break;
                                    case 'lg':
                                        tmp_lg += _elm_attr;
                                        break;
                                    case 'md':
                                        tmp_md += _elm_attr;
                                        break;
                                    case 'sm':
                                        tmp_sm += _elm_attr;
                                        break;
                                    case 'xs':
                                        tmp_xs += _elm_attr;
                                        break;
                                    case 'mb':
                                        tmp_mb += _elm_attr;
                                        break;
                                }
                            }
                        });
                    }
                });
            }
            if (tmp_xlg != '') {
                appendCSS(target + '{' + tmp_xlg + '}', 'xlg');
            }
            if (tmp_lg != '') {
                appendCSS(target + '{' + tmp_lg + '}', 'lg');
            }
            if (tmp_md != '') {
                appendCSS(target + '{' + tmp_md + '}', 'md');
            }
            if (tmp_sm != '') {
                appendCSS(target + '{' + tmp_sm + '}', 'sm');
            }
            if (tmp_xs != '') {
                appendCSS(target + '{' + tmp_xs + '}', 'xs');
            }
            if (tmp_mb != '') {
                appendCSS(target + '{' + tmp_mb + '}', 'mb');
            }
        };
        var appendCSS = function(css, screen) {
            var screen_obj = {
                'lg': 'all',
                'xlg': 'screen and (min-width:1824px)',
                'md': 'screen and (max-width:1199px)',
                'sm': 'screen and (max-width:991px)',
                'xs': 'screen and (max-width:767px)',
                'mb': 'screen and (max-width:479px)'
            };
            $.each(screen_obj, function(item) {
                if (!$.exists($('#latheme_custom_css_' + item))) {
                    $('<style></style>', {
                        'id': 'latheme_custom_css_' + item,
                        'media': screen_obj[item]
                    }).appendTo('head');
                }
            });
            var $style_tag = $('#latheme_custom_css_' + screen);
            $style_tag.append(css);
        };
        return {
            init: init
        }
    };
    LA.component.AutoCarousel = function(el) {
        var $slider = $(el),
            slider_config = $slider.data('slider_config') || {},
            CustomPaging = $slider.data('slick_custompaging') || '';
        if (CustomPaging != '') {
            slider_config.customPaging = function(slide, i) {
                return CustomPaging;
            }
        }
        slider_config = $.extend({
            prevArrow: '<button type="button" class="slick-prev default"><svg><use xlink:href="#dlicon-arrow-left1"></use></svg></button>',
            nextArrow: '<button type="button" class="slick-next default"><svg><use xlink:href="#dlicon-arrow-right1"></use></svg></button>',
            rtl: LA.utils.isRTL()
        }, slider_config);
        var init = function() {
            if ($.isFunction($.fn.slick)) {
                setup_slick();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.slick.js'], setup_slick);
            }
        };
        var setup_slick = function() {
            if (typeof slider_config.arrows !== "undefined" && typeof slider_config.appendArrows === "undefined" && slider_config.arrows == true) {
                if ($slider.closest('.woocommerce').length && $slider.closest('.woocommerce').closest('.vc_row').length) {
                    slider_config.appendArrows = $('<div class="la-slick-nav"></div>').prependTo($slider.parent());
                }
            }
            try {
                $slider.on('init', function(e, slick) {
                    if (slick.slideCount <= slick.options.slidesToShow) {
                        slick.$slider.addClass('hidden-dots');
                    } else {
                        slick.$slider.removeClass('hidden-dots');
                    }
                });
                $slider.slick(slider_config);
            } catch (ex) {
                LA.utils.logger.set(ex, 'AutoCarousel');
            }
        };
        return {
            init: init
        };
    };
    LA.component.InsertCustomCSS = function(el) {
        var $style_tag = $('#latheme_custom_css'),
            custom_css = $(el).html();
        if (!$.exists($style_tag)) {
            $style_tag = $('<style></style>', {
                'id': 'latheme_custom_css'
            }).appendTo('head');
        }
        return {
            init: function() {
                $style_tag.append(custom_css);
            }
        }
    };
    LA.component.AjaxLoadShortCode = function(el) {
        var $this = $(el),
            query = $this.data('query-settings'),
            request_url = $this.data('request'),
            nonce = $this.data('public-nonce'),
            requestData = {
                action: 'get_shortcode_loader_by_ajax',
                tag: query.tag,
                data: query,
                _vcnonce: nonce
            };
        var init = function() {
            LA.utils.LazyLoad($this, {
                rootMargin: '200px',
                load: setup_ajax
            }).observe();
        };
        var setup_ajax = function() {
            if ($this.hasClass('is-loading') || $this.hasClass('has-loaded')) {
                return;
            }
            $this.addClass('is-loading');
            $.ajax({
                url: request_url,
                method: "POST",
                dataType: "html",
                data: requestData
            }).done(function(data) {
                var $data = $(data);
                $document.trigger('LA:AjaxLoadShortCode:before_render', [$this, $data]);
                $this.removeClass('is-loading');
                $this.addClass('has-loaded');
                $data.addClass('fadeIn animated');
                $data.appendTo($this);
                LA.core.initAll($this);
                $window.trigger('la_vc_row_parallax:refresh');
                $document.trigger('LA:AjaxLoadShortCode:after_render', [$this, $data]);
            });
        };
        return {
            init: init
        }
    };
    LA.component.DefaultMasonry = function(el) {
        var $isotope_container = $(el),
            item_selector = $isotope_container.data('item_selector'),
            configs = ($isotope_container.data('config_isotope') || {});
        configs = $.extend({
            percentPosition: true,
            itemSelector: item_selector
        }, configs);
        var init = function() {
            $('.la-isotope-loading', $isotope_container).show();
            if ($.isFunction($.fn.isotope)) {
                setup_masonry();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.isotope.pkgd.js'], setup_masonry);
            }
        };
        var setup_masonry = function() {
            $isotope_container.find('img[data-lazy-src!=""]').each(function() {
                $(this).attr('src', $(this).attr('data-lazy-src')).removeAttr('data-lazy-src');
            });
            $isotope_container.isotope(configs);
            if (!$isotope_container.hasClass('showposts-loop')) {
                $isotope_container.on('layoutComplete', function(e) {
                    LA.ui.LazyLoadElementEffect(item_selector, $isotope_container);
                });
            }
            $isotope_container.LA_ImagesLoaded().then(function() {
                $('.la-isotope-loading', $isotope_container).hide();
                $isotope_container.addClass('loaded').isotope('layout');
            })
        };
        return {
            init: init
        }
    };
    LA.component.AdvancedMasonry = function(el) {
        var $isotope_container = $(el),
            item_selector = $isotope_container.data('item_selector'),
            configs = ($isotope_container.data('config_isotope') || {});
        configs = $.extend({
            percentPosition: true,
            itemSelector: item_selector,
            masonry: {
                gutter: 0
            }
        }, configs);
        var init = function() {
            $('.la-isotope-loading', $isotope_container).show();
            LA.utils.eventManager.publish('LA:AdvancedMasonry:calculatorItemWidth', [$isotope_container]);
            if ($.isFunction($.fn.isotope)) {
                setup_masonry();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.isotope.pkgd.js'], setup_masonry);
            }
        };
        var get_isotope_column_number = function(w_w, item_w) {
            w_w = (w_w > 1824) ? 1824 : w_w;
            return Math.round(w_w / item_w);
        };
        LA.utils.eventManager.subscribe('LA:AdvancedMasonry:calculatorItemWidth', function(e, $isotope_container) {
            if ($isotope_container.hasClass('grid-items')) {
                return;
            }
            var ww = $window.width(),
                _base_w = $isotope_container.data('item-width'),
                _base_h = $isotope_container.data('item-height'),
                wrapperwidth = $isotope_container.width();
            var portfolionumber = get_isotope_column_number(wrapperwidth, _base_w);
            if (ww > 1300) {
                var __maxItem = $isotope_container.parent().attr('class').match(/masonry-max-item-per-row-(\d+)/);
                var __minItem = $isotope_container.parent().attr('class').match(/masonry-min-item-per-row-(\d+)/);
                if (__maxItem && __maxItem[1] && portfolionumber > parseInt(__maxItem[1])) {
                    portfolionumber = parseInt(__maxItem[1]);
                }
                if (__minItem && __minItem[1] && portfolionumber < parseInt(__minItem[1])) {
                    portfolionumber = parseInt(__minItem[1]);
                }
            }
            if (ww < 1200) {
                portfolionumber = $isotope_container.data('md-col');
                $isotope_container.removeClass('cover-img-bg');
            } else {
                $isotope_container.addClass('cover-img-bg');
            }
            if (ww < 800) {
                portfolionumber = $isotope_container.data('sm-col');
            }
            if (ww < 768) {
                portfolionumber = $isotope_container.data('xs-col');
            }
            if (ww < 500) {
                portfolionumber = $isotope_container.data('mb-col');
            }
            var itemwidth = Math.floor(wrapperwidth / portfolionumber),
                selector = $isotope_container.data('item_selector'),
                margin = parseInt($isotope_container.data('item_margin') || 0),
                dimension = parseFloat(_base_w / _base_h);
            $(selector, $isotope_container).each(function(idx) {
                var thiswidth = parseFloat($(this).data('width') || 1),
                    thisheight = parseFloat($(this).data('height') || 1),
                    _css = {};
                if (isNaN(thiswidth)) thiswidth = 1;
                if (isNaN(thisheight)) thisheight = 1;
                if (ww < 1200) {
                    thiswidth = thisheight = 1;
                }
                _css.width = Math.floor((itemwidth * thiswidth) - (margin / 2));
                _css.height = Math.floor((itemwidth / dimension) * thisheight);
                if (ww < 1200) {
                    _css.height = 'auto';
                }
                $(this).css(_css);
            });
        });
        var setup_masonry = function() {
            $isotope_container.find('img[data-lazy-src!=""]').each(function() {
                $(this).attr('src', $(this).attr('data-lazy-src')).removeAttr('data-lazy-src');
            });
            if (!$isotope_container.hasClass('masonry__column-type-default')) {
                configs.masonry.columnWidth = 1;
            }
            $isotope_container.isotope(configs);
            $isotope_container.on('layoutComplete', function(e) {
                LA.ui.LazyLoadElementEffect(item_selector, $isotope_container);
            });
            $isotope_container.LA_ImagesLoaded().then(function() {
                $('.la-isotope-loading', $isotope_container).hide();
                $isotope_container.addClass('loaded').isotope('layout');
            });
            $window.on('resize', function(e) {
                LA.utils.eventManager.publish('LA:AdvancedMasonry:calculatorItemWidth', [$isotope_container]);
            });
        };
        return {
            init: init
        }
    };
    LA.component.MasonryFilter = function(el) {
        var $this = $(el),
            options = ($this.data('isotope_option') || {}),
            $isotope = $($this.data('isotope_container'));
        var init = function() {
            if ($.isFunction($.fn.isotope)) {
                setup_filter();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.isotope.pkgd.js'], setup_filter);
            }
        };
        var setup_filter = function() {
            $('li', $this).on('click', function(e) {
                e.preventDefault();
                var selector = $(this).attr('data-filter');
                $this.find('.active').removeClass('active');
                if (selector != '*')
                    selector = '.' + selector;
                if ($isotope) {
                    $isotope.isotope($.extend(options, {
                        filter: selector
                    }));
                }
                $(this).addClass('active');
                $this.find('.la-toggle-filter').removeClass('active').text($(this).text());
            })
        };
        return {
            init: init
        }
    };
    LA.component.CountUp = function(el) {
        var $shortcode = $(el);
        var init = function() {
            LA.utils.LazyLoad($shortcode, {
                load: function() {
                    if ($.isFunction($.fn.countup)) {
                        init_countUp();
                    } else {
                        LA.core.loadDependencies([LA.core.path.plugins + 'jquery.countUp.js'], init_countUp);
                    }
                }
            }).observe();
        };
        var init_countUp = function() {
            var $this = $shortcode,
                $elm = $this.find('.stats-value');
            var endNum = parseFloat($elm.data('counter-value'));
            var Num = $elm.data('counter-value') + ' ';
            var speed = parseInt($elm.data('speed'));
            var sep = $elm.data('separator');
            var dec = $elm.data('decimal');
            var dec_count = Num.split(".");
            var grouping = true;
            var prefix = endNum > 0 && endNum < 10 ? '0' : '';
            if (dec_count[1]) {
                dec_count = dec_count[1].length - 1;
            } else {
                dec_count = 0;
            }
            if (sep == "none") {
                grouping = false;
            } else {
                grouping = true;
            }
            if (dec == "none") {
                dec = "";
            }
            $elm.countup({
                startVal: 0,
                endVal: endNum,
                decimals: dec_count,
                duration: speed,
                options: {
                    useEasing: true,
                    useGrouping: grouping,
                    separator: sep,
                    decimal: dec,
                    prefix: prefix
                }
            });
        };
        return {
            init: init
        }
    };
    LA.component.CountDownTimer = function(el) {
        var $shortcode = $(el);
        var init = function() {
            LA.utils.LazyLoad($shortcode, {
                load: function() {
                    if ($.isFunction($.fn.countup)) {
                        init_CountDownTimer();
                    } else {
                        LA.core.loadDependencies([LA.core.path.plugins + 'jquery.countdown.js'], init_CountDownTimer);
                    }
                }
            }).observe();
        };
        var init_CountDownTimer = function() {
            var $this = $shortcode.find('.elm-countdown-dateandtime'),
                t = new Date($this.html()),
                tfrmt = $this.data('countformat'),
                labels_new = $this.data('labels'),
                new_labels = labels_new.split(","),
                labels_new_2 = $this.data('labels2'),
                new_labels_2 = labels_new_2.split(",");
            var server_time = new Date($this.data('time-now'));
            var ticked = function(a) {
                var $amount = $this.find('.countdown-amount'),
                    $period = $this.find('.countdown-period');
                $amount.css({
                    'color': $this.data('tick-col'),
                    'border-color': $this.data('br-color'),
                    'border-width': $this.data('br-size'),
                    'border-style': $this.data('br-style'),
                    'border-radius': $this.data('br-radius'),
                    'background': $this.data('bg-color'),
                    'padding': $this.data('padd')
                });
                $period.css({
                    'font-size': $this.data('tick-p-size'),
                    'color': $this.data('tick-p-col')
                });
                if ($this.data('tick-style') == 'bold') {
                    $amount.css('font-weight', 'bold');
                } else if ($this.data('tick-style') == 'italic') {
                    $amount.css('font-style', 'italic');
                } else if ($this.data('tick-style') == 'boldnitalic') {
                    $amount.css('font-weight', 'bold');
                    $amount.css('font-style', 'italic');
                }
                if ($this.data('tick-p-style') == 'bold') {
                    $period.css('font-weight', 'bold');
                } else if ($this.data('tick-p-style') == 'italic') {
                    $period.css('font-style', 'italic');
                } else if ($this.data('tick-p-style') == 'boldnitalic') {
                    $period.css('font-weight', 'bold');
                    $period.css('font-style', 'italic');
                }
            };
            if ($this.hasClass('usrtz')) {
                $this.countdown({
                    labels: new_labels,
                    labels1: new_labels_2,
                    until: t,
                    format: tfrmt,
                    padZeroes: true,
                    onTick: ticked
                });
            } else {
                $this.countdown({
                    labels: new_labels,
                    labels1: new_labels_2,
                    until: t,
                    format: tfrmt,
                    padZeroes: true,
                    onTick: ticked,
                    serverSync: server_time
                });
            }
        };
        return {
            init: init
        }
    };
    LA.component.ParallaxRow = function(el) {
        var $elem = $(el);
        if (typeof window.el_vc_row_parallax_pos === "undefined") {
            window.el_vc_row_parallax_pos = 0;
        }
        window.el_vc_row_parallax_pos = window.el_vc_row_parallax_pos - 1;
        $elem.css('z-index', window.el_vc_row_parallax_pos).attr('data-zindex', window.el_vc_row_parallax_pos);
        var init = function() {
            if ($.isFunction($.fn.la_vc_row_parallax)) {
                setup_parallax_row();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.vc_row_parallax.js'], setup_parallax_row);
            }
        };
        var setup_parallax_row = function() {
            function findElementParentRow(el) {
                var row = el.parentNode;
                while (!row.classList.contains('vc_row') && !row.classList.contains('wpb_row')) {
                    if (row.tagName === 'HTML') {
                        row = false;
                        break;
                    }
                    row = row.parentNode;
                }
                if (row !== false) {
                    return row;
                }
                row = el.parentNode;
                var found = false;
                while (!found) {
                    Array.prototype.forEach.call(row.classList, function(className, i) {
                        if (found) {
                            return;
                        }
                        if (className.match(/row/g)) {
                            found = true;
                            return;
                        }
                    })
                    if (found) {
                        return row;
                    }
                    if (row.tagName === 'HTML') {
                        break;
                    }
                    row = row.parentNode;
                }
                return el.parentNode;
            }
            var $row_target = $(findElementParentRow($elem[0]));
            LA.utils.LazyLoad($row_target, {
                rootMargin: '200px',
                load: function() {
                    $elem.la_vc_row_parallax({
                        image: $elem.attr('data-bg-image'),
                        direction: $elem.attr('data-direction'),
                        mobileenabled: $elem.attr('data-mobile-enabled'),
                        mobiledevice: LA.utils.isMobile(),
                        opacity: $elem.attr('data-opacity'),
                        width: $elem.attr('data-bg-width'),
                        height: $elem.attr('data-bg-height'),
                        velocity: $elem.attr('data-velocity'),
                        align: $elem.attr('data-bg-align'),
                        repeat: $elem.attr('data-bg-repeat'),
                        zIndex: $elem.attr('data-zindex'),
                        target: $row_target,
                        removeOrig: false,
                        complete: function() {
                            $row_target.addClass('la-parent-parallax-row');
                            $('.parallax-inner-' + this.id).addClass($elem.attr('class').replace('la_parallax_row js-el', ''));
                            $(window).trigger('la_vc_row_parallax:refresh');
                        }
                    })
                }
            }).observe();
        };
        return {
            init: init
        }
    };
    LA.component.GradientBackground = function(el) {
        return {
            init: function() {
                var selector = $(el),
                    grad = selector.data('grad'),
                    row = selector.next();
                grad = grad.replace('url(data:image/svg+xml;base64,', '');
                var e_pos = grad.indexOf(';');
                grad = grad.substring(e_pos + 1);
                row.attr('style', (typeof row.attr('style') !== "undefined" ? row.attr('style') : '') + grad);
                selector.remove();
            }
        }
    };
    LA.component.AnimationBlock = function(el) {
        var $shortcode = $(el);
        var init = function() {
            LA.utils.LazyLoad($shortcode, {
                load: function() {
                    var $this = $shortcode;
                    if (false !== !!$this.data('animate')) {
                        var child2 = $this.children('div'),
                            animationName = $this.data('animate'),
                            animationDuration = $this.data('animation-duration') + 's',
                            animationIteration = $this.data('animation-iteration'),
                            animationDelay = $this.data('animation-delay');
                        var style = 'opacity:1;-webkit-animation-delay:' + animationDelay + 's;-webkit-animation-duration:' + animationDuration + ';-webkit-animation-iteration-count:' + animationIteration + '; -moz-animation-delay:' + animationDelay + 's;-moz-animation-duration:' + animationDuration + ';-moz-animation-iteration-count:' + animationIteration + '; animation-delay:' + animationDelay + 's;animation-duration:' + animationDuration + ';animation-iteration-count:' + animationIteration + ';',
                            container_style = 'opacity:1;-webkit-transition-delay: ' + (animationDelay) + 's; -moz-transition-delay: ' + (animationDelay) + 's; transition-delay: ' + (animationDelay) + 's;';
                        var p_st = $this.attr('style') || 'test';
                        p_st = p_st.replace(/ /g, '');
                        if (p_st == 'opacity:0;') {
                            if (p_st.indexOf(container_style) !== 0) {
                                $this.css('opacity', '1');
                            }
                        }
                        $.each(child2, function(index, value) {
                            var $that = $(value);
                            var prev_style = $that.attr('style');
                            if (typeof(prev_style) == 'undefined') {
                                prev_style = 'test';
                            }
                            var new_style = '';
                            if (prev_style.indexOf(style) == 0) {
                                new_style = prev_style;
                            } else {
                                new_style = style + prev_style;
                            }
                            $that.attr('style', new_style);
                            if ($that.is(':appeared') || !$this.hasClass('la-animate-viewport')) {
                                $that.addClass('animated').addClass(animationName);
                            }
                        });
                    }
                }
            }).observe();
        };
        return {
            init: init
        }
    };
    LA.component.PieChart = function(el) {
        var $shortcode = $(el);
        var init = function() {
            LA.utils.LazyLoad($shortcode, {
                load: function() {
                    if ($.isFunction($.fn.countup)) {
                        init_PieChart();
                    } else {
                        LA.core.loadDependencies([LA.core.path.plugins + 'jquery.circle-progress.js'], init_PieChart);
                    }
                }
            }).observe();
        };
        var init_PieChart = function() {
            var $this = $shortcode;
            if (false === !!$this.data('pie-init-success')) {
                var value = $this.data('pie-value'),
                    color = $this.data('pie-color'),
                    unit = $this.data('pie-units'),
                    emptyFill = $this.data('empty-fill'),
                    border = parseInt($this.data('stroke')),
                    size = $this.find('.sc-cp-canvas').innerHeight(),
                    $el_val = $this.find('.sc-cp-v');
                $this.find('.sc-cp-canvas').circleProgress({
                    value: parseFloat(value / 100),
                    thickness: border,
                    emptyFill: emptyFill,
                    reverse: true,
                    lineCap: 'butt',
                    size: size,
                    startAngle: 0 - (Math.PI / 2),
                    fill: {
                        color: color
                    }
                }).on('circle-animation-progress', function(event, progress, stepValue) {
                    $el_val.text(parseInt(100 * stepValue) + unit);
                });
                $this.data('pie-init-success', 'true');
            }
        };
        return {
            init: init
        }
    };
    LA.component.InstagramFeed = function(el) {
        var $shortcode = $(el);
        var init = function() {
            LA.utils.LazyLoad($shortcode, {
                load: function() {
                    if ($.isFunction(window.Instafeed)) {
                        init_feed();
                    } else {
                        LA.core.loadDependencies([LA.core.path.plugins + 'jquery.instafeed.js'], init_feed);
                    }
                }
            }).observe();
        };
        var init_feed = function() {
            var $this = $shortcode,
                _configs = $this.data('feed_config'),
                $target, feed_configs, feed;
            if ($this.hasClass('loading')) {
                return;
            }
            $this.addClass('loading');
            if ('' == la_theme_config.security.instagram_token) {
                $this.addClass('loaded loaded-error');
            }
            $target = $('.la-instagram-loop', $this);
            var cache_key = '';
            for (var _k in _configs) {
                if ('template' == _k) {
                    continue;
                }
                cache_key += '_';
                cache_key += _configs[_k];
            }
            cache_key = LA.utils.sanitizeSlug(cache_key).replace(/\-+/, '_').replace(/\_\_+/g, '_').replace(/^_+/, '');
            feed_configs = $.extend({
                target: $target.get(0),
                accessToken: la_theme_config.security.instagram_token,
                filter: function(image) {
                    return true;
                },
                before: function() {
                    $target.html('');
                },
                success: function() {
                    if ($target.hasClass('la-instagram-slider')) {
                        $target.addClass('js-el la-slick-slider');
                        setTimeout(function() {
                            LA.core.initAll($this);
                        }, 200);
                    }
                    $this.addClass('loaded');
                },
                after: function() {
                    if (cache_key != '') {
                        try {
                            Cookies.set(cache_key, 'yes', {
                                expires: 1 / 48
                            });
                            var $_html_cache = $target.clone();
                            if ($target.hasClass('la-instagram-slider')) {
                                $_html_cache.find('.slick-list').remove();
                            }
                            sessionStorage.setItem(cache_key, $_html_cache.html());
                        } catch (ex) {
                            LA.utils.logger.set('Cannot set cache', 'Instafeed', 'sessionStorage init error');
                        }
                    }
                }
            }, _configs);
            try {
                if (cache_key != '') {
                    var _feedFormCache = sessionStorage.getItem(cache_key);
                    if (Cookies.get(cache_key) == 'yes' && typeof _feedFormCache !== "undefined" && _feedFormCache != null) {
                        $target.html(_feedFormCache);
                        feed_configs.success();
                    } else {
                        feed = new Instafeed(feed_configs);
                        feed.run();
                    }
                } else {
                    feed = new Instafeed(feed_configs);
                    feed.run();
                }
            } catch (ex) {
                $this.addClass('loaded loaded-error');
                LA.utils.logger.set('Cannot create Instafeed object', 'Instafeed', 'Instafeed init error');
            }
        };
        return {
            init: init
        }
    };
    LA.component.InfiniteScroll = function(el) {
        var $this = $(el),
            itemSelector = $this.data('item_selector'),
            curr_page = $this.data('page_num'),
            page_path = $this.data('path'),
            max_page = $this.data('page_num_max');
        var default_options = {
            navSelector: ".la-pagination",
            nextSelector: ".la-pagination a.next",
            loading: {
                finished: function() {
                    $('.la-infinite-loading', $this).remove();
                },
                msg: $("<div class='la-infinite-loading'><div class='la-loader spinner3'><div class='dot1'></div><div class='dot2'></div><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div></div>")
            }
        }
        var setup_infinite = function() {
            $this.parent().append('<div class="la-infinite-container-flag"></div>');
            default_options = $.extend(default_options, {
                itemSelector: itemSelector,
                state: {
                    currPage: curr_page
                },
                pathParse: function(a, b) {
                    return [page_path, '/'];
                },
                maxPage: max_page
            });
            $this.infinitescroll(default_options, function(data) {
                var $data = $(data);
                LA.core.initAll($data);
                if ($this.data('isotope')) {
                    $this.append($data).isotope('appended', $data).isotope('layout');
                    setTimeout(function() {
                        $this.isotope('layout');
                    }, 100);
                } else {
                    $data.each(function(idx) {
                        if (idx == 0) {
                            idx = 1;
                        }
                        $(this).css({
                            'animation-delay': (idx * 100) + 'ms',
                            '-webkit-animation-delay': (idx * 100) + 'ms'
                        });
                    });
                    $data.addClass('fadeInUp animated');
                }
                $('.la-infinite-loading', $this).remove();
                if ($('.la-infinite-container-flag', $this.parent()).length) {
                    var _offset = LA.utils.getOffset($('.la-infinite-container-flag', $this.parent()));
                    if (_offset.y < window.innerHeight) {
                        $this.infinitescroll('retrieve');
                    }
                }
                var __instance = $this.data('infinitescroll');
                try {
                    $('.blog-main-loop__btn-loadmore').removeClass('loading');
                    if (max_page == __instance.options.state.currPage) {
                        $('.blog-main-loop__btn-loadmore').addClass('nothing-to-load');
                    }
                } catch (ex) {
                    LA.utils.logger.set(ex, 'infinitescroll', 'error when call')
                }
            });
            if ($this.hasClass('infinite-show-loadmore')) {
                $this.infinitescroll('pause');
            }
            if ($('.la-infinite-container-flag', $this.parent()).length) {
                var _offset = LA.utils.getOffset($('.la-infinite-container-flag', $this.parent()));
                if (_offset.y < window.innerHeight) {
                    $this.infinitescroll('retrieve');
                }
            }
            $(document).on('click', '.blog-main-loop__btn-loadmore', function(e) {
                e.preventDefault();
                $(this).addClass('loading');
                $('.blog-main-loop.infinite-show-loadmore').infinitescroll('retrieve');
            });
        };
        var init = function() {
            if ($.isFunction($.fn.infinitescroll)) {
                setup_infinite();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.infinitescroll.js'], setup_infinite);
            }
        };
        return {
            init: init
        }
    };
    LA.component.WooThreeSixty = function(el) {
        var $shortcode = $(el);
        if ($('.la_360_vars', $shortcode).val() == '') return;
        var init = function() {
            if ($.isFunction($.fn.ThreeSixty)) {
                init_threesixy();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.threesixty.js'], init_threesixy);
            }
        };
        var init_threesixy = function() {
            try {
                var opts = JSON.parse($('.la_360_vars', $shortcode).val()),
                    _image_array = JSON.parse(opts.images);
                var $threesixy_instance = $shortcode.ThreeSixty({
                    totalFrames: _image_array.length,
                    currentFrame: 1,
                    endFrame: _image_array.length,
                    framerate: opts.framerate,
                    playSpeed: opts.playspeed,
                    imgList: '.threesixty_images',
                    progress: '.spinner',
                    filePrefix: '',
                    height: opts.height,
                    width: opts.width,
                    navigation: opts.navigation,
                    imgArray: _image_array,
                    responsive: opts.responsive,
                    drag: opts.drag,
                    disableSpin: opts.spin
                });
                LA.utils.eventManager.publish('LA:WooThreeSixty', [$threesixy_instance, $shortcode]);
            } catch (ex) {
                LA.utils.logger.display(ex);
            }
        };
        return {
            init: init
        }
    };
    LA.core.MegaMenu = function() {
        function fix_megamenu_position($elem, containerClass, container_width, isVerticalMenu) {
            if ($('.megamenu-inited', $elem).length) {
                return false;
            }
            var $popup = $('> .popup', $elem);
            if ($popup.length == 0) return;
            var megamenu_width = $popup.outerWidth();
            if (megamenu_width > container_width) {
                megamenu_width = container_width;
            }
            if (!isVerticalMenu) {
                if (containerClass == 'body.la-zyra-body') {
                    $popup.css('left', 0 - $elem.offset().left).css('left');
                    return;
                }
                var $container = $(containerClass),
                    container_padding_left = parseInt($container.css('padding-left')),
                    container_padding_right = parseInt($container.css('padding-right')),
                    parent_width = $popup.parent().outerWidth(),
                    left = 0,
                    container_offset = LA.utils.getOffset($container),
                    megamenu_offset = LA.utils.getOffset($popup);
                if (megamenu_width > parent_width) {
                    left = -(megamenu_width - parent_width) / 2;
                } else {
                    left = 0
                }
                if ((megamenu_offset.x - container_offset.x - container_padding_left + left) < 0) {
                    left = -(megamenu_offset.x - container_offset.x - container_padding_left);
                }
                if ((megamenu_offset.x + megamenu_width + left) > (container_offset.x + $container.outerWidth() - container_padding_right)) {
                    left -= (megamenu_offset.x + megamenu_width + left) - (container_offset.x + $container.outerWidth() - container_padding_right);
                }
                $popup.css('left', left).css('left');
            }
            if (isVerticalMenu) {
                var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    itemOffset = $popup.offset(),
                    itemHeight = $popup.outerHeight(),
                    scrollTop = $window.scrollTop();
                if (itemOffset.top - scrollTop + itemHeight > clientHeight) {
                    $popup.css({
                        top: clientHeight - itemOffset.top + scrollTop - itemHeight - 20
                    });
                }
            }
            $popup.addClass('megamenu-inited');
        }

        function fix_com_submenu_position($elem, containerClass, container_width) {
            if ($('.submenu-inited', $elem).length) {
                return false;
            }
            var $popup = $('> .menu', $elem);
            if ($popup.length == 0) return;
            var megamenu_width = $popup.outerWidth();
            if (megamenu_width > container_width) {
                megamenu_width = container_width;
            }
            var $container = $(containerClass),
                container_padding_left = parseInt($container.css('padding-left')),
                container_padding_right = parseInt($container.css('padding-right')),
                parent_width = $popup.parent().outerWidth(),
                left = 0,
                container_offset = LA.utils.getOffset($container),
                megamenu_offset = LA.utils.getOffset($popup);
            if (megamenu_width > parent_width) {
                left = -(megamenu_width - parent_width) / 2;
            } else {
                left = 0
            }
            if ((megamenu_offset.x - container_offset.x - container_padding_left + left) < 0) {
                left = -(megamenu_offset.x - container_offset.x - container_padding_left);
            }
            if ((megamenu_offset.x + megamenu_width + left) > (container_offset.x + $container.outerWidth() - container_padding_right)) {
                left -= (megamenu_offset.x + megamenu_width + left) - (container_offset.x + $container.outerWidth() - container_padding_right);
            }
            $popup.css('left', left).css('left');
            $popup.addClass('submenu-inited');
        }
        LA.utils.eventManager.subscribe('LA:MegaMenu:MenuPosition', function(e, $megamenu) {
            if ($.exists($megamenu)) {
                $megamenu.each(function() {
                    var _that = $(this),
                        containerClass = _that.parent().attr('data-container'),
                        parentContainerClass = _that.parent().attr('data-parent-container'),
                        isVerticalMenu = _that.hasClass('isVerticalMenu'),
                        container_width = $(containerClass).width();
                    if (isVerticalMenu) {
                        container_width = (parentContainerClass ? $(parentContainerClass).width() : $window.width()) - $(containerClass).outerWidth();
                    }
                    $('li.mm-popup-wide .megamenu-inited', _that).removeClass('megamenu-inited');
                    $('li.mm-popup-wide > .popup', _that).removeAttr('style');
                    $('li.mm-popup-wide', _that).each(function() {
                        var $menu_item = $(this),
                            $popup = $('> .popup', $menu_item),
                            $inner_popup = $('> .popup > .inner', $menu_item),
                            item_max_width = parseInt(!!$inner_popup.data('maxWidth') ? $inner_popup.data('maxWidth') : $inner_popup.css('maxWidth')),
                            default_width = 1170,
                            _containerClass = containerClass;
                        if (container_width < default_width) {
                            default_width = container_width;
                        }
                        if (default_width > item_max_width) {
                            default_width = item_max_width;
                        }
                        var new_megamenu_width = default_width - parseInt($inner_popup.css('padding-left')) - parseInt($inner_popup.css('padding-right')),
                            _tmp = $menu_item.attr('class').match(/mm-popup-column-(\d)/),
                            columns = _tmp && _tmp[1] || 4;
                        if ($menu_item.hasClass('mm-popup-force-fullwidth')) {
                            if (isNaN(item_max_width)) {
                                if (isVerticalMenu) {
                                    new_megamenu_width = $('#page.site > .site-inner').width() - parseInt($inner_popup.css('padding-left')) - parseInt($inner_popup.css('padding-right'));
                                } else {
                                    new_megamenu_width = $window.width() - parseInt($inner_popup.css('padding-left')) - parseInt($inner_popup.css('padding-right'));
                                }
                            }
                        }
                        $('> ul > li', $inner_popup).each(function() {
                            var _col = parseFloat($(this).data('column')) || 1;
                            if (_col < 0) _col = 1;
                            var column_width = parseFloat((new_megamenu_width / columns) * _col);
                            $(this).data('old-width', $(this).width()).css('width', column_width);
                        });
                        if ($menu_item.hasClass('mm-popup-force-fullwidth')) {
                            $inner_popup.data('maxWidth', item_max_width).css('maxWidth', 'none');
                            $('> ul', $inner_popup).css('width', item_max_width);
                            if (!isVerticalMenu) {
                                default_width = $window.width();
                                _containerClass = 'body.la-zyra-body';
                            } else {
                                default_width = $('#page.site > .site-inner').width();
                            }
                        }
                        $popup.width(default_width);
                        fix_megamenu_position($menu_item, _containerClass, container_width, isVerticalMenu);
                    });
                })
            }
        });
        LA.utils.eventManager.subscribe('LA:MegaMenu:ComponentSubMenuPosition', function(e, $menu_item, containerClass, container_width) {
            if ($.exists($menu_item)) {
                $menu_item.each(function() {
                    $('>.menu', $(this)).removeAttr('style');
                    $('>.menu.submenu-inited', $(this)).removeClass('submenu-inited');
                    fix_com_submenu_position($(this), containerClass, container_width);
                })
            }
        });
        LA.utils.eventManager.publish('LA:MegaMenu:MenuPosition', [$('.mega-menu')]);
        LA.utils.eventManager.publish('LA:MegaMenu:ComponentSubMenuPosition', [$('.header-top-elements .la_com_action--dropdownmenu'), '.header-top-elements', $('.header-top-elements').width()]);
        LA.utils.eventManager.publish('LA:MegaMenu:ComponentSubMenuPosition', [$('.header-main .la_com_action--dropdownmenu'), '.header-main', $('.header-main').width()]);
        LA.utils.eventManager.publish('LA:MegaMenu:ComponentSubMenuPosition', [$('.site-header-mobile .la_com_action--dropdownmenu'), '.site-header-mobile', $('.site-header-mobile').width()]);
        $window.on('resize', function() {
            LA.utils.eventManager.publish('LA:MegaMenu:MenuPosition', [$('.mega-menu')]);
            LA.utils.eventManager.publish('LA:MegaMenu:ComponentSubMenuPosition', [$('.header-top-elements .la_com_action--dropdownmenu'), '.header-top-elements', $('.header-top-elements').width()]);
            LA.utils.eventManager.publish('LA:MegaMenu:ComponentSubMenuPosition', [$('.site-header-mobile .la_com_action--dropdownmenu'), '.site-header-mobile', $('.site-header-mobile').width()]);
            LA.utils.eventManager.publish('LA:MegaMenu:ComponentSubMenuPosition', [$('.header-main .la_com_action--dropdownmenu'), '.header-main', $('.header-main').width()]);
        });
        var $mobile_nav = $('#la_mobile_nav');
        var Init = function Init() {
            if ($.isFunction($.fn.dlmenu)) {
                mobile_menu();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.dlmenu.js'], mobile_menu);
            }
        };
        var mobile_menu = function mobile_menu() {
            $mobile_nav.find('> .dl-menu > div > ul > li').unwrap().unwrap();
            $mobile_nav.find('.sub-menu, ul.children').addClass('dl-submenu');
            $mobile_nav.dlmenu({
                backLabel: la_theme_config.i18n.backtext,
                animationClasses: LA.ui.MobileMenuEffect()
            })
        };
        Init();
        $document.on('click', 'html.support-touch-click .mega-menu > li.menu-item-has-children > a', function(e) {
            $(this).parent().siblings().removeClass('go-go');
            if (!$(this).parent().hasClass('go-go')) {
                e.preventDefault();
                $(this).parent().addClass('go-go');
            }
        })
    };
    LA.core.SitePreload = function() {
        setTimeout(function() {
            $body.removeClass('site-loading');
        }, 500);
        $window.load(function() {
            $body.removeClass('site-loading');
        });
        $window.on('beforeunload', function(e) {
            if (LA.utils.browser.name != 'safari') {
                $('#page.site').css('opacity', '0');
                $body.addClass('site-loading');
            }
        });
        $window.on('pageshow', function(e) {
            if (e.originalEvent.persisted) {
                $body.removeClass('site-loading');
            }
        });
        LA.utils.LazyLoad($('.la-lazyload-image')).observe();
        LA.utils.eventManager.subscribe('LA:Component:LazyLoadImage', function(e, $container) {
            $container.find('img[data-lazy-src], img[data-lazy-original]').each(function(idx, img) {
                var srcset = img.getAttribute('data-lazy-srcset'),
                    sizes = img.getAttribute('data-lazy-sizes'),
                    src = img.getAttribute('data-lazy-src') || img.getAttribute('data-lazy-original');
                if (srcset) {
                    img.setAttribute('srcset', srcset);
                }
                if (sizes) {
                    img.setAttribute('sizes', sizes);
                }
                if (src) {
                    img.setAttribute('src', src);
                }
                $(img).removeClass('lazyload');
            })
        });
    };
    LA.core.FixVCRowFullWidth = function() {
        if (!LA.utils.isActiveVC()) return;
        $('.la-shortcode-maps').each(function() {
            $(this).closest('.wpb_wrapper').height('100%');
        });
        $window.on('load resize', function() {
            var $maps = $('.map-full-height');
            $maps.css('height', $maps.closest('.vc_column-inner ').height());
        });
        var $page = $('#main.site-main');
        $document.on('vc-full-width-row', function(e) {
            for (var i = 1; i < arguments.length; i++) {
                var $el = $(arguments[i]);
                $el.addClass('vc_hidden');
                var $el_full = $el.next('.vc_row-full-width');
                $el_full.length || ($el_full = $el.parent().next('.vc_row-full-width'));
                var el_margin_left = parseInt($el.css("margin-left"), 10),
                    el_margin_right = parseInt($el.css("margin-right"), 10),
                    offset = 0 - $el_full.offset().left - el_margin_left + $page.offset().left + parseInt($page.css('padding-left')),
                    width = $page.width();
                var el_max_width = parseInt($el.css('maxWidth'));
                if (el_max_width > 0 && el_max_width < width) {
                    if (offset < 0) {
                        offset = offset + (width - el_max_width) / 2;
                    }
                    width = el_max_width;
                }
                if ($el.css({
                        position: "relative",
                        left: offset,
                        "box-sizing": "border-box",
                        width: width
                    }), !$el.data("vcStretchContent")) {
                    var padding = -1 * offset;
                    0 > padding && (padding = 0);
                    var paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
                    0 > paddingRight && (paddingRight = 0), $el.css({
                        "padding-left": padding + "px",
                        "padding-right": paddingRight + "px"
                    })
                }
                if ($.exists($el.find('[data-la_component="AdvancedMasonry"]'))) {
                    var $advanceMasonry = $el.find('[data-la_component="AdvancedMasonry"]');
                    $advanceMasonry.each(function() {
                        if (false === !!$(this).data('data-advancedmasonry-setwidth')) {
                            LA.utils.eventManager.publish('LA:AdvancedMasonry:calculatorItemWidth', [$(this)]);
                            $(this).attr('data-advancedmasonry-setwidth', true);
                        }
                    })
                }
                $el.attr('data-vc-full-width-init', 'true');
                $el.addClass('vc-has-modified').removeClass('vc_hidden');
            }
        });
        $document.trigger('vc-full-width-row', $('[data-vc-full-width="true"]'));
        if (typeof vc_js === "undefined") {
            $window.resize(function() {
                $document.trigger('vc-full-width-row', $('[data-vc-full-width="true"]'));
            });
        }

        function fix_rtl_fullWidth() {
            var $elements = $('[data-vc-full-width="true"]');
            $.each($elements, function() {
                var $el = $(this);
                $el.css('right', $el.css('left')).css('left', '');
            });
        }
        if (LA.utils.isRTL()) {
            $document.on('vc-full-width-row', function() {
                fix_rtl_fullWidth();
            });
            fix_rtl_fullWidth();
        }
    };
    LA.core.ElementAjaxClickEvent = function() {
        $document.on('click', '.elm-loadmore-ajax a', function(e) {
            e.preventDefault();
            var $this = $(this).closest('.elm-loadmore-ajax');
            if ($this.hasClass('is-loading')) {
                return;
            }
            var $container = $($this.data('container')),
                elem = $this.data('item-class'),
                query = $this.data('query-settings'),
                request_url = $this.data('request'),
                nonce = $this.data('public-nonce'),
                paged = parseInt($this.data('paged')),
                max_page = parseInt($this.data('max-page')),
                requestData;
            if (paged < max_page) {
                query.atts.paged = paged + 1;
                requestData = {
                    action: 'get_shortcode_loader_by_ajax',
                    tag: query.tag,
                    data: query,
                    _vcnonce: nonce
                };
                $this.addClass('is-loading');
                $.ajax({
                    url: request_url,
                    method: "POST",
                    dataType: "html",
                    data: requestData
                }).done(function(data) {
                    var $data = $(data).find(elem);
                    $data.LA_ImagesLoaded().then(function() {
                        if ($container.hasClass('la-slick-slider')) {
                            $container.slick('slickAdd', $data);
                            $container.slick('setPosition');
                        } else if ($container.hasClass('la-isotope-container')) {
                            $container.isotope('insert', $data.addClass('showmenow'));
                            $container.trigger('LA:Masonry:ajax_loadmore', [$container]);
                        } else {
                            $data.addClass('fadeIn animated').appendTo($container);
                        }
                        LA.core.initAll($data);
                        $this.data('paged', paged + 1);
                        $this.removeClass('is-loading');
                        if (max_page === paged + 1) {
                            $this.addClass('hide');
                        }
                    })
                });
            }
        }).on('click', '.elm-pagination-ajax a', function(e) {
            e.preventDefault();
            if ($(this).closest('.elm-pagination-ajax').hasClass('is-loading')) {
                return;
            }
            var $this = $(this),
                $parent = $this.closest('.elm-pagination-ajax'),
                $container = $($parent.data('container')),
                elem = $parent.data('item-class'),
                query = $parent.data('query-settings'),
                request_url = $parent.data('request'),
                nonce = $parent.data('public-nonce'),
                paged = parseInt(LA.utils.getUrlParameter('la_paged', $this.attr('href'))),
                appendType = $parent.data('append-type'),
                requestData;
            if (paged > 0) {
                query.atts.paged = paged;
                requestData = {
                    action: 'get_shortcode_loader_by_ajax',
                    tag: query.tag,
                    data: query,
                    _vcnonce: nonce
                };
                $parent.addClass('is-loading');
                $.ajax({
                    url: request_url,
                    method: "POST",
                    dataType: "html",
                    data: requestData
                }).done(function(data) {
                    var $data = $(data).find(elem);
                    $data.LA_ImagesLoaded().then(function() {
                        if ($container.data('isotope')) {
                            $container.isotope('remove', $container.isotope('getItemElements'));
                            $container.isotope('insert', $data);
                            setTimeout(function() {
                                $container.isotope('layout');
                            }, 200)
                        } else {
                            $data.addClass('fadeIn animated');
                            $data.appendTo($container.empty());
                        }
                        LA.core.initAll($data);
                        $parent.removeClass('is-loading');
                    });
                    $parent.find('.la-pagination').html($(data).find('.la-pagination').html());
                });
            }
        }).on('click', '.la-favorite-link a', function(e) {
            e.preventDefault();
            var $this = $(this),
                post_id = $this.data('favorite_id');
            if (!$this.hasClass('loading') && !$this.hasClass('exists')) {
                var $el_exists = $('a[data-favorite_id="' + post_id + '"]');
                $el_exists.addClass('loading');
                $.ajax({
                    url: LA.core.path.ajaxUrl,
                    method: "POST",
                    dataType: "json",
                    data: {
                        'action': 'la_favorite_posts',
                        'type': $this.hasClass('added') ? 'remove' : 'add',
                        'post_id': post_id,
                        'security': LA.core.path.security.favorite_posts
                    }
                }).done(function(response) {
                    $el_exists.removeClass('loading');
                    if (response.success) {
                        if ($this.hasClass('added')) {
                            $el_exists.removeClass('added exists');
                        } else {
                            $el_exists.addClass('added exists');
                        }
                        $el_exists.find('.favorite_count').html(response.data.count);
                    }
                }).fail(function() {
                    $el_exists.removeClass('loading');
                })
            }
        })
    };
    LA.core.ElementClickEvent = function() {
        $document.on('click', '.la_com_action--searchbox.searchbox__01 .component-target', function(e) {
            e.preventDefault();
            $body.addClass('open-search-form');
            setTimeout(function() {
                $('.searchform-fly .search-field').focus();
            }, 600);
        }).on('click', '.la_com_action--aside_header .component-target,.btn-aside-toggle', function(e) {
            e.preventDefault();
            if ($.exists($('.header--menu-burger'))) {
                $body.removeClass('open-header-aside');
                $body.toggleClass('open-burger-menu');
            } else {
                $body.removeClass('open-burger-menu');
                $body.toggleClass('open-header-aside');
            }
        }).on('click', '.btn-close-search', function(e) {
            e.preventDefault();
            $body.removeClass('open-search-form');
        });
        $document.on('click', '.site-header-mobile .la_com_action--primary-menu', function(e) {
            e.preventDefault();
            $(this).toggleClass('active');
            $body.toggleClass('open-mobile-menu');
        }).on('click', '.la-overlay-global,.header-aside-overlay', function(e) {
            e.preventDefault();
            $('.la_com_action--primary-menu,.la_com_action--dropdownmenu').removeClass('active');
            $body.removeClass('open-aside open-search-form open-cart-aside open-mobile-menu open-advanced-shop-filter open-header-aside open-master-aside open-overlay');
        }).on('click', '.site-main,.section-page-header', function(e) {
            $('.site-header-mobile .la_com_action--primary-menu').removeClass('active');
            $body.removeClass('open-mobile-menu');
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
        });
        $window.on('load scroll', function() {
            if ($window.scrollTop() > $window.height() + 100) {
                $('.backtotop-container').addClass('show');
            } else {
                $('.backtotop-container').removeClass('show');
            }
        })
        $document.on('click', '.btn-backtotop', function(e) {
            e.preventDefault();
            $htmlbody.animate({
                scrollTop: 0
            }, 800)
        })
        $document.on('click', '.la-popup:not(.wpb_single_image), .banner-video .banner--link-overlay, .la-popup.wpb_single_image a,.la-popup-slideshow', function(e) {
            e.preventDefault();
            var $that = $(this);
            var init_auto_popup = function() {
                lightcase.start({
                    href: $that.attr('href'),
                    showTitle: false,
                    showCaption: false,
                    maxWidth: $window.width(),
                    maxHeight: $window.height(),
                    iframe: {
                        width: 1280,
                        height: 720
                    },
                    onFinish: {
                        createOverlay: function() {
                            lightcase.get('content').append('<div class="custom-lightcase-overlay"></div>');
                        }
                    }
                });
            }
            if ($.fn.lightcase) {
                init_auto_popup();
            } else {
                LA.core.loadDependencies([LA.core.path.plugins + 'jquery.lightcase.js'], init_auto_popup)
            }
        }).on('click', '.popup-button-continue,.custom-lightcase-overlay', function(e) {
            e.preventDefault();
            try {
                lightcase.close();
            } catch (ex) {}
        }).on('click', '.vc_message_box > .close-button', function(e) {
            e.preventDefault();
            var _this = $(this),
                _parent = _this.closest('.vc_message_box');
            _parent.slideUp(300);
        })
    };
    LA.core.FullPageJs = function() {
        function FPsetSectionAnimation($from, $to, direction) {
            var from_idx = $from.index(),
                to_idx = $to.index(),
                _tmp;
            if (from_idx > to_idx) {
                _tmp = to_idx;
                to_idx = from_idx;
                from_idx = _tmp;
            }
            if ('up' == direction) {
                $('>.fp-tableCell', $from).removeClass('go-down is-active').addClass('go-up');
                if ((to_idx - from_idx) > 1) {
                    $('>.fp-tableCell', $('.vc_section.la_fp_section').slice(from_idx, to_idx)).removeClass('go-down').addClass('go-up');
                }
            } else {
                $('>.fp-tableCell', $from).removeClass('go-up is-active').addClass('go-down');
                if ((to_idx - from_idx) > 1) {
                    $('>.fp-tableCell', $('.vc_section.la_fp_section').slice(from_idx, to_idx)).removeClass('go-up').addClass('go-down');
                }
            }
            $('>.fp-tableCell', $to).removeClass('go-up go-down').addClass('is-active');
        }

        function FPsetSectionAnimationComplete(animation, $currentSection) {}

        function FPAnimationBeforeInit() {
            $('.la_fp_section:not(.active) > .fp-tableCell').addClass('go-up');
            $('.la_fp_section.active > .fp-tableCell').addClass('is-active');
        }
        if ("undefined" !== typeof $.fn.fullpage) {
            var anchors = [],
                navigationTooltips = [],
                fp_config;
            $('<div class="la-fp-arrows"><ul><li class="prev"><i></i></li><li class="num"><span class="current">01</span><span class="total">01</span></li><li class="next"><i></i></li></ul></div>').appendTo($body);
            $document.on('click', '.la-fp-arrows .prev', function(e) {
                e.preventDefault();
                $.fn.fullpage.moveSectionUp();
            }).on('click', '.la-fp-arrows .next', function(e) {
                e.preventDefault();
                $.fn.fullpage.moveSectionDown();
            });
            $footer_colophon.addClass('la_fp_section fp-auto-height').attr('data-anchor', 'colophon').appendTo($la_full_page);
            $('.vc_section.la_fp_section').each(function() {
                var _name = $(this).attr('data-anchor'),
                    _tip = $(this).attr('data-fp-tooltip');
                if (!_name) _name = LA.utils.randomID();
                if (!_tip) _tip = '';
                anchors.push(_name);
                navigationTooltips.push(_tip);
                if ($('.la_fp_slide.la_fp_child_section', $(this)).length == 0) {
                    var $fp_bg = $('<div class="fp-bg" data-parent-anchor="' + _name + '"></div>');
                    $fp_bg.css('background', $(this).css('background'));
                    $(this).addClass('dont-need-bg').prepend($fp_bg);
                }
            });
            if ($.exists($('#section_page_header'))) {
                $('#section_page_header').remove();
            }
            var _fp_animation = $la_full_page.data('fp-animation');
            fp_config = $.extend({
                sectionSelector: '.la_fp_section',
                slideSelector: '.la_fp_slide',
                navigation: false,
                anchors: anchors,
                navigationTooltips: navigationTooltips,
                paddingTop: LA.utils.getAdminbarHeight(),
                onLeave: function(index, nextIndex, direction) {
                    if (nextIndex > 1) {
                        $body.removeClass('fp-active-firstsection');
                    } else {
                        $body.addClass('fp-active-firstsection');
                    }
                    var $that = $(this),
                        $next_elem = $('#la_full_page > .fp-section:nth-child(' + nextIndex + ')');
                    $('.la-fp-arrows .num .current').html(nextIndex < 10 ? '0' + nextIndex : nextIndex);
                    if ($next_elem.hasClass('site-footer')) {
                        $that.addClass('last-before-footer no-effect');
                    } else {
                        if ('up' == direction) {
                            if ($next_elem.hasClass('last-before-footer')) {
                                $next_elem.addClass('no-effect');
                            }
                            if ($that.hasClass('last-before-footer')) {
                                $that.removeClass('no-effect');
                            }
                        } else {
                            $that.siblings('.last-before-footer').removeClass('no-effect');
                        }
                    }
                    if ($that.hasClass('last-before-footer')) {
                        if ('down' == direction) {
                            $that.css({
                                'transform': 'translateY(-' + $footer_colophon.innerHeight() + 'px)',
                                '-webkit-transform': 'translateY(-' + $footer_colophon.innerHeight() + 'px)',
                                '-moz-transform': 'translateY(-' + $footer_colophon.innerHeight() + 'px)'
                            });
                        }
                    }
                    if ($next_elem.hasClass('last-before-footer')) {
                        $next_elem.css({
                            'transform': 'translateY(0)',
                            '-webkit-transform': 'translateY(0)',
                            '-moz-transform': 'translateY(0)'
                        });
                    }
                    if ($that.find('.fp-slides').length) {
                        $that.find('.fp-slide.active .wpb_animate_when_almost_visible.wpb_start_animation').removeClass('wpb_start_animation');
                    } else {
                        $that.find('.wpb_animate_when_almost_visible.wpb_start_animation').removeClass('wpb_start_animation');
                    }
                    FPsetSectionAnimation($that, $next_elem, direction);
                    if (nextIndex > 1) {
                        if (direction == 'down') {
                            $('.site-header').addClass('is-sticky');
                            $('.site-header-mobile').addClass('is-sticky');
                            $('.site-header-inner').removeClass('sticky--pinned').addClass('sticky--unpinned');
                            $('.la-header-sticky-height').css('height', $('.la-header-sticky-height').prev().innerHeight()).hide();
                            $('.la-header-sticky-height-mb').css('height', $('.la-header-sticky-height-mb').prev().innerHeight()).hide();
                        } else {
                            $('.site-header-inner').removeClass('sticky--unpinned').addClass('sticky--pinned');
                            $('.la-header-sticky-height').css('height', $('.la-header-sticky-height').prev().innerHeight()).show();
                            $('.la-header-sticky-height-mb').css('height', $('.la-header-sticky-height-mb').prev().innerHeight()).show();
                        }
                    } else {
                        $('.site-header').removeClass('is-sticky');
                        $('.site-header-mobile').removeClass('is-sticky');
                        $('.site-header-inner').removeClass('sticky--unpinned').addClass('sticky--pinned');
                        $('.la-header-sticky-height').css('height', $('.la-header-sticky-height').prev().innerHeight()).show();
                        $('.la-header-sticky-height-mb').css('height', $('.la-header-sticky-height-mb').prev().innerHeight()).show();
                    }
                    $la_full_page.trigger('la_event_fp:onLeave', [index, nextIndex, direction]);
                },
                afterLoad: function(anchorLink, index) {
                    var $that = $(this);
                    if ($that.hasClass('site-footer')) {
                        $that.prev('.vc_section').addClass('last-before-footer');
                    }
                    FPsetSectionAnimationComplete(_fp_animation, $that);
                    if ($.exists($that.find('.fp-slides'))) {
                        $that.find('.fp-slide.active .wpb_animate_when_almost_visible:not(.wpb_start_animation)').addClass('wpb_start_animation');
                    } else {
                        $that.find('.wpb_animate_when_almost_visible:not(.wpb_start_animation)').addClass('wpb_start_animation');
                    }
                    $la_full_page.trigger('la_event_fp:afterLoad', [anchorLink, index]);
                },
                afterRender: function() {
                    $('.la-fp-arrows .num .total').html(anchors.length);
                    if ($body.hasClass('enable-header-transparency')) {
                        $masthead.addClass('fp-header-is-transparency');
                    }
                    $body.addClass('fp-active-firstsection');
                    FPAnimationBeforeInit();
                    $('#fp-nav ul li, .fp-slidesNav ul li').each(function() {
                        $(this).find('>a').append('<b class="num">' + ($(this).index() + 1) + '</b>');
                    });
                    $('#fp-nav li:gt(' + parseInt(anchors.length - 1) + ')').remove();
                    $la_full_page.trigger('la_event_fp:afterRender');
                },
                afterResize: function() {
                    $la_full_page.trigger('la_event_fp:afterResize');
                },
                afterResponsive: function(isResponsive) {
                    $la_full_page.trigger('la_event_fp:afterResponsive', [isResponsive]);
                },
                afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex) {
                    var $that = $(this);
                    $that.find('.wpb_animate_when_almost_visible:not(.wpb_start_animation)').addClass('wpb_start_animation');
                    $la_full_page.trigger('la_event_fp:afterSlideLoad', [anchorLink, index, slideAnchor, slideIndex]);
                },
                onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex) {
                    var $that = $(this);
                    $that.find('.wpb_animate_when_almost_visible.wpb_start_animation').removeClass('wpb_start_animation');
                    $la_full_page.trigger('la_event_fp:onSlideLeave', [anchorLink, index, slideIndex, direction, nextSlideIndex]);
                }
            }, la_theme_config.fullpage);
            if ($('.vc_section.la_fp_fixed_top').length == 0) {
                fp_config.fixedElements = fp_config.fixedElements.replace('.la_fp_fixed_top', '');
            }
            if ($('.vc_section.la_fp_fixed_bottom').length == 0) {
                fp_config.fixedElements = fp_config.fixedElements.replace('.la_fp_fixed_bottom', '');
            }
            fp_config.fixedElements = fp_config.fixedElements.replace(/^,+/, '');
            $body.removeClass('admin-bar');
            $(atob("I3dwYWRtaW5iYXI=")).css('position', 'absolute').addClass('hidden');
            $la_full_page.fullpage(fp_config);
            $window.resize(function() {
                try {
                    $.fn.fullpage.reBuild();
                } catch (ex) {
                    LA.utils.logger.display(ex)
                }
            });
        }
    };
    LA.core.HeaderSticky = function() {
        var obj_height = la_theme_config.header_height;
        var scroll_direction = 'none',
            last_scroll = $window.scrollTop();
        $window.on('scroll', function() {
            var currY = $window.scrollTop();
            scroll_direction = (currY > last_scroll) ? 'down' : ((currY === last_scroll) ? 'none' : 'up');
            last_scroll = currY;
        });
        if ($.exists($masthead_aside_inner)) {
            $masthead_aside_inner.la_sticky({
                offset_top: LA.utils.getAdminbarHeight()
            });
            $window.on('resize', function() {
                setTimeout(function() {
                    $body.trigger("la_sticky:recalc");
                }, 300);
            })
        }
        var sticky_auto_hide = $body.hasClass('header-sticky-type-auto') ? true : false;
        var prepareHeightForHeader = function() {
            var winW = $window.width(),
                _lg_height = obj_height.desktop.normal,
                _sm_height = obj_height.tablet.normal,
                _xs_height = obj_height.mobile.normal;
            if (winW > 992) {
                if ($.exists($masthead)) {
                    if ($body.hasClass('header-v7')) {
                        var _hv7_height = $('.header-v7 .site-header__nav-primary').innerHeight();
                        _lg_height = parseInt(_lg_height) + _hv7_height;
                        _sm_height = parseInt(_sm_height) + _hv7_height;
                    }
                    if (winW > 1300) {
                        $('.la-header-sticky-height').height(_lg_height);
                    } else {
                        $('.la-header-sticky-height').height(_sm_height);
                    }
                }
            } else {
                if ($.exists($masthead_mb)) {
                    $('.la-header-sticky-height-mb').height(_xs_height);
                }
            }
        }
        prepareHeightForHeader();
        $window.on('resize', prepareHeightForHeader);

        function init_desktop_sticky() {
            if (!$.exists($masthead)) return;
            var $_header = $masthead,
                $_header_outer = $('.site-header-outer', $masthead),
                $_header_inner = $masthead_inner;
            var lastY = 0,
                offsetY = LA.utils.getOffset($_header_outer).y;
            $window.on('resize', function(e) {
                offsetY = LA.utils.getOffset($_header_outer).y;
            }).on('scroll', function(e) {
                if ($window.width() < 992) return;
                var currentScrollY = $window.scrollTop();
                var _breakpoint = offsetY - LA.utils.getAdminbarHeight();
                if (sticky_auto_hide) {
                    _breakpoint = offsetY - LA.utils.getAdminbarHeight() + $_header_outer.outerHeight();
                }
                if (currentScrollY > _breakpoint) {
                    $_header_inner.css('top', LA.utils.getAdminbarHeight());
                    if (!$_header.hasClass('is-sticky')) {
                        $_header.addClass('is-sticky');
                    }
                    if (sticky_auto_hide) {
                        if (currentScrollY < $body.height() && lastY > currentScrollY) {
                            if ($_header_inner.hasClass('sticky--unpinned')) {
                                $_header_inner.removeClass('sticky--unpinned');
                            }
                            if (!$_header_inner.hasClass('sticky--pinned')) {
                                $_header_inner.addClass('sticky--pinned');
                            }
                        } else {
                            if ($_header_inner.hasClass('sticky--pinned')) {
                                $_header_inner.removeClass('sticky--pinned');
                            }
                            if (!$_header_inner.hasClass('sticky--unpinned')) {
                                $_header_inner.addClass('sticky--unpinned');
                            }
                        }
                    } else {
                        $_header_inner.addClass('sticky--pinned');
                    }
                } else {
                    if (sticky_auto_hide) {
                        if ($_header.hasClass('is-sticky')) {
                            if (_breakpoint - currentScrollY < $_header_outer.outerHeight()) {} else {
                                $_header.removeClass('is-sticky');
                                $_header_inner.css('top', '0').removeClass('sticky--pinned sticky--unpinned');
                            }
                        }
                    } else {
                        if ($_header.hasClass('is-sticky')) {
                            $_header.removeClass('is-sticky');
                            $_header_inner.css('top', '0').removeClass('sticky--pinned sticky--unpinned');
                        }
                    }
                }
                lastY = currentScrollY;
            })
        }

        function init_mobile_sticky() {
            if (!$.exists($masthead_mb)) return;
            var $_header = $masthead_mb,
                $_header_outer = $('.site-header-outer', $masthead_mb),
                $_header_inner = $masthead_mb_inner;
            var lastY = 0,
                offsetY = LA.utils.getOffset($_header_outer).y;
            $window.on('resize', function(e) {
                offsetY = LA.utils.getOffset($_header_outer).y;
            }).on('scroll', function(e) {
                if ($window.width() > 992) return;
                var currentScrollY = $window.scrollTop();
                var _breakpoint = offsetY - LA.utils.getAdminbarHeight();
                if (sticky_auto_hide) {
                    _breakpoint = offsetY - LA.utils.getAdminbarHeight() + $_header_outer.outerHeight();
                }
                if (currentScrollY > _breakpoint) {
                    $_header_inner.css('top', LA.utils.getAdminbarHeight());
                    if (!$_header.hasClass('is-sticky')) {
                        $_header.addClass('is-sticky');
                    }
                    if (sticky_auto_hide) {
                        if (currentScrollY < $body.height() && lastY > currentScrollY) {
                            if ($_header_inner.hasClass('sticky--unpinned')) {
                                $_header_inner.removeClass('sticky--unpinned');
                            }
                            if (!$_header_inner.hasClass('sticky--pinned')) {
                                $_header_inner.addClass('sticky--pinned');
                            }
                        } else {
                            if ($_header_inner.hasClass('sticky--pinned')) {
                                $_header_inner.removeClass('sticky--pinned');
                            }
                            if (!$_header_inner.hasClass('sticky--unpinned')) {
                                $_header_inner.addClass('sticky--unpinned');
                            }
                        }
                    } else {
                        $_header_inner.addClass('sticky--pinned');
                    }
                } else {
                    if (sticky_auto_hide) {
                        if ($_header.hasClass('is-sticky')) {
                            if (_breakpoint - currentScrollY < $_header_outer.outerHeight()) {} else {
                                $_header.removeClass('is-sticky');
                                $_header_inner.css('top', '0').removeClass('sticky--pinned sticky--unpinned');
                            }
                        }
                    } else {
                        if ($_header.hasClass('is-sticky')) {
                            $_header.removeClass('is-sticky');
                            $_header_inner.css('top', '0').removeClass('sticky--pinned sticky--unpinned');
                        }
                    }
                }
                lastY = currentScrollY;
            })
        }
        if (!$body.hasClass('enable-header-sticky')) return;
        init_desktop_sticky();
        init_mobile_sticky();
    };
    LA.core.WooCommerce = function() {
        $('.la-woo-product-gallery').each(function() {
            $(this).la_product_gallery();
        });
        $('.variations_form').trigger('wc_variation_form');
        $document.on('click', '.product_item .la-swatch-control .swatch-wrapper', function(e) {
            e.preventDefault();
            var $swatch_control = $(this),
                $image = $swatch_control.closest('.product_item').find('.product_item--thumbnail-holder img').first();
            if ($swatch_control.closest('.product_item--thumbnail').length > 0) {
                $image = $swatch_control.closest('.product_item--thumbnail').find('.product_item--thumbnail-holder img').last();
            }
            if ($swatch_control.hasClass('selected')) return;
            $swatch_control.addClass('selected').siblings().removeClass('selected');
            if (!$image.hasClass('_has_changed')) {
                $image.attr('data-o-src', $image.attr('src')).attr('data-o-sizes', $image.attr('sizes')).attr('data-o-srcset', $image.attr('srcset'));
            }
            if (!!$swatch_control.attr('data-thumb')) {
                $image.attr('src', $swatch_control.attr('data-thumb')).removeAttr('sizes srcset');
            }
        });
        $document.on('click', '.la-quickview-button', function(e) {
            if ($window.width() > 900) {
                e.preventDefault();
                var $this = $(this);
                var show_popup = function() {
                    lightcase.start({
                        href: $this.data('href'),
                        showSequenceInfo: false,
                        type: 'ajax',
                        maxWidth: 1300,
                        maxHeight: 650,
                        ajax: {
                            width: $window.width(),
                            height: $window.height()
                        },
                        onFinish: {
                            renderContent: function() {
                                $body.addClass('open-quickview-product');
                                lightcase.get('content').append('<div class="custom-lightcase-overlay"></div>');
                                var $popup = lightcase.get('case');
                                try {
                                    $('.la-woo-product-gallery', $popup).la_product_gallery();
                                } catch (ex) {}
                                lightcase.resize();
                            }
                        },
                        onClose: {
                            qux: function() {
                                $body.removeClass('open-quickview-product');
                            }
                        }
                    })
                }
                if ($.fn.lightcase) {
                    show_popup();
                } else {
                    LA.core.loadDependencies([LA.core.path.plugins + 'jquery.lightcase.js'], show_popup)
                }
            }
        });
        $document.on('click', '#lightcase-case .product-main-image .product--large-image a', function(e) {
            e.preventDefault();
        });

        function set_attribute_for_wl_table() {
            var $table = $('table.wishlist_table');
            $table.addClass('shop_table_responsive');
            $table.find('thead th').each(function() {
                var _th = $(this),
                    _text = _th.text().trim();
                if (_text != "") {
                    $('td.' + _th.attr('class'), $table).attr('data-title', _text);
                }
            });
        }
        set_attribute_for_wl_table();
        $body.on('removed_from_wishlist', function(e) {
            set_attribute_for_wl_table();
        });
        $document.on('added_to_cart', function(e, fragments, cart_hash, $button) {
            setTimeout(set_attribute_for_wl_table, 800);
        });
        $document.on('click', '.product a.add_wishlist', function(e) {
            if (!$(this).hasClass('added')) {
                e.preventDefault();
                var $button = $(this),
                    product_id = $button.data('product_id'),
                    $product_image = $button.closest('.product').find('.product_item--thumbnail img:eq(0)'),
                    product_name = 'Product',
                    data = {
                        add_to_wishlist: product_id,
                        product_type: $button.data('product-type'),
                        action: yith_wcwl_l10n.actions.add_to_wishlist_action
                    };
                if (!!$button.data('product_title')) {
                    product_name = $button.data('product_title');
                }
                if ($button.closest('.product--summary').length) {
                    $product_image = $button.closest('.product').find('.woocommerce-product-gallery__image img:eq(0)');
                }
                try {
                    if (yith_wcwl_l10n.multi_wishlist && yith_wcwl_l10n.is_user_logged_in) {
                        var wishlist_popup_container = $button.parents('.yith-wcwl-popup-footer').prev('.yith-wcwl-popup-content'),
                            wishlist_popup_select = wishlist_popup_container.find('.wishlist-select'),
                            wishlist_popup_name = wishlist_popup_container.find('.wishlist-name'),
                            wishlist_popup_visibility = wishlist_popup_container.find('.wishlist-visibility');
                        data.wishlist_id = wishlist_popup_select.val();
                        data.wishlist_name = wishlist_popup_name.val();
                        data.wishlist_visibility = wishlist_popup_visibility.val();
                    }
                    if (!LA.utils.isCookieEnable()) {
                        alert(yith_wcwl_l10n.labels.cookie_disabled);
                        return;
                    }
                    $.ajax({
                        type: 'POST',
                        url: yith_wcwl_l10n.ajax_url,
                        data: data,
                        dataType: 'json',
                        beforeSend: function() {
                            $button.addClass('loading');
                        },
                        complete: function() {
                            $button.removeClass('loading').addClass('added');
                        },
                        success: function(response) {
                            var msg = $('#yith-wcwl-popup-message'),
                                response_result = response.result,
                                response_message = response.message;
                            if (yith_wcwl_l10n.multi_wishlist && yith_wcwl_l10n.is_user_logged_in) {
                                var wishlist_select = $('select.wishlist-select');
                                if (typeof $.prettyPhoto !== 'undefined') {
                                    $.prettyPhoto.close();
                                }
                                wishlist_select.each(function(index) {
                                    var t = $(this),
                                        wishlist_options = t.find('option');
                                    wishlist_options = wishlist_options.slice(1, wishlist_options.length - 1);
                                    wishlist_options.remove();
                                    if (typeof response.user_wishlists !== 'undefined') {
                                        var i = 0;
                                        for (i in response.user_wishlists) {
                                            if (response.user_wishlists[i].is_default != "1") {
                                                $('<option>').val(response.user_wishlists[i].ID).html(response.user_wishlists[i].wishlist_name).insertBefore(t.find('option:last-child'))
                                            }
                                        }
                                    }
                                });
                            }
                            var html = '<div class="popup-added-msg">';
                            if (response_result == 'true') {
                                if ($product_image.length) {
                                    html += $('<div>').append($product_image.clone()).html();
                                }
                                html += '<div class="popup-message"><strong class="text-color-heading">' + product_name + ' </strong>' + la_theme_config.i18n.wishlist.success + '</div>';
                            } else {
                                html += '<div class="popup-message">' + response_message + '</div>';
                            }
                            html += '<a class="btn btn-secondary view-popup-wishlish" rel="nofollow" href="' + response.wishlist_url.replace('/view', '') + '">' + la_theme_config.i18n.wishlist.view + '</a>';
                            html += '<a class="btn popup-button-continue" rel="nofollow" href="#">' + la_theme_config.i18n.global.continue_shopping + '</a>';
                            html += '</div>';
                            LA.ui.ShowMessageBox(html, 'open-wishlist-msg');
                            $button.attr('href', response.wishlist_url);
                            $('.add_wishlist[data-product_id="' + $button.data('product_id') + '"]').addClass('added');
                            $body.trigger('added_to_wishlist');
                        }
                    });
                } catch (ex) {
                    LA.utils.logger.set(ex, 'WooCommerce', 'Wishlist');
                }
            }
        });
        $document.on('click', 'table.compare-list .remove a', function(e) {
            e.preventDefault();
            $('.add_compare[data-product_id="' + $(this).data('product_id') + '"]', window.parent.document).removeClass('added');
        });
        $document.on('click', '.la_com_action--compare', function(e) {
            e.preventDefault();
            try {
                lightcase.close();
            } catch (ex) {}
            var action_url = LA.utils.addQueryArg('', 'action', yith_woocompare.actionview);
            action_url = LA.utils.addQueryArg(action_url, 'iframe', 'true');
            $body.trigger('yith_woocompare_open_popup', {
                response: action_url
            });
        });
        $document.on('click', '.product a.add_compare', function(e) {
            e.preventDefault();
            if ($(this).hasClass('added')) {
                $body.trigger('yith_woocompare_open_popup', {
                    response: LA.utils.addQueryArg(LA.utils.addQueryArg('', 'action', yith_woocompare.actionview), 'iframe', 'true')
                });
                return;
            }
            var $button = $(this),
                widget_list = $('.yith-woocompare-widget ul.products-list'),
                $product_image = $button.closest('.product').find('.product_item--thumbnail img:eq(0)'),
                data = {
                    action: yith_woocompare.actionadd,
                    id: $button.data('product_id'),
                    context: 'frontend'
                },
                product_name = 'Product';
            if (!!$button.data('product_title')) {
                product_name = $button.data('product_title');
            }
            if ($button.closest('.product--summary').length) {
                $product_image = $button.closest('.product').find('.woocommerce-product-gallery__image img:eq(0)');
            }
            $.ajax({
                type: 'post',
                url: yith_woocompare.ajaxurl.toString().replace('%%endpoint%%', yith_woocompare.actionadd),
                data: data,
                dataType: 'json',
                beforeSend: function() {
                    $button.addClass('loading');
                },
                complete: function() {
                    $button.removeClass('loading').addClass('added');
                },
                success: function(response) {
                    if ($.isFunction($.fn.block)) {
                        widget_list.unblock()
                    }
                    var html = '<div class="popup-added-msg">';
                    if ($product_image.length) {
                        html += $('<div>').append($product_image.clone()).html();
                    }
                    html += '<div class="popup-message"><strong class="text-color-heading">' + product_name + ' </strong>' + la_theme_config.i18n.compare.success + '</div>';
                    html += '<a class="btn btn-secondary la_com_action--compare" rel="nofollow" href="' + response.table_url + '">' + la_theme_config.i18n.compare.view + '</a>';
                    html += '<a class="btn popup-button-continue" href="#" rel="nofollow">' + la_theme_config.i18n.global.continue_shopping + '</a>';
                    html += '</div>';
                    LA.ui.ShowMessageBox(html, 'open-compare-msg');
                    $('.add_compare[data-product_id="' + $button.data('product_id') + '"]').addClass('added');
                    widget_list.unblock().html(response.widget_table);
                }
            });
        });
        var cart_timeout = null;
        $(document.body).on('wc_fragments_refreshed updated_wc_div wc_fragments_loaded', function(e) {
            clearTimeout(cart_timeout);
            cart_timeout = setTimeout(function() {
                LA.utils.eventManager.publish('LA:Component:LazyLoadImage', [$('.widget_shopping_cart_content')]);
            }, 100);
        });
        $document.on('click', '.la_com_action--cart', function(e) {
            if ($window.width() > 767) {
                e.preventDefault();
                $body.toggleClass('open-cart-aside');
            }
        });
        $document.on('click', '.btn-close-cart', function(e) {
            e.preventDefault();
            $body.removeClass('open-cart-aside');
        });
        $document.on('adding_to_cart', function(e) {
            $body.addClass('open-cart-aside');
            $('.cart-flyout').addClass('cart-flyout--loading');
            $('.la_com_action--cart > a > i').removeClass('dl-icon-cart1').addClass('fa-spinner fa-spin');
        });
        $document.on('added_to_cart', function(e, fragments, cart_hash, $button) {
            var $product_image = $button.closest('.product').find('.product_item--thumbnail img:eq(0)'),
                target_attribute = $body.is('.woocommerce-yith-compare') ? ' target="_parent"' : '',
                product_name = 'Product';
            if (!!$button.data('product_title')) {
                product_name = $button.data('product_title');
            }
            var html = '<div class="popup-added-msg">';
            if ($product_image.length) {
                html += $('<div>').append($product_image.clone()).html();
            }
            html += '<div class="popup-message"><strong class="text-color-heading">' + product_name + ' </strong>' + la_theme_config.i18n.addcart.success + '</div>';
            html += '<a rel="nofollow" class="btn btn-secondary view-popup-addcart" ' + target_attribute + ' href="' + wc_add_to_cart_params.cart_url + '">' + wc_add_to_cart_params.i18n_view_cart + '</a>';
            html += '<a class="btn popup-button-continue" rel="nofollow" href="#">' + la_theme_config.i18n.global.continue_shopping + '</a>';
            html += '</div>';
            $('.cart-flyout').removeClass('cart-flyout--loading');
            $('.la_com_action--cart > a > i').removeClass('fa-spinner fa-spin').addClass('dl-icon-cart1');
        });
        $('.la-global-message').on('click', '.popup-button-continue', function(e) {
            e.preventDefault();
            $('.la-global-message .close-message').trigger('click');
        });
        $document.on('click', '.wc-view-toggle span', function() {
            var _this = $(this),
                _mode = _this.data('view_mode');
            if (!_this.hasClass('active')) {
                $('.wc-view-toggle span').removeClass('active');
                _this.addClass('active');
                $('.page-content').find('ul.products').removeClass('products-grid').removeClass('products-list').addClass('products-' + _mode);
                Cookies.set('la_zyra_wc_catalog_view_mode', _mode, {
                    expires: 2
                });
            }
        });
        $('.la-p-single-3 .la-single-product-page .la-custom-pright').la_sticky({
            parent: $('.la-single-product-page'),
            offset_top: ($masthead.length ? parseInt($masthead.height()) + 30 : 30)
        });
        $('.woocommerce-tabs .wc-tab-title a').on('click', function(e) {
            e.preventDefault();
            var $this = $(this),
                $wrap = $this.closest('.woocommerce-tabs'),
                $wc_tabs = $wrap.find('.wc-tabs'),
                $panel = $this.closest('.wc-tab');
            $wc_tabs.find('a[href="' + $this.attr('href') + '"]').parent().addClass('active').siblings().removeClass('active');
            $panel.addClass('active').siblings().removeClass('active');
        });
        $('.woocommerce-Tabs-panel--description').addClass('active');
        $document.on('click', '.quantity .qty-minus', function(e) {
            e.preventDefault();
            var $qty = $(this).next('.qty'),
                val = parseInt($qty.val());
            $qty.val(val > 1 ? val - 1 : 1).trigger('change');
        }).on('click', '.quantity .qty-plus', function(e) {
            e.preventDefault();
            var $qty = $(this).prev('.qty'),
                val = parseInt($qty.val());
            $qty.val(val > 0 ? val + 1 : 1).trigger('change');
        }).on('click', '.la-p-single-wrap.la-p-single-3 .la-custom-pright .wc-tabs a', function(e) {
            setTimeout(function() {
                $body.trigger('la_sticky:recalc');
            }, 300);
        });
        $('#coupon_code_ref').on('change', function(e) {
            $('.woocommerce-cart-form__contents #coupon_code').val($(this).val());
        });
        $('#coupon_btn_ref').on('click', function(e) {
            e.preventDefault();
            $('.woocommerce-cart-form__contents [name="apply_coupon"]').click();
        });
        $document.on('click', '#la_tabs_customer_login .la_tab_control a', function(e) {
            e.preventDefault();
            var $this = $(this),
                $target = $($this.attr('href'));
            $this.parent().addClass('active').siblings().removeClass('active');
            $target.addClass('active').show().siblings('div').removeClass('active').hide();
        });
        $document.on('click', '#la_tabs_customer_login .btn-create-account', function(e) {
            e.preventDefault();
            $('#la_tabs_customer_login .la_tab_control li:eq(1) a').trigger('click');
        });
        $('#la_tabs_customer_login .la_tab_control li:first-child a').trigger('click');
        if (window.location.hash == '#la_tab--register' && $.exists($('#la_tabs_customer_login .la_tab_control li a[href="#la_tab--register"]'))) {
            $('#la_tabs_customer_login .la_tab_control li a[href="#la_tab--register"]').trigger('click');
        }
    };
    LA.core.AjaxShopFilter = function() {
        LA.utils.logger.ajax_xhr = null;
        if ($('#la_shop_products').length == 0) {
            return;
        }
        var elm_to_replace = ['#la_shop_products', '.wc-toolbar-top', '.la-advanced-product-filters .sidebar-inner'];
        var target_to_init = '#la_shop_products .la-pagination a, .la-advanced-product-filters-result a',
            target_to_init2 = '.wc-ordering a, .wc-view-count a, .woocommerce.product-sort-by a, .woocommerce.la-price-filter-list a, .woocommerce.widget_layered_nav a, .woocommerce.widget_product_tag_cloud a';
        LA.utils.eventManager.subscribe('LA:AjaxShopFilter', function(e, url, element) {
            if ($('.wc-toolbar-container').length > 0) {
                var position = $('.wc-toolbar-container').offset().top - 200;
                $htmlbody.stop().animate({
                    scrollTop: position
                }, 800);
            }
            if ('?' == url.slice(-1)) {
                url = url.slice(0, -1);
            }
            url = url.replace(/%2C/g, ',');
            url = LA.utils.removeURLParameter(url, 'la_doing_ajax');
            if (typeof(history.pushState) != "undefined") {
                history.pushState(null, null, url);
            }
            LA.utils.eventManager.publish('LA:AjaxShopFilter:before_send', [url, element]);
            if (LA.utils.logger.ajax_xhr) {
                LA.utils.logger.ajax_xhr.abort();
            }
            url = LA.utils.addQueryArg(url, 'la_doing_ajax', 'true');
            LA.utils.logger.ajax_xhr = $.get(url, function(response) {
                for (var i = 0; i < elm_to_replace.length; i++) {
                    if ($(elm_to_replace[i]).length) {
                        if (elm_to_replace[i] == '.la-advanced-product-filters .sidebar-inner') {
                            if ($(response).find(elm_to_replace[i]).length) {
                                $(elm_to_replace[i]).replaceWith($(response).find(elm_to_replace[i]));
                            }
                        } else {
                            try {
                                $(elm_to_replace[i]).find('[data-la_component="CountDownTimer"]').countdown('destroy');
                            } catch (ex) {}
                            $(elm_to_replace[i]).replaceWith($(response).find(elm_to_replace[i]));
                        }
                    }
                }
                if (element.closest('.widget_layered_nav').length) {
                    var _tmp_id = element.closest('.widget_layered_nav').attr('id');
                    $('#' + _tmp_id).replaceWith($(response).find('#' + _tmp_id));
                }
                if (element.closest('.la-price-filter-list').length) {
                    var _tmp_id = element.closest('.la-price-filter-list').attr('id');
                    $('#' + _tmp_id).replaceWith($(response).find('#' + _tmp_id));
                }
                if (element.closest('.widget_layered_nav_filters').length) {
                    var _tmp_id = element.closest('.widget_layered_nav_filters').attr('id');
                    $('#' + _tmp_id).replaceWith($(response).find('#' + _tmp_id));
                }
                $('.la-ajax-shop-loading').removeClass('loading');
                LA.utils.eventManager.publish('LA:AjaxShopFilter:success', [response, url, element]);
            }, 'html');
        });
        LA.utils.eventManager.subscribe('LA:AjaxShopFilter:success', function(e, response, url, element) {
            var $product_container = $('#la_shop_products');
            $product_container.LA_ImagesLoaded().then(function() {
                if ($window.width() < 768) {
                    if ($body.hasClass('open-advanced-shop-filter')) {
                        $body.removeClass('open-advanced-shop-filter');
                    }
                }
                LA.core.initAll($product_container);
            })
        });
        $document.on('click', '.btn-advanced-shop-filter', function(e) {
            e.preventDefault();
            $body.toggleClass('open-advanced-shop-filter');
            $('.la-advanced-product-filters').stop().animate({
                height: 'toggle'
            });
        }).on('click', target_to_init, function(e) {
            e.preventDefault();
            $('.la-ajax-shop-loading').addClass('loading');
            LA.utils.eventManager.publish('LA:AjaxShopFilter', [$(this).attr('href'), $(this)]);
        }).on('click', target_to_init2, function(e) {
            e.preventDefault();
            $('.la-ajax-shop-loading').addClass('loading');
            if ($(this).closest('.widget_layered_nav').length) {
                $(this).parent().addClass('active');
            } else {
                $(this).parent().addClass('active').siblings().removeClass('active');
            }
            LA.utils.eventManager.publish('LA:AjaxShopFilter', [$(this).attr('href'), $(this)]);
        }).on('click', '.woocommerce.widget_layered_nav_filters a', function(e) {
            e.preventDefault();
            $('.la-ajax-shop-loading').addClass('loading');
            LA.utils.eventManager.publish('LA:AjaxShopFilter', [$(this).attr('href'), $(this)]);
        }).on('submit', '.widget_price_filter form', function(e) {
            e.preventDefault();
            var $form = $(this),
                url = $form.attr('action') + '?' + $form.serialize();
            $('.la-ajax-shop-loading').addClass('loading');
            LA.utils.eventManager.publish('LA:AjaxShopFilter', [url, $form]);
        })
    };
    LA.core.Blog = function() {
        var $sidebar_inner = $('.sidebar-inner');
        $('.widget_pages > ul, .widget_archive > ul, .widget_categories > ul, .widget_product_categories > ul', $sidebar_inner).addClass('menu').closest('.widget').addClass('accordion-menu');
        $('.widget_nav_menu', $sidebar_inner).closest('.widget').addClass('accordion-menu');
        $('.widget_categories > ul li.cat-parent,.widget_product_categories li.cat-parent', $sidebar_inner).addClass('mm-item-has-sub');
        $('.menu li > ul').each(function() {
            var $ul = $(this);
            $ul.before('<span class="narrow"><i></i></span>');
        });
        $document.on('click', '.accordion-menu li.menu-item-has-children > a,.menu li.mm-item-has-sub > a,.menu li > .narrow', function(e) {
            e.preventDefault();
            var $parent = $(this).parent();
            if ($parent.hasClass('open')) {
                $parent.removeClass('open');
                $parent.find('>ul').stop().slideUp();
            } else {
                $parent.addClass('open');
                $parent.find('>ul').stop().slideDown();
                $parent.siblings().removeClass('open').find('>ul').stop().slideUp();
            }
        });
    };
    $(function() {
        LA.core.SitePreload();
        LA.core.MegaMenu();
        LA.core.FullPageJs();
        LA.core.initAll($(document));
        LA.core.FixVCRowFullWidth();
        LA.core.ElementAjaxClickEvent();
        LA.core.ElementClickEvent();
        LA.core.Blog();
        LA.core.WooCommerce();
        LA.core.AjaxShopFilter();
        if ($.exists($('.item-overlay-effect'))) {
            $('.item-overlay-effect').la_hover_effect();
        }
    });
    $window.on('load', function() {
        $body.addClass('body-loaded');
        LA.core.HeaderSticky();
    });
})(jQuery);
(function($) {
    "use strict";
    $(function() {
        var $mm_account = $('.site-header .header__action--account-menu');
        $('> a', $mm_account).attr('href', $('.menu a', $mm_account).first().attr('href'));
        $('>.menu', $mm_account).remove();
        if ($.exists($('.search-form .sf-fields select.postform'))) {
            var $selectCat = $('.search-form .sf-fields select.postform');
            $('<select id="width_tmp_select"><option id="width_tmp_option">' + $('option:selected', $selectCat).text() + '</option></select>').insertAfter($selectCat);
            $selectCat.width($('#width_tmp_select').width());
            $selectCat.change(function() {
                $('#width_tmp_option').html($('option:selected', $(this)).text());
                $(this).width($('#width_tmp_select').width());
            });
        }
        if ($.exists($('#section_page_header'))) {
            var $page_header = $('#section_page_header');
            if (typeof $page_header.css('backgroundImage') !== 'undefined' && $page_header.css('backgroundImage') !== '') {
                var el_parallax_bg = $page_header.css('backgroundImage').replace(/url\(|\)|"|'/g, '');
                if (el_parallax_bg != '' && el_parallax_bg != 'none') {
                    $('<img/>').on('load', function() {
                        var el_parallax = $("<div class='la_parallax_row js-el' data-bg-align='' data-direction='up' data-opacity='100' data-velocity='-0.15' data-mobile-enabled='parallax-enable-mobile' data-bg-height='' data-bg-width='' data-bg-image='' data-bg-repeat='false' data-id='' data-la_component='ParallaxRow' style='display: none'></div>");
                        if (this.naturalWidth != "undefined" && this.naturalWidth != 0 && this.naturalHeight != "undefined" && this.naturalHeight != 0) {
                            el_parallax.attr('data-bg-image', el_parallax_bg.replace(/^http(s)?:\/\//, '//')).attr('data-bg-height', this.naturalHeight).attr('data-bg-width', this.naturalWidth).appendTo($page_header);
                            LA.core.initAll($page_header);
                        }
                    }).attr('src', el_parallax_bg.replace(/^http(s)?:\/\//, '//'));
                }
            }
        }
    })
})(jQuery);
