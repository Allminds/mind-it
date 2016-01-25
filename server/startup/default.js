mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
   return Mindmaps.find({$or:[{_id:id},{rootId:id}]});
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
  countNodes: function() {
     return Mindmaps.find({}).count();
  },
  countOld: function() {
       return Mindmaps.find({$or:[{parent_ids:{$exists:true}},{rootId:{$exists:false}}]}).count();
   },
  findTree: function (id) {
    return mindMapService.findTree(id);
  }
  ,
  dropDB: function()
  {
        var nodeslist=Mindmaps.find({}).fetch();
        nodeslist.forEach(function(element)
        {
        Mindmaps.remove({_id:element._id});
        }
        );
        return "Dropping Succesfull";
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
var counter = 0;
var checkAllFields = function(node) {
    var truth = node.hasOwnProperty('name') && node.hasOwnProperty('parent_ids')
    && node.hasOwnProperty('position') && node.parent_ids.length >= 1;

    if(!truth) counter++;

    return truth;
 }

var generateData= function(allNodes){

    var rootList = allNodes.filter(function(_) {return  _.position === null});
    var nonRoot = allNodes.filter(function(_) { return rootList.indexOf(_) == -1});
console.log(rootList.length);
    rootList.forEach(function(rootNode){

        var tree = nonRoot.filter(function(_){return checkAllFields(_) && _.position && _.parent_ids[0] === rootNode._id});

//        console.log("counter Value:",counter);
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
            var childNode = new App.Node(treeNode.name);
            childNode._id = treeNode._id;
            childNode.parentId = treeNode.parent_ids[treeNode.parent_ids.length - 1];
            childNode.rootId = rootNode._id;
            var childSubTree = tree.filter(function(_){return _.parent_ids[_.parent_ids.length - 1] === treeNode._id});
            firstChild = childSubTree.find(function(_){return _.previous === null});
            while(firstChild) {
                childNode.childSubTree.push(firstChild._id);
                firstChild = childSubTree.find(function(_){return _._id === firstChild.next});
            }
            nodeMap[childNode._id] = childNode;

            Mindmaps.update({_id: childNode._id} ,childNode );

        });


        });

    };
