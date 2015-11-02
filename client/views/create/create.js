var mindMapService = new MindMapService();
var directionToggler = {
    currentDir: "right",
    canToggle: false
};


Template.create.rendered = function rendered() {
    rootNodeData = mindMapService.buildTree(this.data.id, this.data.data);
    update(rootNodeData);
    var rootNode = d3.selectAll('.node')[0].find(function (node) {
        return !node.__data__.position;
    });

    select(rootNode);
};

var getDims;
getDims = function () {
    var w = window, d = document, e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return {width: x, height: y};
};

var select = function (node) {
    // Find previously selected, unselect
    d3.select(".selected rect").remove();
    d3.select(".selected").classed("selected", false);

    // Select current item
    d3.select(node).classed("selected", true);

    if (d3.select(node).select("ellipse")[0][0])
        return;

    var text = d3.select(node).select("text")[0][0],
        bBox = text.getBBox(),
        rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rect.setAttribute("x", bBox.x);
    rect.setAttribute("y", bBox.y);
    rect.setAttribute("width", bBox.width);
    rect.setAttribute("height", bBox.height);
    node.insertBefore(rect, text);

};


var selectNode = function (target) {
    if (target) {
        var sel = d3.selectAll('#mindmap svg .node').filter(function (d) {
            return d._id == target._id
        })[0][0];
        if (sel) {
            select(sel);
        }
    }
};

var showEditor = function () {
    var self = this,
        nodeData = this.__data__;

    var parentElement = d3.select(this.children[0].parentNode),
        currentElement = parentElement.select('text');


    var inp = parentElement.append("foreignObject")
        .append("xhtml:form").append("input");

    function resetEditor() {
        currentElement.attr("visibility", "");
        d3.select("foreignObject").remove();
    }

    updateNode = function () {
        nodeData.name = inp.node().value;
        mindMapService.updateNode(nodeData._id, {name: nodeData.name});
        resetEditor();
        chart.update();
        setTimeout(function(){
            selectNode(nodeData);
        },10);
    };

    currentElement.attr("visibility", "hidden");

    inp.attr("value", function () {
        return nodeData.name;
    }).attr('', function () {
        this.value = this.value;
        this.focus();
        this.select();
    }).attr("style", "height:30px;")
        .style("width", "auto")
        .on("blur", updateNode)
        .on("keydown", function () {
            // IE fix
            if (!d3.event)
                d3.event = window.event;

            var e = d3.event;
            if (e.keyCode == 13) {
                if (typeof (e.cancelBubble) !== 'undefined') // IE
                    e.cancelBubble = true;
                if (e.stopPropagation)
                    e.stopPropagation();
                e.preventDefault();
                updateNode();
            }


            if (e.keyCode == 27) {
                resetEditor();
                e.preventDefault();
            }
        });

}

var dims = getDims();
var chart = MindMap()
    .width(dims.width)
    .height(dims.height - 10)
    .text(function (d) {
        return d.name || d.text;
    })
    .click(function (d) {
        console.log(d._id);
        select(this);
        if (!this.position && directionToggler.canToggle) {
            switch (directionToggler.currentDir) {
                case "left" :
                    directionToggler.currentDir = "right";
                    break;
                case "right":
                    directionToggler.currentDir = "left";
                    break;
            }
            directionToggler.canToggle = false;
        }
    })
    .dblClick(showEditor);

var update = function (data) {
    window.data = data;
    d3.select('#mindmap svg')
        .datum(data)
        .call(chart);
};
var getDirection = function (data) {
    if (!data) {
        return 'root';
    }
    if (data.position) {
        return data.position;
    }
    return getDirection(data.parent);
};

Mousetrap.bind('enter', function () {
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        var name = prompt('New name');
        if (name) {
            if (dir === 'root') {
                directionToggler.canToggle = true;
                dir = directionToggler.currentDir;
            }
            var cl = data[dir] || data.children || data._children;
            if (!cl) {
                cl = data.children = [];
            }
            var newNode = {
                name: name, position: dir,
                parent_ids: [].concat(data.parent_ids || []).concat([data._id])
            };
            newNode._id = mindMapService.addNode(newNode);

            cl.push(newNode);
            chart.update();
        }
    }
});

Mousetrap.bind('del', function () {
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        if (dir === 'root') {
            alert('Can\'t delete root');
            return;
        }
        var cl = data.parent[dir] || data.parent.children;
        if (!cl) {
            alert('Could not locate children');
            return;
        }
        var i = 0, l = cl.length;
        for (; i < l; i++) {
            if (cl[i]._id === data._id) {
                if (confirm('Sure you want to delete ' + data.name + '?') === true) {
                    cl.splice(i, 1);
                }
                break;
            }
        }
        Meteor.call('deleteNode', data._id);

        chart.update();
        var rootNode = d3.selectAll('.node')[0].find(function (node) {
            return node.__data__._id == data.parent._id;
        });
        // Find previously selected, unselect
        d3.select(".selected").classed("selected", false);
        // Select current item
        d3.select(rootNode).classed("selected", true);

    }
});

Mousetrap.bind('up', function () {
    // up key pressed
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        switch (dir) {
            case('root'):
                break;
            case('left'):
            case('right'):
                var p = data.parent, nl = p.children || [], i = 1;
                if (p[dir]) {
                    nl = p[dir];
                }
                l = nl.length;
                for (; i < l; i++) {
                    if (nl[i]._id === data._id) {
                        selectNode(nl[i - 1]);
                        break;
                    }
                }
                break;
        }
    }
    return false;
});


Mousetrap.bind('down', function () {
    // down key pressed
    // up key pressed
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        switch (dir) {
            case('root'):
                break;
            case('left'):
            case('right'):
                var p = data.parent, nl = p.children || [], i = 0;
                if (p[dir]) {
                    nl = p[dir];
                }
                l = nl.length;
                for (; i < l - 1; i++) {
                    if (nl[i]._id === data._id) {
                        selectNode(nl[i + 1]);
                        break;
                    }
                }
                break;
        }
    }
    return false;
});

Mousetrap.bind('left', function () {
    // left key pressed
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        switch (dir) {
            case('right'):
            case('root'):
                selectNode(data.parent || data.left[0]);
                break;
            case('left'):
                selectNode((data.children || [])[0]);
                break;
            default:
                break;
        }
    }
});

Mousetrap.bind('right', function () {
    // right key pressed
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        switch (dir) {
            case('left'):
            case('root'):
                selectNode(data.parent || data.right[0]);
                break;
            case('right'):
                selectNode((data.children || [])[0]);
                break;
            default:
                break;
        }
    }
});