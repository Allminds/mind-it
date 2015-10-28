var mindMapService = new MindMapService();
var left;
var right;
drawTree = null;
currentDir = "right";
count = 0;
startup = true;
index = 0;

var m = [20, 120, 20, 120],
    w = 500 - m[1] - m[3],
    h = 1000 - m[0] - m[2]
    ;


var treeLeft, treeRight;

var state = {
    requestUpdate: false, editingNode: null, textToBeEdited: null,

    restoreState: function (nodeTexts, rootNodeData) {

        if (!state.editingNode) return;
        var textToBeEdited = nodeTexts[0].find(function (text) {
         console.log("in restore update");
            console.log(state.editingNode);

            return d3.select(text).data()[0].id == state.editingNode.id;
        });
        if (textToBeEdited) {
            var data = d3.select(textToBeEdited).data()[0];
            data.name = state.textToBeEdited;
            showEditor.call(textToBeEdited, data, 'name', rootNodeData, state.editingNode.id);
        }
    }
};

getWidth = function (d) {
    var width = 80;
    if (d && d.name && typeof d.name == 'string')
        width = d.name.length * 4.5;
    return width;
};


update = function (source, treeLeft, treeRight) {
    var levelWidth = [1];
    var childCount = function (level, n) {
        if (n.children && n.children.length > 0) {
            if (levelWidth.length <= level + 1) levelWidth.push(0);
            levelWidth[level + 1] += n.children.length;
            n.children.forEach(function (d) {
                childCount(level + 1, d);
            });
        }
    };
    childCount(0, rootNodeData);
    var newHeight = d3.max(levelWidth) * 20; // 20 pixels per line
    treeRight.size([newHeight, w]);
    treeLeft.size([newHeight, w]);
};

splitTrees = function () {
    for (var i = 0; i < rootNodeData.children.length; i++) {
        if (rootNodeData.children[i].direction === "left")
            left.children.push(rootNodeData.children[i]);
        else
            right.children.push(rootNodeData.children[i]);
    }
};

drawTree = function (arrayOfNodes, rootNodeData, treeNodes, vis, direction) {
    var nodes = treeNodes.nodes(arrayOfNodes),
        links = treeNodes.links(nodes),
        diagonal = d3.svg.diagonal().projection(function (d) {
            switch (direction) {
                case "right":
                    return [d.y, d.x];
                case "left" :
                    return [-d.y, d.x];
            }
        });
    vis.selectAll(".links")
        .data(links)
        .enter().append("svg:path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#ADADAD")
        .attr("d", diagonal);
    var node = vis.selectAll("g.node")
        .data(nodes)
        .enter().append("svg:g")
        .attr('class', 'treeNode')
        .attr("transform", function (d) {
            switch (direction) {
                case "right":
                    return "translate(" + d.y + "," + d.x + ")";
                case "left" :
                    return "translate(" + -d.y + "," + d.x + ")";
            }
        });



    if (direction === "left") {
        var rootNode = d3.select(node[0][0]);
        rootNode.append("svg:ellipse")
            .attr("cx", 0).attr("cy", 3)
            .attr("rx", function (d) {
                return getWidth(d) + 'px';
            })
            .attr('ry', 20)
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("fill-opacity", "1")
            .call(make_editable, "name", rootNodeData);
        rootNode.append("svg:text")
            .attr("x", 0).attr("y", 3)
            .attr("dx", "0em")
            .attr("dy", "0.5em")
            .text(function (d) {
                return d.name;
            })
            .attr("text-anchor", "middle")
            .call(make_editable, "name", rootNodeData);
        node[0] = node[0].slice(1);
    }


    node.append("svg:text")
        .attr("x", 0).attr("y", 3)
        .attr("dx", "0em")
        .attr("dy", "0.5em")
        .text(function (d) {
            return d.name;
        })
        .attr("text-anchor", "middle")
        .call(make_editable, "name", rootNodeData);

};


Template.create.rendered = function rendered() {
    rootNodeData = this.data;
    index = rootNodeData.children.length;
    left = {name: rootNodeData.name, children: [], direction: null};
    right = {name: "", children: [], direction: null};

    splitTrees();


    var mapId = this.data._id,
        vis = d3.select("#mindmap").append("svg:svg")
            .attr("id", "mindmap-svg")
            .attr("width", window.innerWidth)
            .attr("height", 1500)
            .append("svg:g")
            .attr("transform", "translate(" + window.innerWidth / 2 + ", 0)")
            .attr("class", "map-group");

    treeLeft = d3.layout.tree().size([h, w]);
    treeRight = d3.layout.tree().size([h, w]);

    drawTreeRight = function (update) {
        left = {name: rootNodeData.name, children: [], direction: null};
        right = {name: "", children: [], direction: null};
        if (update) {
            rootNodeData = Mindmaps.findOne(mapId);
            splitTrees();
        }
        vis.selectAll("*").remove();
        drawTree(right, rootNodeData, treeRight, vis, "right");

        $(window).on("resize", function () {
            $("#mindmap-svg")
                .attr("width", window.innerWidth);
            $("#mindmap-svg .map-group")
                .attr("transform", "translate(" + window.innerWidth / 2 + ", 0)");

        });

    };

    drawTreeLeft = function (update) {
        left = {name: rootNodeData.name, children: [], direction: null};
        right = {name: "", children: [], direction: null};
        if (update) {
            rootNodeData = Mindmaps.findOne(mapId);
            splitTrees();
        }

        drawTree(left, rootNodeData, treeLeft, vis, "left");
    };

    update(rootNodeData, treeLeft, treeRight);
    drawTreeRight(true);
    drawTreeLeft(true);

    Mindmaps.find().observe({

        changed: function () {
            state.requestUpdate = true;
            update(rootNodeData, treeLeft, treeRight);

            drawTreeRight(true);
            drawTreeLeft(true);
            state.restoreState(d3.selectAll('text'), rootNodeData);
            state.requestUpdate = false;
        }

    });
};

function showEditor(nodeData, field, rootNodeData, id) {
    var parentBox = this.parentNode.getBBox(),
        position = {x: parentBox.x, y: parentBox.y},
        parentElement = d3.select(this.parentNode),
        currentElement = parentElement.select('text'),
        inp = parentElement.append("foreignObject")
            .attr("x",
            function (d) {
                if (d.name.length == 0) return parentBox.width / 2; else return position.x;
            })
            .attr("y", position.y)
            .append("xhtml:form").append("input");
    state.editingNode = nodeData;
    state.textToBeEdited = nodeData[field];


    function resetEditor() {
        currentElement.attr("visibility", "");
        state.editingNode = null;
        state.textToBeEdited = null;
        d3.select("foreignObject").remove();
    }

    updateNode = function () {
        if (state.requestUpdate || !state.editingNode)
            return;

        nodeData[field] = inp.node().value;

        resetEditor();
        rootNodeData.children[id - 1]= nodeData;
        rootNodeData.name = left.name;
        mindMapService.updateNode(rootNodeData);
        update(rootNodeData, treeLeft, treeRight);

    };

    currentElement.attr("visibility", "hidden");

    inp.attr("value", function () {
        return nodeData[field];
    }).attr('', function () {
        this.value = this.value;
        this.focus();
        this.select();
    })
        .attr("style", "height:30px;")
        .style("width", "auto")
        .on("blur", updateNode)
        .on("keydown", function () {
            // IE fix
            if (!d3.event)
                d3.event = window.event;

            var e = d3.event;
            if (e.keyCode == 13) {              //enter key
                if (typeof (e.cancelBubble) !== 'undefined') // IE
                    e.cancelBubble = true;
                if (e.stopPropagation)
                    e.stopPropagation();
                e.preventDefault();
                updateNode();
            }


            if (e.keyCode == 27) {              //escape key
                resetEditor();
                e.preventDefault();
            }
        })
        .on("keyup", function () {
            state.textToBeEdited = inp.node().value;

        });
}
toggle = false;

function make_editable(d, field, rootNodeData) {
    this.on("mouseover", function () {
        d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
    }).on("mouseout", function () {
        d3.select(this.parentNode).select('ellipse').style("fill", null);
    }).on("click", function () {
        d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
        if (toggle === true) {
            switch (currentDir) {
                case "left":
                    currentDir = "right";
                    break;
                case "right":
                    currentDir = "left";
                    break;
            }
            toggle = false
        }
    }).on("dblclick", function (d) {
        showEditor.call(this, d, field, rootNodeData);
    });
}

document.addEventListener('keypress', function (e) {
    if (e.keyCode == '13') {
        mindMapService.addChild(rootNodeData, currentDir,++index);
        toggle = true;
        update(rootNodeData, treeLeft, treeRight);
        count++;

        state.editingNode = d3.select(d3.selectAll('.treeNode').filter(function(d){ return d.id === index;}))[0][0].data()[0];
        state.textToBeEdited = state.editingNode.name;
        state.requestUpdate = true;
        state.restoreState(d3.selectAll('text'), rootNodeData);
        state.requestUpdate = false;
    }
}, false);

