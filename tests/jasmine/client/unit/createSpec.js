//fdescribe("Create.js",function(){
//    it("Should return correct embedable code if valid node id is passed",function(){
//        var doc = {
//            "_id" : "PLDkbKG3q3DTYcZyz",
//            "rootId" : "R7kfspmhKQYDuwdYi",
//            "owner" : "praju02desai@gmail.com",
//            "readOnlyLink" : "sharedLink/1460616FQnLJ0R9R69451hvuM1CCo0Y",
//            "readWriteLink" : "sharedLink/146061yetix7QDRO69451peWjzGGbIo"
//        };
//        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000000;
//        App.currentMap = "PLDkbKG3q3DTYcZyz";
//        MindmapMetadata.insert(doc);
//        spyOn(console,'log');
//        spyOn(MindmapMetadata,'findOne');
//        spyOn(Meteor, "call").and.callThrough();
//        var expectedCode ="<iframe width=\"854\" height= \"480\" src=\"http://localhost:3000/embed/1461237CC4DTtx5E38543Y6wFQCL5Oy\" frameborder= \"0\" allowfullscreen></iframe>"
//        var actualCode = App.getEmbedCode();
//        expect(Meteor.call).toHaveBeenCalledWith("getSharableReadLink",App.currentMap, Function);
//        //expect(MindmapMetadata.findOne).toHaveBeenCalled();
//        //expect(console.log).toHaveBeenCalledWith("sharedLink/1460616FQnLJ0R9R69451hvuM1CCo0Y");
//        expect(actualCode).toBe(expectedCode);
//
//
//    } );
//})