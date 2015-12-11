debounce = function (delay, preventDefault, callback) {
    var timeout = null;
    return function () {
        if (preventDefault) {
            var event = arguments[0];
            (event.preventDefault || event.stop || event.stopPropagation || function () {
            }).call(event);
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        var args = arguments;
        timeout = setTimeout(function () {
            callback.apply(null, args);
            timeout = null;
        }, delay);
    };
}
