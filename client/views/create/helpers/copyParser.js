App.CopyParser = {};

App.CopyParser.errorMessage = "";

App.CopyParser.populateBulletedFromObject = function(node, depthOfNode){
    var returnString = "";
    if(!node) return returnString;
    var depth  = depthOfNode ? depthOfNode : 0;
    for(var i = 1; i <= depth; i++ )
        returnString += "\t";
    returnString += node.name.length == 0 ? "§" : node.name;

    var temp = App.Node.isRoot(node) ? (
        node.left.reduce(function(prev, next){
            return prev + "\n" + App.CopyParser.populateBulletedFromObject(next, depth + 1);
        }, "") + node.right.reduce(function(prev, next){
            return prev + "\n" + App.CopyParser.populateBulletedFromObject(next, depth + 1);
        }, "")
    ) : App.Node.getSubTree(node).reduce(function(prev, next){
        return prev + "\n" +  App.CopyParser.populateBulletedFromObject(next, depth + 1);
    }, "");

    return temp.length==0 ? returnString : (returnString + temp);

};


var populateObjectFromBulletedList = function(bulletedList, parentNode, expectedDepth) {
    var newNode = null;
    var dir = "childSubTree";
    var expectedDepthStore = expectedDepth;
    if(App.Node.isRoot(parentNode)) {
        dir = App.DirectionToggler.getInstance().getCurrentDirection();//(parentNode);
    }
    var childNodeList = [];
    var childNodeSubTree = [];
    var childBulletList = [];
    var siblingIdList = parentNode[dir].map(function(_){return _._id ? _._id : _ });
    for(var i = 0; i < bulletedList.length;) {
        var depth = bulletedList[i].split('\t').length - 1;

        if(depth <= expectedDepth || i == 0) {
            if(i == 0)  expectedDepth = depth;
            var nodeName = bulletedList[i].split('\t')[depth];
            if(nodeName.length > 0) {
                nodeName = nodeName == "§" ? "" : nodeName;
                newNode = new App.Node(nodeName, dir, parentNode, i);
                newNode = App.Node.addToDatabase(newNode);
                siblingIdList.push(newNode._id);
            }
            i++;
        } else {
            childBulletList = [];
            var j = i;
            var childDepth = bulletedList[j].split('\t').length - 1;
            while (childDepth > expectedDepthStore) {
                childBulletList.push(bulletedList[j]);
                j++;
                if(j >= bulletedList.length)
                    break;
                childDepth = bulletedList[j].split('\t').length - 1;
            }

            j == i ? i++: i = j;

        }

        if(childBulletList.length > 0) {
            childNodeList[newNode._id] = childBulletList;
            childNodeSubTree[newNode._id] = newNode
            childBulletList = [];
        }
    }
    App.Node.updateChildTree(parentNode, dir, siblingIdList);
    Object.keys(childNodeList).forEach(function(childNodeId) {
        childBulletList = childNodeList[childNodeId];
        var newParent = childNodeSubTree[childNodeId]
        if (childBulletList && childBulletList.length > 0)
            populateObjectFromBulletedList(childBulletList, newParent, expectedDepthStore + 1);
    });
};

App.CopyParser.populateObjectFromBulletedList = function(bulletedString, parentNode) {
    if(bulletedString.length > 0) {
        populateObjectFromBulletedList(bulletedString.split(/\n\r|\n/), parentNode, 0);
    }
}