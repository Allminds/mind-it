App.CopyParser = {};

App.CopyParser.errorMessage = "";

App.CopyParser.populateBulletedFromObject = function (nodeData, depthOfNode) {
    var returnString = "";

    if (!nodeData) {
        return returnString;
    }

    var depth = depthOfNode ? depthOfNode : 0;
    for (var depthCounter = 1; depthCounter <= depth; depthCounter++) {
        returnString += "\t";
    }

    returnString += getNodeName(nodeData);

    var temp = getSubNodeNames(App.Node.immediateSubNodes(nodeData), depth + 1);

    return returnString + temp;
};

App.CopyParser.getFormattedText = function (node) {
    var formattedText = '';

    if (!Boolean(node)) {
        return formattedText;
    }

    return node.attr('classed');
};

var getNodeName = function (node) {
    var nodeName = node.name.length === 0 ? "§" : node.name;
    return nodeName.replace(/(\r\n|\n|\r)/gm, "‡");
};

var getSubNodeNames = function (nodes, depth) {
    return nodes.reduce(function (previous, next) {
        return previous + '\n' + App.CopyParser.populateBulletedFromObject(next, depth);
    }, "");
};

var populateObjectFromBulletedList = function (bulletedList, parentNode, expectedDepth) {
    var newNode = null;
    var dir = "childSubTree";
    var expectedDepthStore = expectedDepth;

    if (App.Node.isRoot(parentNode)) {
        dir = App.DirectionToggler.getInstance().getCurrentDirection();
    }

    var childNodeList = [];
    var childNodeSubTree = [];
    var childBulletList = [];
    var headerNodeOfBulletedList = null;
    var siblingIdList = parentNode[dir].map(function (_) {
        return _._id ? _._id : _;
    });

    for (var bulletListCounter = 0; bulletListCounter < bulletedList.length;) {
        var depth = bulletedList[bulletListCounter].split('\t').length - 1;

        if (depth <= expectedDepth || bulletListCounter === 0) {
            if (bulletListCounter === 0) {
                expectedDepth = depth;
            }

            var nodeName = bulletedList[bulletListCounter].split('\t')[depth];

            if (nodeName.length > 0) {
                nodeName = nodeName === "§" ? "" : nodeName;
                nodeName = nodeName.replace(/‡/gm, "\n");
                newNode = new App.Node(nodeName, dir, parentNode, bulletListCounter);

                if (bulletListCounter === 0) {
                    headerNodeOfBulletedList = newNode;
                }

                newNode = App.Node.addToDatabase(newNode);
                siblingIdList.push(newNode._id);
            }

            bulletListCounter++;
        } else {
            childBulletList = [];
            var j = bulletListCounter;
            var childDepth = bulletedList[j].split('\t').length - 1;

            while (childDepth > expectedDepthStore) {
                childBulletList.push(bulletedList[j]);
                j++;

                if (j >= bulletedList.length) {
                    break;
                }

                childDepth = bulletedList[j].split('\t').length - 1;
            }

            j === bulletListCounter ? bulletListCounter++ : bulletListCounter = j;
        }

        if (childBulletList.length > 0) {
            childNodeList[newNode._id] = childBulletList;
            childNodeSubTree[newNode._id] = newNode;
            childBulletList = [];
        }
    }

    App.Node.updateChildTree(parentNode, dir, siblingIdList);

    Object.keys(childNodeList).forEach(function (childNodeId) {
        childBulletList = childNodeList[childNodeId];
        var newParent = childNodeSubTree[childNodeId];

        if (childBulletList && childBulletList.length > 0)
            populateObjectFromBulletedList(childBulletList, newParent, expectedDepthStore + 1);
    });

    return headerNodeOfBulletedList;
};

App.CopyParser.populateObjectFromBulletedList = function (bulletedString, parentNode) {
    if (bulletedString.length > 0) {
        var headerNodeOfBulletedList = populateObjectFromBulletedList(bulletedString.split(/\n\r|\n/), parentNode, 0);
        headerNodeOfBulletedList.parent = parentNode;

        return headerNodeOfBulletedList;
    }
};

App.CopyParser.CopyNodesToClipboard = function (nodes) {
    var plainTextValue = App.CopyParser.PlainText(nodes);
    var htmlValue = App.CopyParser.Html(nodes);

    clipboard.copy({
        "text/plain": plainTextValue,
        "text/html": htmlValue
    });
};

App.CopyParser.PlainText = function (nodes) {
    var plainTextValue = '';

    if (!Boolean(nodes)) {
        return plainTextValue;
    }

    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }

    nodes.forEach(function (node) {
        var nodeData = node.__data__;

        plainTextValue += App.CopyParser.populateBulletedFromObject(nodeData) + '\n';
    });

    return plainTextValue.trim();
};

App.CopyParser.Html = function (nodes) {
    var htmlOutput = '';

    if (!Boolean(nodes)) {
        return htmlOutput;
    }

    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }

    htmlOutput += html(nodes, 0);

    return htmlOutput;
};

App.CopyParser.CssClassName = function (nodeDepth) {
    if (nodeDepth >= 0 && nodeDepth <= 3) {
        return 'level-' + nodeDepth;
    }

    return 'level';
};

var html = function (nodes, depthOfNode) {
    var html = '';

    nodes.forEach(function (node) {
        var nodeDataValue = nodeData(node, depthOfNode);

        html += selectedNodeHtml(nodeDataValue);
        html += unSelectedNodeHtml(nodeDataValue);
    });

    return html;
};

var isSelectedNode = function (depthOfNode) {
    return depthOfNode === 0;
};

var selectedNodeHtml = function (nodeData) {
    var selectedNodeHtml = '';

    if (isSelectedNode(nodeData.depthOfNode)) {
        selectedNodeHtml += nodeData.name;

        selectedNodeHtml += html(App.Node.immediateSubNodes(nodeData), nodeData.depthOfNode + 1);
    }

    return selectedNodeHtml;
};

var unSelectedNodeHtml = function (nodeData) {
    var unSelectedNodeHtml = '';

    if (!isSelectedNode(nodeData.depthOfNode) && (App.Node.isSubNode(nodeData) || App.Node.isLeafNode(nodeData))) {
        unSelectedNodeHtml = nodeHtml(nodeData);
    }

    return unSelectedNodeHtml;
};

var nodeHtml = function (nodeData) {
    var nodeHtml = startingUnorderedList(listStyleTypeValue(nodeData.depthOfNode));
    nodeHtml += startingListItem(nodeData.name);

    nodeHtml += html(App.Node.immediateSubNodes(nodeData), nodeData.depthOfNode + 1);

    nodeHtml += endingListItem();
    nodeHtml += endingUnorderedList();

    return nodeHtml;
};

var listStyleTypeValue = function (depth) {
    switch (depth) {
        case 1:
            return 'circle';
        case 2:
            return 'disc';
        default:
            return 'square';
    }
};

var nodeName = function (cssClassInlineValue, nodeName) {
    return "<span style='" + cssClassInlineValue + "'>" + nodeName + "</span>";
};

var startingListItem = function (listItemText) {
    return "<li>" + listItemText;
};

var endingListItem = function () {
    return "</li>";
};

var startingUnorderedList = function (listStyle) {
    return '<ul list-style-type=\'' + listStyle + '\'>';
};

var endingUnorderedList = function () {
    return '</ul>';
};

var nodeData = function (node, depthOfNode) {
    var nodeDataValue = node.__data__;

    var nodeData = {};
    nodeData.depthOfNode = depthOfNode;

    var cssClassNameValue, cssClassInlineValue;

    if (Boolean(nodeDataValue)) {
        nodeData.left = nodeDataValue.left;
        nodeData.right = nodeDataValue.right;
        nodeData.isCollapsed = nodeDataValue.isCollapsed;
        nodeData._childSubTree = nodeDataValue._childSubTree;
        nodeData.childSubTree = nodeDataValue.childSubTree;
        nodeData.parentId = nodeDataValue.parentId;
        nodeData.rootId = nodeDataValue.rootId;

        cssClassNameValue = App.CopyParser.CssClassName(nodeDataValue.depth);
        cssClassInlineValue = App.CopyParser.CssClassValue(cssClassNameValue);

        nodeData.name = nodeName(cssClassInlineValue, nodeDataValue.name);

        return nodeData;
    }

    if (Boolean(node)) {
        nodeData.left = node.left;
        nodeData.right = node.right;
        nodeData.isCollapsed = node.isCollapsed;
        nodeData._childSubTree = node._childSubTree;
        nodeData.childSubTree = node.childSubTree;
        nodeData.parentId = node.parentId;
        nodeData.rootId = node.rootId;

        cssClassNameValue = App.CopyParser.CssClassName(node.depth);
        cssClassInlineValue = App.CopyParser.CssClassValue(cssClassNameValue);

        nodeData.name = nodeName(cssClassInlineValue, node.name);

        return nodeData;
    }

    return nodeData;
};

App.CopyParser.CssClassValue = function (cssClassName) {
    var cssClassValue = '';

    for (var styleSheetCounter = 0; styleSheetCounter < document.styleSheets.length; styleSheetCounter++) {
        var cssRules = document.styleSheets[styleSheetCounter].cssRules || [];

        var filteredCssRules = filterCssRule(cssRules, cssClassName);

        var firstFilteredCssRule = filteredCssRules[0];

        if (Boolean(firstFilteredCssRule)) {
            var selectorText = firstFilteredCssRule.selectorText;
            var cssText = firstFilteredCssRule.cssText;
            var inlineStyleValue = cssText.replace(selectorText, '');

            if (Boolean(inlineStyleValue)) {
                inlineStyleValue = inlineStyleValue.trim();

                inlineStyleValue = removeCurlyBraces(inlineStyleValue);

                cssClassValue = inlineStyleValue;
            }
        }
    }

    return cssClassValue;
};

var filterCssRule = function (cssRules, cssClassName) {
    return $(cssRules).filter(function (key, value) {
        var selectorText = value.selectorText;

        if (Boolean(selectorText)) {
            var matches = selectorText.match(cssClassName) || [];

            return matches.length > 0;
        }
    });
};

var removeCurlyBraces = function (value) {
    if (Boolean(value)) {
        return value.replace('{', '').replace('}', '');
    }
};