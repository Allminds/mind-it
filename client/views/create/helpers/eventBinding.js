App.eventBinding = {};

App.eventBinding.focusAfterDelete = function (removedNode, removedNodeIndex) {
  var parent = removedNode.parent,
    siblings = (App.Node.isRoot(parent) ? parent[removedNode.position] : parent.childSubTree) || [];
  var focusableNode = siblings[removedNodeIndex];
  if(siblings.length == 0) {
    focusableNode = parent;
  }else if (removedNodeIndex == siblings.length ) {
    focusableNode = siblings[removedNodeIndex - 1];
  }
  App.selectNode(focusableNode);
};

App.cutNode = function (asyncCallBack) {
  var sourceNode = App.map.getDataOfNodeWithClassNamesString(".selected");
  if (App.getDirection(sourceNode) === 'root') {
    alert("The root node cannot be cut!");
    return;
  }
  App.map.storeSourceNode(sourceNode);
  var selectedNodeIndex = (sourceNode.parent.children || []).indexOf(sourceNode);
  App.removeLocally(sourceNode);
  Meteor.call('deleteNode', sourceNode._id, function (err, data) {
    App.eventBinding.focusAfterDelete(sourceNode, selectedNodeIndex);
    if (asyncCallBack)
      asyncCallBack(err, data);
  });
};

App.pasteNode = function (sourceNode, targetNode, dir, previousSibling) {
  var newNode = App.map.addNewNode(targetNode, sourceNode.name, dir, previousSibling),
    childrenArray;
  if (sourceNode.hasOwnProperty('children') && sourceNode.children) {
    childrenArray = sourceNode.children;
  }
  else if (sourceNode.hasOwnProperty('_children') && sourceNode._children) {
    childrenArray = sourceNode._children;
  }
  if (sourceNode.hasOwnProperty('isCollapsed') && sourceNode.isCollapsed) {
    newNode.isCollapsed = sourceNode.isCollapsed;
    App.storeLocally(newNode);
  }
  if (childrenArray) {
    var previous = null;
    childrenArray.forEach(
      function (d) {
        previous = App.pasteNode(d, newNode, dir, previous);
      }
    );
  }
  return newNode;
};

App.eventBinding.f2Action = function() {
  (event.preventDefault || event.stop || event.stopPropagation || function () {
  }).call(event);
  var selectedNode = d3.select(".node.selected")[0][0];
  if (!selectedNode) return;
  App.showEditor.call(selectedNode);
};

Mousetrap.bind('f2', function() {
  App.eventBinding.f2Action()
});

Mousetrap.bind('mod+x', App.cutNode);

Mousetrap.bind('mod+c', function () {
  var sourceNode = App.map.getDataOfNodeWithClassNamesString(".selected");
  App.map.storeSourceNode(sourceNode);
});

Mousetrap.bind('mod+v', function () {
  var targetNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
  var sourceNode = App.map.sourceNode;
  var dir = App.calculateDirection(targetNode);
  if (targetNode.isCollapsed)
    App.expandRecursive(targetNode, targetNode._id);
  App.pasteNode(sourceNode, targetNode, dir);
  App.retainCollapsed();
});

App.eventBinding.escapeOnNewNode = function(newNode, parentNode){
    $(window).unbind().on("keyup", (function(e) {
      var selectedNodeId = d3.select('.selected').node() ? d3.select('.selected').node().__data__._id : null;
      var modalCreatedNodeId = d3.select('._selected').node() ? d3.select('._selected').node().__data__._id : null;
      if((selectedNodeId === null && modalCreatedNodeId === null )){
        if (e.keyCode === App.KeyCodes.escape) {
          Meteor.call('deleteNode', newNode._id, function () {
            App.selectNode(parentNode);
          });
        }
      }
    }));
  };

App.eventBinding.afterNewNodeAddition = function (newNode, selectedNode) {
  App.deselectNode();
  App.map.makeEditable(newNode._id);
  App.eventBinding.escapeOnNewNode(newNode, selectedNode);
};

App.eventBinding.newNodeAddAction = function (action) {
  var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
  if (selectedNode) {
    var newNode = action(selectedNode);
    App.eventBinding.afterNewNodeAddition(newNode, selectedNode);
  }
};

App.eventBinding.enterAction = function (selectedNode) {
  var dbNode = App.Node.d3NodeToDbNode(selectedNode),
    parent = dbNode.parentId ? App.Node.getParent(dbNode.parentId) : dbNode,
    dir = App.calculateDirection(parent),
    siblings = parent.position ? parent.childSubTree : parent[dir],
    childIndex = dbNode.position ? siblings.indexOf(dbNode._id) + 1 : siblings.length;

  return App.map.addNewNode(parent, dir, childIndex);
};

Mousetrap.bind('enter', function () {
  App.eventBinding.newNodeAddAction(App.eventBinding.enterAction);
  return false;
});

App.eventBinding.tabAction = function (selectedNode) {
  if (selectedNode.hasOwnProperty('isCollapsed') && selectedNode.isCollapsed) {
    App.expand(selectedNode, selectedNode._id);
  }
  var dbNode = App.Node.d3NodeToDbNode(selectedNode),
    dir = App.calculateDirection(dbNode),
    siblings = dbNode.position ? dbNode.childSubTree : dbNode[dir],
    childIndex = siblings.length;

  return App.map.addNewNode(dbNode, dir, childIndex);
};

Mousetrap.bind('tab', function () {
  App.eventBinding.newNodeAddAction(App.eventBinding.tabAction);
  return false;
});

Mousetrap.bind('del', function () {
  var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
  if (selectedNode) {
    var dir = App.getDirection(selectedNode);

    if (dir === 'root') {
      alert('Can\'t delete root');
      return;
    }
    var removedNodeIndex = App.Node.delete(selectedNode);
    App.eventBinding.focusAfterDelete(selectedNode, removedNodeIndex);
    Meteor.call('deleteNode', selectedNode._id);
  }
});

App.eventBinding.findSameLevelChild = function (node, depth, keyPressed) {
  var index;
  if (keyPressed === App.Constants.KeyPressed.DOWN)
    index = 0;
  if (!node.children)
    return node;
  if (node.depth == depth) {
    return node;
  }
  while (node.children) {
    if (!(keyPressed === App.Constants.KeyPressed.DOWN))
      index = node.children.length - 1;
    node = node.children[index];
    if (node.depth == depth) {
      return node;
    }
  }
  return node;
};

var isParentChildMatchesThisNode = function (siblings, index, node) {
    return siblings[index]._id === node._id
};

var isGoingUpFromTopMostNode = function (siblings, node, keyPressed) {
  return !(keyPressed === App.Constants.KeyPressed.DOWN) && isParentChildMatchesThisNode(siblings, 0, node);
};

var isGoingDownFromBottomLastNode = function (iterator, numberOfSiblings, keyPressed) {
  return (keyPressed === App.Constants.KeyPressed.DOWN) && (iterator == numberOfSiblings);
};

App.eventBinding.performLogicalVerticalMovement = function(node, keyPressed) {
  var direction = App.getDirection(node);
  if (direction === 'root') return;

  var parent = node.parent,
    siblings = (App.Node.isRoot(parent) ? parent[direction] : parent.childSubTree) || [] ,
    iterator = (keyPressed === App.Constants.KeyPressed.DOWN) ? 0:1;

  var numberOfSiblings = (keyPressed === App.Constants.KeyPressed.DOWN) ? siblings.length-1 : siblings.length;

  while(iterator < numberOfSiblings) {
    if (isParentChildMatchesThisNode(siblings, iterator, node)) {
      var iteratorDiff = (keyPressed === App.Constants.KeyPressed.DOWN) ? 1:-1;
      App.selectNode(App.eventBinding.findSameLevelChild(siblings[iterator + iteratorDiff], App.nodeSelector.prevDepthVisited, keyPressed));
      break;
    }
    iterator++;
  }
  if(isGoingDownFromBottomLastNode(iterator, numberOfSiblings, keyPressed))
    App.eventBinding.performLogicalVerticalMovement(parent, keyPressed);
  if(isGoingUpFromTopMostNode(siblings, node, keyPressed))
    App.eventBinding.performLogicalVerticalMovement(parent, keyPressed);
};

App.eventBinding.beforeBindEventAction = function (event) {
  (event.preventDefault || event.stop || event.stopPropagation || function () {
  }).call(event);
  return d3.select(".node.selected")[0][0].__data__;
};

App.eventBinding.afterBindEventAction = function (node) {
  App.selectNode(node);
  if (node)
    App.nodeSelector.setPrevDepth(node.depth);
};

App.eventBinding.caseAction = function (data, left, right, root, keyPressed) {
  var dir = App.getDirection(data);
  switch (dir) {
    case('root'):
      root(data, keyPressed);
      break;
    case('left'):
      left(data, keyPressed);
      break;
    case('right'):
      right(data, keyPressed);
      break;
  }
};

App.eventBinding.bindEventAction = function (event, left, right, root, keyPressed) {
  var selectedNodeData = App.eventBinding.beforeBindEventAction(event);
  if (selectedNodeData) {
    App.eventBinding.caseAction(selectedNodeData, left, right, root, keyPressed);
  }
  return false;
};

Mousetrap.bind('up', function () {
  return App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function(){}, App.Constants.KeyPressed.UP);
});

Mousetrap.bind('down', function () {
  return App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function(){}, App.Constants.KeyPressed.DOWN);
});

App.eventBinding.handleCollapsing = function (data) {
  var node;
  if (data.hasOwnProperty('isCollapsed') && data.isCollapsed) {
    App.expand(data, data._id);
  }
  else {
    node = (data.children || [])[0];
  }
  App.eventBinding.afterBindEventAction(node);
};

App.eventBinding.getParentForEventBinding = function (data, dir) {
  var node = data.parent || data[dir][0];
  App.eventBinding.afterBindEventAction(node);
};

Mousetrap.bind('left', function () {
  return App.eventBinding.bindEventAction(arguments[0], App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.LEFT);
});

Mousetrap.bind('right', function () {
  return App.eventBinding.bindEventAction(arguments[0], App.eventBinding.getParentForEventBinding, App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.RIGHT);
});

Mousetrap.bind('space', function () {
  var selectedNodeData = App.eventBinding.beforeBindEventAction(arguments[0]);
  App.toggleCollapsedNode(selectedNodeData);
});

Mousetrap.bind('mod+e', function createXmlFile() {
  var rootNode = d3.selectAll('.node')[0].find(function (node) {
    return !node.__data__.position;
  });
  var rootNodeObject = rootNode.__data__;
  var XMLString = [];
  XMLString = "<map version=\"1.0.1\">\n";

  XMLString = App.JSONtoXML(XMLString, rootNodeObject);
  XMLString += "</map>";

  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {

    fs.root.getFile('testmap1.mm', {create: true}, function (fileEntry) {

      fileEntry.createWriter(function (fileWriter) {
        fileWriter.truncate(0);
      }, function () {
      });

      fileEntry.createWriter(function (fileWriter) {
        var blob = new Blob([XMLString]);
        fileWriter.write(blob);
        fileWriter.addEventListener("writeend", function () {
          location.href = fileEntry.toURL();
        }, false);
      }, function () {
      });
    }, function () {
    });
  }, function () {
  });

});

Mousetrap.bind('mod+left', debounce(250, true,
  function () {
    var selection = d3.select(".node.selected")[0][0];
    if (selection) {
      var data = selection.__data__;
      var dir = App.getDirection(data),
        parent = data.parent,
        selectedNode,
        target,
        direction;

      function pasteAfterCut() {
        if (target.isCollapsed) {
          App.expandRecursive(target, target._id);
          App.removeLocally(target._id);
        }
        if (direction == "right")
          selectedNode = App.pasteNode(data, target, direction, parent);
        else
          selectedNode = App.pasteNode(data, target, direction);
        App.retainCollapsed();
        App.selectNode(selectedNode);
      }

      switch (dir) {
        case('right'):
          App.cutNode(function () {
            if (App.getDirection(parent) === 'root') {
              if (data.hasOwnProperty('isCollapsed') && data.isCollapsed)
                App.removeLocally(data._id);
              selectedNode = App.pasteNode(data, parent, "left");
              App.retainCollapsed();
              App.selectNode(selectedNode);
              return;

            }
            else {
              target = parent.parent;
              direction = "right";
              pasteAfterCut();
            }
          });

          break;
        case('root'):
          alert("Root cannot be added to a new parent");
          break;
        case('left'):
          var nl = parent.children || [], i = 0;
          if (parent[dir]) {
            nl = parent[dir];
          }
          var l = nl.length;
          for (; i < l; i++) {
            if (nl[i]._id === data._id && l != 1) {
              if (i === 0)
                target = nl[(i + 1)];
              else
                target = nl[(i - 1)];
              direction = "left";
              App.cutNode(pasteAfterCut);
              break;
            }

          }
          break;
        default:
          break;
      }
    }
  }));

Mousetrap.bind('mod+right', debounce(250, true,
  function () {
    var selection = d3.select(".node.selected")[0][0],
      selectedNode,
      target,
      direction;


    if (selection) {
      var data = selection.__data__;
      var dir = App.getDirection(data),
        parent = data.parent;

      function pasteAfterCut() {
        if (target.isCollapsed) {
          App.expandRecursive(target, target._id);
          App.removeLocally(target._id);
        }
        if (direction == "left")
          selectedNode = App.pasteNode(data, target, direction, parent);
        else
          selectedNode = App.pasteNode(data, target, direction);
        App.retainCollapsed();
        App.selectNode(selectedNode);
      }

      switch (dir) {
        case('left'):
          App.cutNode(function () {
            if (App.getDirection(parent) === 'root') {
              if (data.hasOwnProperty('isCollapsed') && data.isCollapsed)
                App.removeLocally(data._id);
              selectedNode = App.pasteNode(data, parent, "right");
              App.retainCollapsed();
              App.selectNode(selectedNode);
              return;
            }
            else {
              target = parent.parent;
              direction = "left";
              pasteAfterCut();
            }
          });

          break;
        case('root'):
          alert("Root cannot be added to a new parent");
          break;
        case('right'):
          var nl = parent.children || [], i = 0;
          if (parent[dir]) {
            nl = parent[dir];
          }
          var l = nl.length;
          for (; i < l; i++) {
            if (nl[i]._id === data._id && l != 1) {
              if (i === 0)
                target = nl[(i + 1)];
              else
                target = nl[(i - 1)];
              direction = "right";
              App.cutNode(pasteAfterCut);
              break;
            }
          }
          break;
        default:
          break;
      }

    }
  }));

Mousetrap.bind('mod+up', debounce(0, true, function () {
  var selection = d3.select(".node.selected")[0][0].__data__;

  if (!(selection && selection.parent))
    return;

  App.Node.reposition(selection, App.Constants.KeyPressed.UP);
}));

Mousetrap.bind('mod+down', debounce(0, true, function () {
  var selection = d3.select(".node.selected")[0][0].__data__;

  if (!(selection && selection.parent))
   return;

  App.Node.reposition(selection, App.Constants.KeyPressed.DOWN);
}));

Mousetrap.bind("esc", function goToRootNode() {
  App.select(d3.select('.node.level-0')[0][0]);
  App.getChartInFocus();
});

Mousetrap.bind('?', function showHelp() {
  $('#help-modal').modal('show');
});
