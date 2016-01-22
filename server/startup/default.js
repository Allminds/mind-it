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
        var rootLefts = tree.filter(function(_){return _.parent_ids.length === 1 && _.position === 'left'});
        var rootRights = tree.filter(function(_){return _.parent_ids.length === 1 && _.position === 'right'});
        var firstChild = rootLefts.find(function(_){return _.previous === null});
        while(firstChild) {
            nodeObject.left.push(firstChild._id);
            firstChild = rootLefts.find(function(_){return _._id === firstChild.next});
        }

        firstChild = rootRights.find(function(_){return _.previous === null});
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

        /*Object.keys(nodeMap).forEach(function(_){
            //write nodeMap[_];
            Mindmaps.update({_id: _} ,nodeMap[_] );
            console.log("1212"+nodeMap[_]);
        });*/
        });
    };

        /*
        if(node.position==null){
            node.rootId=null;
            node.parentId=null;
            node.childSubTree=[];
            node.left=[];
            node.right=[];
            }
        else{
            node.rootId = node.parent_ids[0];
            node.parentId = node.parent_ids[node.parent_ids.length - 1];

            if(node.rootId==node.parentId){
                if( !rootLefts[ node.rootId ] ) {  rootLefts[ node.rootId ]=[];   }
                if( !rootRights[ node.rootId ]) {  rootRights[ node.rootId]=[];   }

                if( node.position == "left") {


 //               if(node.previous==null) node.previous="o";

                    rootLefts[ node.rootId].push(node._id);

                }
                if( node.position == "right")  {

                    rootRights[node.rootId].push(node._id);
                }

            }
            else{

                if( !childArrays[ node.parentId])    childArrays[ node.parentId]=[];

                    childArrays[ node.parentId].push(node._id);

            }

        }


    });

        updateData(allNodes);

}


var updateData = function(allNodes){


    allNodes.forEach(function(node){

        if(node.position==null){


            node.left = rootLefts[node._id];
            node.right= rootRights[node._id];
            if(!node.left) node.left=[];
            if(!node.right)node.right=[];

            Mindmaps.update({_id: node._id},node);

        }
        else{




            node.childSubTree = childArrays[node._id];
            if(!node.childSubTree)  node.childSubTree=[];
            node.left = [];
            node.right= [];
            node.index= 0;
            Mindmaps.update({_id: node._id},node);

        }

    });

}*/