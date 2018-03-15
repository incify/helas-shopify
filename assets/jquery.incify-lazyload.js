// Initialize Lozad

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

    LA.utils.LazyLoad = function () {
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
    };

}(jQuery));
