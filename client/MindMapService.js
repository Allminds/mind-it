/* global Mindmaps */
/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function MindMapService() {};

MindMapService.prototype.createNode = function(name) {
    return Mindmaps.insert({name:name,children:[]});
};

MindMapService.prototype.updateNode = function(rootNode){
	var key = {_id:rootNode._id},
		updatedNode = JSON.parse( JSON.stringify(rootNode));
	delete updatedNode._id;
	Mindmaps.update( key ,updatedNode);
};
