var mindMapService = App.MindMapService.getInstance();

var getDims = function () {
    var w = window, e = document.documentElement,
        x = w.innerWidth || e.clientWidth,
        y = w.innerHeight || e.clientHeight;

    return {width: x, height: y};
};

var dims = getDims();

var lastClick = 0;

App.chart = MindMap()
    .width(20 * dims.width)
    .height(20 * dims.height)
    .text(function (textSelector) {
        var texts = textSelector[0];
        texts.forEach(function (text) {
            var currentTextSelector = d3.select(text);
            currentTextSelector.selectAll('tspan').remove();
            var node = currentTextSelector.node();
            if (node) {
                //var lines = node.__data__.name.wrapString(1000);
                var lines = node.__data__.name.split("\n");
                lines.forEach(function (line, index) {
                    var dy = index == 0 ? 0 : 30;
                    currentTextSelector.append('svg:tspan').attr('x', 0).attr('dy', dy).text(line);
                });
            }
        });
    })
    .click(function () {
        if (this.__data__) {
            var newClickTime = new Date().getTime();

            if (newClickTime - lastClick < 300) {
                App.eventBinding.f2Action(this);
            }

            if (App.isIndicatorActive) {
                return;
            }

            App.nodeSelector.setPrevDepth(this.__data__.depth);
            App.select(this);
            
            lastClick = newClickTime;
        }
    });
