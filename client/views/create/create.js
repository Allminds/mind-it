var mindMapService = new MindMapService();
var directionToggler = {
    currentDir: "right",
    canToggle: false
};

var tracker = {
    added: function (id, fields) {
        var newNode = map.getNodeData(id);
        if (newNode)
            return;

        newNode = fields;
        newNode._id = id;
        var parent = map.getNodeData(newNode.parent_ids[newNode.parent_ids.length - 1]);
        if (parent)
            parent = parent.__data__;
        map.addNodeToUI(parent, newNode);
    },
    changed: function (id, fields) {
        var updatedNode = map.getNodeData(id);
        if (!updatedNode) return;

        var nodeBeingEdited = map.getEditingNode();

        if (nodeBeingEdited && nodeBeingEdited._id === id)
            return;

        updatedNode = updatedNode.__data__;
        updatedNode.name = fields.name;
        chart.update();
        var selectedNode = map.selectedNodeData();
        // redraw gray box
        if (selectedNode && selectedNode._id === id) {
            setTimeout(function () {
                selectNode(selectedNode);
            }, 10);
        }
    },
    just_deleted: null,
    removed: function (id) {
        var deletedNode = map.getNodeData(id);
        if (!deletedNode) return;

        deletedNode = deletedNode.__data__;

        var alreadyRemoved = deletedNode.parent_ids.some(function (parent_id) {
            return tracker.just_deleted == parent_id;
        });
        if (alreadyRemoved) return;

        var children = deletedNode.parent[deletedNode.position] || deletedNode.parent.children;

        var delNodeIndex = children.indexOf(deletedNode);
        if (delNodeIndex >= 0) {
            children.splice(delNodeIndex, 1);
            chart.update();
            selectNode(deletedNode.parent);
            tracker.just_deleted = id;
        }
    }
};

Template.create.rendered = function rendered() {

    var tree = mindMapService.buildTree(this.data.id, this.data.data);
    update(tree);
    var rootNode = d3.selectAll('.node')[0].find(function (node) {
        return !node.__data__.position;
    });

    select(rootNode);
    Mindmaps.find().observeChanges(tracker);
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

    if (!node.__data__.position && directionToggler.canToggle) {
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
    // Select current item
    d3.select(node).classed("selected", true);


    if (d3.select(node).selectAll("ellipse")[0].length == 2)
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
            return true;
        }
    }
    return false;
};

var showEditor = function () {
    var self = this,
        nodeData = this.__data__;

    var parentElement = d3.select(this.children[0].parentNode),
        currentElement = parentElement.select('text');

    var position = currentElement.node().getBBox();


    var inp = parentElement.append("foreignObject")
        .attr("x", position.x - 25)
        .attr("y", position.y - 10)
        .append("xhtml:form")
        .append("input");

    function resetEditor() {
        currentElement.attr("visibility", "");
        d3.select("foreignObject").remove();
    }

    updateNode = function () {
        nodeData.name = inp.node().value;
        mindMapService.updateNode(nodeData._id, {name: nodeData.name});
        resetEditor();
        chart.update();
        setTimeout(function () {
            selectNode(nodeData);
        }, 10);
    };

    currentElement.attr("visibility", "hidden");
    var escaped = false;
    inp.attr("value", function () {
        return nodeData.name;
    }).attr('', function () {
        this.value = this.value;
        this.focus();
        this.select();
    }).attr("style", "height:25px;")
        .style("width", "auto")
        .on("blur", function () {
            if (escaped) return;
            updateNode();
            escaped = false;
        })
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
                escaped = true;
                resetEditor();
                e.preventDefault();
            }
        });

}

var dims = getDims();
var chart = MindMap()
    .width(800)
    .height(dims.height - 10)
    .text(function (d) {
        return d.name || d.text;
    })
    .click(function (d) {
        select(this);
    })
    .dblClick(showEditor);

var update = function (data) {
    window.data = data;
    d3.select('#mindmap svg')
        .datum(data)
        .call(chart);
    chart.update();
    var $mindMap = $('#mindmap'),
        scrollWidth = $mindMap.scrollLeft(Number.MAX_VALUE).scrollLeft(),
        scrollHeight = $mindMap.scrollTop(Number.MAX_VALUE).scrollTop();
    $mindMap.scrollLeft(scrollWidth / 2);
    $mindMap.scrollTop(scrollHeight / 2);

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

var map = {};
map.selectedNodeData = function () {
    var selecedNode = d3.select(".node.selected")[0][0];
    return selecedNode ? selecedNode.__data__ : null;
};
map.addNodeToUI = function (parent, newNode) {
    var children = parent[newNode.position] || parent.children || parent._children;
    if (!children) {
        children = parent.children = [];
    }
    children.push(newNode);
    chart.update();
}
map.addNewNode = function (parent, newNodeName) {

    var dir = getDirection(parent);

    if (dir === 'root') {
        directionToggler.canToggle = true;
        dir = directionToggler.currentDir;
    }
    var newNode = {
        name: "", position: dir,
        parent_ids: [].concat(parent.parent_ids || []).concat([parent._id])
    };
    newNode._id = mindMapService.addNode(newNode);
    // let the subscribers to update their mind map :)
    return newNode;
}
map.makeEditable = function (nodeId) {
    var node = map.getNodeData(nodeId);
    if (node)
        showEditor.call(node);
};
map.getNodeData = function (nodeId) {
    return d3.selectAll('#mindmap svg .node').filter(function (d) {
        return d._id == nodeId
    })[0][0];
};
map.getEditingNode = function () {
    var editingNode = d3.select(".node foreignobject")[0][0];
    return editingNode ? editingNode.__data__ : null;
};
Mousetrap.bind('enter', function () {
    var selectedNode = map.selectedNodeData();
    if (!selectedNode) return false;
    var parent = selectedNode.parent || selectedNode,
        newNode = map.addNewNode(parent, 'default');

    map.makeEditable(newNode._id);
    return false;
});
Mousetrap.bind('tab', function () {
    var selectedNode = map.selectedNodeData();
    if (!selectedNode) return false;
    var newNode = map.addNewNode(selectedNode, 'default');
    map.makeEditable(newNode._id);
    return false;
});

Mousetrap.bind('del', function () {
    var selectedNode = map.selectedNodeData();
    if (!selectedNode) return;
    var dir = getDirection(selectedNode);


    if (dir === 'root') {
        alert('Can\'t delete root');
        return;
    }
    var children = selectedNode.parent[dir] || selectedNode.parent.children;
    if (!children) {
        alert('Could not locate children');
        return;
    }
    Meteor.call('deleteNode', selectedNode._id);
    selectNode(selectedNode.parent);
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




function collapse(d) {
    if (d.hasOwnProperty('children') && d.children) {
            d._children = [];
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
}


function expand(d) {
        if (d.hasOwnProperty('_children') && d._children) {
              d.children = d._children;
              expand(d.children);
              d._children = null;
        }
}


Mousetrap.bind('shift', function (){
        var selected = d3.select(".selected")[0][0].__data__;
        var dir = getDirection(selected);
        if(dir !== 'root'){
                if (selected.hasOwnProperty('_children') && selected._children){
                expand(selected);
        }
        else {
                collapse(selected);
        }
                chart.update();
        }
});