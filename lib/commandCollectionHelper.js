App.rename = function (nodeData)
{
    var args=[];
    args[0]=nodeData.name;
    App.insertMindmapCommand("Rename",nodeData._id,args,nodeData.rootId);
}

App.insertMindmapCommand = function(command, affectedNodeId, argumentList, rootId)
{
    console.log("in commandcollectionhelper");
    var noOfDocuments=MindmapCommands.find().count();
    console.log("document",document);
    if(noOfDocuments==0)
    {
    MindmapCommands.insert({command:command,affectedNodeId:affectedNodeId, argumentList:argumentList, rootId:rootId});
        console.log("in !document");


    }
    else
    {
        var document_id=MindmapCommands.findOne()._id;
        //                    console.log("before update",document_id);
        //
        MindmapCommands.update({_id:document_id},{command:command, affectedNodeId:affectedNodeId, argumentList:argumentList, rootId:rootId});

       // MindmapCommands.drop();
      //  MindmapCommands.insert({command:command,affectedNodeId:affectedNodeId, argumentList:argumentList, rootId:rootId});


//mindMapService.updateCommand(document_id, {command:command,affectedNodeId:affectedNodeId, argumentList:argumentList, rootId:rootId});
   // MindmapCommands.insert({command:command,affectedNodeId:affectedNodeId, argumentList:argumentList, rootId:rootId});

                    console.log("in else");

    }
}