App.run(function($window, $timeout, $rootScope) {
    function findNextParent(el) {
        var initial =$(el).height();
        do {
            el = el.parentElement;
        } while(el != null && $(el).hasClass("align-parent-bottom"));
        if (el == null) return initial;
        return el;
    }

    function getOffset(el, par) {
        if(par==null || el == null)return NaN;
        if (el==par)return 0;
        if (el.offsetParent == el.parentElement) return getOffset(el.parentElement, par) + el.offsetTop;
        return getOffset(el.parentElement, par) + el.offsetTop - el.parentElement.offsetTop;
    }
    function reAlignEls() {
        if(timeout != undefined) {
            $timeout.cancel(timeout);
        }
        var timeout = $timeout(function() {
            var bottomAlignedEls = $('.align-parent-bottom');
            for (var i = 0; i < bottomAlignedEls.length; i++) {
                var el = bottomAlignedEls[i];
                var par = findNextParent(el);
                var dy = getOffset(el, par);
                if(dy == NaN || dy < 0) dy = 0;
                var h = $(par).height() - dy;
                if (h > 0 && $(el).height() != h) {
                    var discount = el.getAttribute("discount-height");
                    if (discount == undefined) {
                        discount = 0;
                    }
                    else {
                        discount = parseInt(discount);
                    }
                    $(el).height(h - discount);
                }
            }
        });
    }

    $($window).resize(reAlignEls);

    $rootScope.$on('trigger-resize', reAlignEls);
    //reAlignEls();
});