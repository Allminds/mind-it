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
};
if (!String.prototype.wrapString) {
    String.prototype.wrapString = function (wrapWidth) {
        var whiteSpaces = this.match(/\s/g) || [];
        return (this.split(/\s/g) || []).reduce(function (acc, word, index) {
            acc.push(word);
            if (index < whiteSpaces.length)
                acc.push(whiteSpaces[index]);
            return acc;
        }, []).reduce(function (lines, word) {
            if (lines.length == 0) {
                lines.push(word);
                return lines;
            }
            var lastLine = lines[lines.length - 1];
            if (lastLine.length + word.length <= wrapWidth) {
                lastLine += word;
                lines[lines.length - 1] = lastLine;
            } else {
                lines.push(word);
            }
            return lines;
        }, []);

    }
}
