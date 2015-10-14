/* global Mindmaps */
/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function MindMapService() {};

MindMapService.prototype.createRootNode = function(name) {
    mindid = Mindmaps.insert({name: name,children: [],parent : null, direction : null});
    return mindid;
};

MindMapService.prototype.updateNode = function(rootNode){
	Mindmaps.update({_id:rootNode._id},{$set : {name: rootNode.name}});
};

MindMapService.prototype.addChild= function(current_node,dir){
	var temp_node= {name: "", children: [],parent : null, direction : dir};
	Mindmaps.update({_id:current_node._id}, {$push: {children: temp_node}});
}
