mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
  return Mindmaps.find({});
});
Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.methods({
  //Only Meteor can delete the documents - Not permitted for client
  deleteNode: function (id) {
    mindMapService.deleteNode(id);
  },

  countMaps: function () {
    return Mindmaps.find({parentId: null}).count();
  },

  findTree: function (id) {
    return mindMapService.findTree(id);
  }
  ,
  iterateOverNodesList: function(){
          var AllNodes= Mindmaps.find({}).fetch();
          generateData(AllNodes);
  //        updateData  (AllNodes);
    }
});

//rootLefts  = {}
//rootRights = {}
childArrays= {}

var generateData= function(allNodes){
    var rootList = allNodes.filter(function(_) {return _.position === null});

    rootList.forEach(function(rootNode){
        var tree = allNodes.filter(function(_){return _.position && _.parent_ids[0] === rootNode._id});
        var nodeMap = [];
        var nodeObject = new App.Node(rootNode.name);
        nodeObject._id = rootNode._id;
        var depth = 0;
        var rootLefts = tree.filter(function(_){return _.parent_ids.length == 1 && _.position === 'left'});
        var rootRights = tree.filter(function(_){return _.parent_ids.length == 1 && _.position === 'right'});
        var firstChild = rootLefts.find(function(_){return _.previous === null});
        if(!firstChild)
            firstChild = rootLefts[0];
        while(firstChild) {
            nodeObject.left.push(firstChild._id);
            firstChild = rootLefts.find(function(_){return _._id === firstChild.next});
        }

        firstChild = rootRights.find(function(_){return _.previous === null});
        if(!firstChild)
            firstChild = rootRights[0];
        while(firstChild) {
            nodeObject.right.push(firstChild._id);
            firstChild = rootRights.find(function(_){return _._id === firstChild.next});
        }

        Mindmaps.update({_id: nodeObject._id} ,nodeObject );

        nodeMap[nodeObject._id] = nodeObject;
        tree.forEach(function(treeNode){
        console.log(treeNode._id+"--");
            var childNode = new App.Node(treeNode.name);
            childNode._id = treeNode._id;
            childNode.parentId = treeNode.parent_ids[treeNode.parent_ids.length - 1];
            childNode.rootId = rootNode._id;
            var childSubTree = tree.filter(function(_){return _.parent_ids[_.parent_ids.length - 1] === treeNode._id});
            firstChild = childSubTree.find(function(_){return _.previous === null});
            while(firstChild) {
            console.log("+++"+firstChild._id);
                childNode.childSubTree.push(firstChild._id);
                firstChild = childSubTree.find(function(_){return _._id === firstChild.next});
            }
            nodeMap[childNode._id] = childNode;
            console.log(childNode);
            Mindmaps.update({_id: childNode._id} ,childNode );

        });


        });
    };
