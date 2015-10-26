/* global Mindmaps */
/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function MindMapService() {};

MindMapService.prototype.createRootNode = function(name) {
    mindid = Mindmaps.insert({name: name,children: [], direction : null/*, left: [], right: []*/});
    return mindid;
};
MindMapService.prototype.updateNode = function(rootNode){
	for(var i = 0; i < rootNode.children.length; i++ )
		delete rootNode.children[i].parent;	
	 var key = {_id:rootNode._id},
		updatedNode = JSON.parse( JSON.stringify(rootNode));
	delete updatedNode._id;
	Mindmaps.update( key ,updatedNode);
};

MindMapService.prototype.addChild= function(current_node,dir){
	var temp_node= {name: "d", children: []/*,left: [],right: []*/, direction : dir};
	Mindmaps.update({_id:current_node._id}, {$push: {children: temp_node/*, left: temp_node*/}});
}
