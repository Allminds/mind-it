/* global Mindmaps */
/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function MindMapService() {};

MindMapService.prototype.createNode = function(name) {
    return Mindmaps.insert({name:name,children:[]});
};

