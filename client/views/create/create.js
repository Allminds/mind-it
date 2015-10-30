
var mindMapService = new MindMapService();
Template.create.rendered = function rendered() {
    var treeData = this.data;
    rootNodeData = mindMapService.buildTree(treeData.id,treeData.data);


    update(rootNodeData);
    var rootNode = d3.select('.node')[0].find(function (node) {
        return !node.__data__.position;
    });

    // Find previously selected, unselect
    d3.select(".selected").classed("selected", false);
    // Select current item
    d3.select(rootNode).classed("selected", true);
};

var getDims;
getDims = function () {
    var w = window, d = document, e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return {width: x, height: y};
};

var showEditor = function () {

    var self = this,
        nodeData = this.__data__;
    var parentBox = this.parentNode.getBBox(),
        position = {x: parentBox.x, y: parentBox.y},
        parentElement = d3.select(this.parentNode),
        currentElement = parentElement.select('text'),
        inp = parentElement.append("foreignObject")
            .attr("x", function (d) {
                if (d.name.length == 0) return parentBox.width / 2; else return position.x;
            })
            .attr("y", position.y)
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
        // Find previously selected, unselect
        d3.select(".selected").classed("selected", false);
        // Select current item
        d3.select(this).classed("selected", true);
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
                dir = data.right.length > data.left.length ? 'left' : 'right';
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
        var cl = data.parent[dir] || data.parent.children ;
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




