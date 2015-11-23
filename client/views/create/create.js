var mindMapService = new MindMapService();
var directionToggler = {
    currentDir: "right",
    canToggle: false,

    changeDirection: function () {
        switch (directionToggler.currentDir) {
            case "left" :
                directionToggler.currentDir = "right";
                break;
            case "right":
                directionToggler.currentDir = "left";
                break;
        }
    }
};

var nodeSelector = {
    prevDepthVisited : 0,

    setPrevDepth : function(depth){
        nodeSelector.prevDepthVisited = depth;
    }
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
        nodeSelector.setPrevDepth(newNode.parent_ids.length);
        console.log(nodeSelector.prevDepthVisited);
    },
    changed: function (id, fields) {
        var updatedNode = map.getNodeData(id);
        if (!updatedNode) return;

        var nodeBeingEdited = map.getEditingNode();

        if (nodeBeingEdited && nodeBeingEdited._id === id)
            return;

        updatedNode = updatedNode.__data__;
        updatedNode.previous = fields.previous ? fields.previous : updatedNode.previous;
        updatedNode.next = fields.next ? fields.next : updatedNode.next;

        if (fields.name) {
            updatedNode.name = fields.name;
            chart.update();
            var selectedNode = map.selectedNodeData();
            // redraw gray box
            if (selectedNode && selectedNode._id === id) {
                setTimeout(function () {
                    selectNode(selectedNode);
                }, 10);
            }
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

    var rootNodeObject = rootNode.__data__;
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

        directionToggler.changeDirection();
        directionToggler.canToggle = false;
    }
    // Select current item
    d3.select(node).classed("selected", true);


    if (d3.select(node).selectAll("ellipse")[0].length == 2)
        return;

    var text = d3.select(node).select("text")[0][0],
        bBox = text.getBBox(),
        rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    var dim = {
        x: bBox.x,
        y: bBox.y == 0 ? -19 : bBox.y,
        width: bBox.width == 0 ? 20 : bBox.width,
        height: bBox.height == 0 ? 20 : bBox.height
    };
    rect.setAttribute("x", dim.x);
    rect.setAttribute("y", dim.y);
    rect.setAttribute("width", dim.width);
    rect.setAttribute("height", dim.height);
    node.insertBefore(rect, text);
    node.__data__ = text.__data__;
    d3.select(text).on('dblClick', showEditor);
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
    var nodeData = this.__data__;

    var parentElement = d3.select(this.children[0].parentNode),
        currentElement = parentElement.select('text');

    var position = currentElement.node().getBBox(),
        inputWidth = position.width > 50 ? position.width : 50;
    if (nodeData.name && nodeData.name.length >= 50) {
        var updatedName = prompt('Name', nodeData.name);
        if (updatedName != nodeData.name) {
            nodeData.name = updatedName;
            mindMapService.updateNode(nodeData._id, {name: nodeData.name});
            chart.update();
            setTimeout(function () {
                chart.update();
                selectNode(nodeData);
            }, 10);
        }
        return;
    }

    var inp = parentElement.append("foreignObject")
        .attr("x", position.x - (nodeData.name.length == 0 ? 11 : 0))
        .attr("y", position.y - (nodeData.name.length == 0 ? 18 : 0))
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
            chart.update();
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
    }).attr("style", "height:25px;width:" + inputWidth + 'px')
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
        return d.name;
    })
    .click(function (d) {
        nodeSelector.setPrevDepth(this.__data__.depth);
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
    var selectedNode = d3.select(".node.selected")[0][0];
    return selectedNode ? selectedNode.__data__ : null;
};
map.addNodeToUI = function (parent, newNode) {
    var children = parent[newNode.position] || parent.children || parent._children;
    if (!children) {
        children = parent.children = [];
    }
    if (newNode.previous) {
        var previousNode = children.find(function (x) {
                return x._id == newNode.previous
            }),
            previousNodeIndex = children.indexOf(previousNode) + 1;
        children.splice(previousNodeIndex, 0, newNode);
    } else
        children.push(newNode);
    chart.update();
}

function calculateDirection(parent) {

    var dir = getDirection(parent);
    var selectedNode = map.selectedNodeData();

    if (dir === 'root') {
        if (getDirection(selectedNode) === 'root') {
            directionToggler.canToggle = true;
            dir = directionToggler.currentDir;
        }
        else
            dir = selectedNode.position;
    }

    return dir;
}

map.addNewNode = function (parent, newNodeName, dir, previousSibling) {

    if (!previousSibling) {
        previousSibling = parent.children && parent.children.length > 0 ?
            parent.children[parent.children.length - 1]
            : {_id: null, next: null}
    }
    var newNode = {
        name: newNodeName, position: dir,
        parent_ids: [].concat(parent.parent_ids || []).concat([parent._id]),
        previous: previousSibling._id, next: previousSibling.next,
    };
    newNode._id = mindMapService.addNode(newNode);

    if (previousSibling._id) {
        mindMapService.updateNode(previousSibling._id, {next: newNode._id});
        mindMapService.updateNode(newNode.next, {previous: newNode._id});
    }

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

map.storeSourceNode = function (sourceNode) {
    map.sourceNode = sourceNode;
};

map.getSourceNode = function () {
    return d3.select(".selected")[0][0].__data__;
};

Mousetrap.bind('command+x', function () {
    cut();
});

function cut() {
    sourceNode = map.getSourceNode();
    if (getDirection(sourceNode) === 'root') {
        alert("The root node cannot be cut!");
        return;
    }
    map.storeSourceNode(sourceNode);
    Meteor.call('deleteNode', sourceNode._id);
}

Mousetrap.bind('command+c', function () {
    sourceNode = map.getSourceNode();
    map.storeSourceNode(sourceNode);
});

Mousetrap.bind('command+v', function () {
    targetNode = map.selectedNodeData();
    sourceNode = map.sourceNode;
    var dir = calculateDirection(targetNode);
    paste(sourceNode, targetNode, dir);

});

function paste(sourceNode, targetNode, dir) {
    var newNode = map.addNewNode(targetNode, sourceNode.name, dir)
        , childrenArray;
    if (sourceNode.hasOwnProperty('children') && sourceNode.children)
        childrenArray = sourceNode.children;
    else if (sourceNode.hasOwnProperty('_children') && sourceNode._children)
        childrenArray = sourceNode._children;

    if (childrenArray) {
        childrenArray.forEach(
            function (d) {
                paste(d, newNode, dir);
            }
        );

    }
}


Mousetrap.bind('enter', function () {
    var selectedNode = map.selectedNodeData();
    if (!selectedNode) return false;
    var parent = selectedNode.parent || selectedNode,
        sibling = selectedNode.position ? selectedNode : null,
        dir = calculateDirection(parent),
        newNode = map.addNewNode(parent, "", dir, sibling);
    map.makeEditable(newNode._id);
    return false;
});
Mousetrap.bind('tab', function () {
    var selectedNode = map.selectedNodeData();
    if (!selectedNode) return false;
    if (selectedNode.hasOwnProperty('isCollapsed') && selectedNode.isCollapsed) {
        expand(selectedNode, selectedNode._id);
        chart.update();
    }
    var dir = calculateDirection(selectedNode);
    var newNode = map.addNewNode(selectedNode, "", dir);
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

function findLogicalUp(node){
     var dir = getDirection(node);
     if(dir === 'root') return;

     var p = node.parent, nl = p.children || [], i = 1;
     if (p[dir]) {
         nl = p[dir];
     }
     l = nl.length;
     for (; i < l; i++) {
         if (nl[i]._id === node._id) {
             selectNode(nl[i - 1]);
             break;
         }
     }
}

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
                findLogicalUp(data);
                break;
        }
    }
    return false;
});

function findSameLevelChild(node,depth) {
    if(!node.children)
        return node;
    if (node.depth == depth)
    {
        return node;
    }
    while(node.children)
    {
        node = node.children[0];
        if(node.depth == depth)
        {
            return node;
        }
    }
    return node;
}

function findLogicalDown(node,depth){
     var dir = getDirection(node);
          if(dir === 'root') return;
     var p = node.parent, nl = p.children || [], i = 0;
     if (p[dir]) {
         nl = p[dir];
     }
     l = nl.length;
     for (; i < l - 1; i++) {
         if (nl[i]._id === node._id) {
             selectNode(findSameLevelChild(nl[i + 1],nodeSelector.prevDepthVisited));
             //selectNode(nl[i + 1]);
             return;
         }
     }
     if(i == l-1) findLogicalDown(p,depth);
}

Mousetrap.bind('down', function () {
    // down key pressed
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data);
        switch (dir) {
            case('root'):
                break;
            case('left'):
            case('right'):
                  findLogicalDown(data,data.depth);
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
                if (data.hasOwnProperty('isCollapsed') && data.isCollapsed) {
                    expand(data, data._id);
                    chart.update();
                }
                else
                {
                    var node = (data.children || [])[0];
                    selectNode(node);
                    if(node)
                        nodeSelector.setPrevDepth(node.depth);

                }
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
                nodeSelector.setPrevDepth(data.depth);
                console.log(nodeSelector.prevDepthVisited);
                if (data.hasOwnProperty('isCollapsed') && data.isCollapsed) {
                    expand(data, data._id);
                    chart.update();
                }
                else
                {
                 var node = (data.children || [])[0];
                 selectNode(node);
                 if(node)
                     nodeSelector.setPrevDepth(node.depth);
                }
                break;
            default:
                break;
        }
    }
});


function collapse(d, id) {
    if (d._id === id) {
        d.isCollapsed = true;
    }
    if (d.hasOwnProperty('children') && d.children) {
        d._children = [];
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}


function expand(d, id) {
    if (d._id === id) {
        d.isCollapsed = false;
    }
    if (d.hasOwnProperty('_children') && d._children && !d.isCollapsed) {
        d.children = d._children;
        d._children.forEach(expand);
        d._children = null;
    }
}

window.toggleCollapsedNode = function (selected) {
    var dir = getDirection(selected);
    if (dir !== 'root') {
        if (selected.hasOwnProperty('_children') && selected._children) {
            expand(selected, selected._id);
        }
        else {
            collapse(selected, selected._id);
        }
        chart.update();
    }
}
Mousetrap.bind('space', function () {
    event.preventDefault();
    var selected = d3.select(".selected")[0][0].__data__;
    toggleCollapsedNode(selected);
});


Mousetrap.bind('command+e', function createXmlFile() {
    var rootNode = d3.selectAll('.node')[0].find(function (node) {
        return !node.__data__.position;
    });
    var rootNodeObject = rootNode.__data__;
    var XMLString = [];
    XMLString = "<map version=\"1.0.1\">\n";

    XMLString = JSONtoXML(XMLString, rootNodeObject);
    XMLString += "</map>";

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {

        fs.root.getFile('testmap1.mm', {create: true}, function (fileEntry) {

            fileEntry.createWriter(function (fileWriter) {
                fileWriter.truncate(0);
            }, function () {
            });

            fileEntry.createWriter(function (fileWriter) {
                var blob = new Blob([XMLString]);
                fileWriter.write(blob);
                fileWriter.addEventListener("writeend", function () {
                    location.href = fileEntry.toURL();
                }, false);
            }, function () {
            });
        }, function () {
        });
    }, function () {
    });

});

Mousetrap.bind('command+left', function () {
    // left key pressed
    event.preventDefault();
    var selection = d3.select(".node.selected")[0][0],
        rootNode = d3.selectAll('.node')[0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data),
            parent = data.parent;
        switch (dir) {
            case('right'):
                cut();
                if (getDirection(parent) === 'root') {
                    paste(data, parent, "left");
                }
                else {
                    paste(data, parent.parent, "right");
                }
                break;
            case('root'):
                alert("Root cannot be added to a new parent");
                break;
            case('left'):
                var nl = parent.children || [], i = 0;
                if (parent[dir]) {
                    nl = parent[dir];
                }
                l = nl.length;
                for (; i < l; i++) {
                    if (nl[i]._id === data._id && l != 1) {
                        cut();
                        if (i === 0)
                            paste(data, nl[(i + 1)], "left");
                        else
                            paste(data, nl[(i - 1)], "left");
                        break;
                    }
                    7
                }
                break;
            default:
                break;
        }
    }
});

Mousetrap.bind('command+right', function () {
    // left key pressed
    event.preventDefault();
    var selection = d3.select(".node.selected")[0][0],
        rootNode = d3.selectAll('.node')[0];
    if (selection) {
        var data = selection.__data__;
        var dir = getDirection(data),
            parent = data.parent;
        switch (dir) {
            case('left'):
                cut();
                if (getDirection(parent) === 'root') {
                    paste(data, parent, "right");
                }
                else {
                    paste(data, parent.parent, "left");
                }
                break;
            case('root'):
                alert("Root cannot be added to a new parent");
                break;
            case('right'):
                var nl = parent.children || [], i = 0;
                if (parent[dir]) {
                    nl = parent[dir];
                }
                l = nl.length;
                for (; i < l; i++) {
                    if (nl[i]._id === data._id && l != 1) {
                        cut();
                        if (i === 0)
                            paste(data, nl[(i + 1)], "right");
                        else
                            paste(data, nl[(i - 1)], "right");
                        break;
                    }
                    7
                }
                break;
            default:
                break;
        }
    }
});

function JSONtoXML(XMLString, nodeObject) {
    XMLString += "<node ";
    XMLString += "ID = \"" + nodeObject._id + "\"";
    XMLString += "TEXT = \"" + nodeObject.name + "\"";

    if (nodeObject.hasOwnProperty('parent_ids') && nodeObject.parent_ids.length === 1) {
        XMLString += "POSITION = \"" + nodeObject.position + "\"";
    }

    XMLString += ">\n";

    if (nodeObject.hasOwnProperty('children') && nodeObject.children !== null) {
        for (var i = 0; i < nodeObject.children.length; i++) {
            XMLString = JSONtoXML(XMLString, nodeObject.children[i]);
        }
    }
    if (nodeObject.hasOwnProperty('_children') && nodeObject._children !== null) {
        for (var i = 0; i < nodeObject._children.length; i++) {
            XMLString = JSONtoXML(XMLString, nodeObject._children[i]);
        }
    }
    XMLString += "</node>\n";
    return XMLString;
}
