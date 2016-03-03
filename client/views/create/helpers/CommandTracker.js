App.CommandTracker = {
    added: function (id, fields) {
                console.log("incommandtracker ");
        var newNode = App.map.getNodeDataWithNodeId(fields.affectedNodeId);
        if (newNode)
            return;
            console.log("typeof: ",typeof fields.command);
            console.log("val: ",fields.command);
            console.log("bool: ",fields.command == "Add");
            if(fields.command == "Add")
            {
                add(fields);

            }
    },




   changed: function (id, fields) {

var doc=MindmapCommands.find({_id:id}).fetch()[0];

  switch (doc.command)
  {

    case "Add":
        add(doc);
        break;
    case "Rename":
        rename(doc);
        break;

  }
}



 };

 var check_newNodeExists = function(fields)
 {
 var newNode = App.map.getNodeDataWithNodeId(fields.affectedNodeId);
          if (newNode)
             return true;

     return false;
 }
 ;
 var add = function(fields){

//         if(check_newNodeExists(fields))
//         {
//             return;
//         }return
         console.log("fields_changed",fields);
         newNode = fields.argumentList[0];
         newNode._id = fields.affectedNodeId;

         var parent = App.map.getNodeDataWithNodeId(newNode.parentId);
         newNode.parent=parent;
         App.nodeStore[newNode._id] = newNode;
         App.map.addNodeToUI(parent, newNode);
         App.nodeSelector.setPrevDepth(newNode.depth);

     };
 var rename = function(fields){
         console.log("fields_changed",fields);
          var newNode = App.map.getNodeDataWithNodeId(fields.affectedNodeId);
                 if(!check_newNodeExists(fields))
                 {
                             App.commandTracker.add(fields);
                             return;
                 }
                 else
                 {
                     //mindMapService.updateNode(fields.affectedNodeId, {name: fields.args[0]});
                     Mindmaps.update({_id:fields.affectedNodeId},{name:fields.argumentList[0]} );
                     newNode.name = fields.argumentList[0];
                     App.chart.update();
                 }

 };


