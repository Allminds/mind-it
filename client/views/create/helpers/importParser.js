App.ImportParser = (function () {
    var instance,

        populateMindMapFromXML = function(xmlNodes, parentJSONNode, mindmapService){
            var previousSibling = null;
            var retValue = validateChildNodes(xmlNodes);
            console.log(retValue);
            if(validateChildNodes(xmlNodes) == false) {
                console.log('False returned from validateChildNodes');
                return false;
            }
                
            
            for(i = 0; i < xmlNodes.length ;i++) {
                var nodeName = xmlNodes[i].getAttribute("TEXT") ? xmlNodes[i].getAttribute("TEXT") : "";
                var direction = xmlNodes[i].getAttribute("POSITION") ? xmlNodes[i].getAttribute("POSITION") : parentJSONNode["position"];
                var newNode = createNode(parentJSONNode, nodeName, direction, previousSibling);
                newNode._id = mindmapService.addNode(newNode);

                if (previousSibling && previousSibling._id) {
                    mindmapService.updateNode(previousSibling._id, {next: newNode._id});
                }

                previousSibling = newNode;
                var childNodes = xmlNodes[i].childNodes;

                if(childNodes.length > 0) {
                    if(populateMindMapFromXML(childNodes, newNode, mindmapService) == false) {
                        return false;
                    }
                }

                return true;


            }
        },

        validateChildNodes = function(xmlNodes) {
            
            for(i = 0; i < xmlNodes.length; i++) {
                console.log(xmlNodes[i].nodeName);

                if(xmlNodes[i].nodeName != "node") {
                    return false;
                }
            }

            return true;
        }, 

        createNode = function (parent, newNodeName, dir, previousSibling) {
            var newNode = {
                name: newNodeName, position: dir,
                parent_ids: [].concat(parent.parent_ids || []).concat([parent._id]),
                previous: (previousSibling ? previousSibling._id : null), next: null
            };

            return newNode;
        },
        
        createRootNode = function(rootId, rootName) {
            var rootNode = {
                name: rootName, position: null,
                children: [], _id: rootId
            };

            return rootNode;
        }

    var init = function () {
        return {
            createMindmapFromXML : function(XMLdom, mindmapService) {
                this.errorMessage = "";
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(XMLdom,"text/xml");
                var documentNode = xmlDoc.documentElement;
                var rootNode = documentNode.childNodes;

                if(rootNode.length > 0 && rootNode[0].nodeName == "parsererror") {
                    this.errorMessage = "Invalid XML format";
                    return null;
                } else if(documentNode.nodeName != "map") {
                    this.errorMessage = "Not a mindmap: Invalid mindmap file";
                    return null;
                } else if( rootNode.length <= 0) {
                    this.errorMessage = "Not a mindmap: Root node not found";
                    return null;
                }else if( rootNode.length > 1) {
                    this.errorMessage = "Not a mindmap: Multiple root nodes found";
                    return null;
                } 

                rootNode = rootNode[0];
                if( rootNode.nodeName != "node") {
                    this.errorMessage = "Not a mindmap: Non 'node' element found";
                    return null;
                }
                
                var rootChildNodes = rootNode.childNodes;

                for (i = 0; i < rootChildNodes.length ;i++) {
                    if(!rootChildNodes[i].getAttribute("POSITION")) {
                        this.errorMessage = "Not a mindmap: POSITION attribute not found in child node of root node";
                        return null;
                    }
                }

                var rootNodeText = (rootNode.getAttribute("TEXT") === undefined) ? "tempText" : rootNode.getAttribute("TEXT");
                var mindMapId = "";

                if(mindmapService) {
                    mindMapId = mindmapService.createRootNode(rootNodeText);

                    var rootNodeJSON = createRootNode(mindMapId, rootNodeText);
                    if(populateMindMapFromXML(rootChildNodes, rootNodeJSON, mindmapService) == false) {
                        this.errorMessage = "Not a mindmap: Non 'node' element found";
                        return null;
                    }
                }
                return mindMapId;
            },

            errorMessage: ""
        }
    };

    var createInstance = function () {
        var object = new init();
        return object;
    };

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };

})();

