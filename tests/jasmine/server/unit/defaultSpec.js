describe('default.js', function () {

    describe('generateSharableLink', function () {

        it("should return string of length 42", function () {
            var url = generateSharableLink();
            expect(url.length).toBe(42);
        });
    });

    describe('generateRandomString', function () {

        it("Should return unique random string of length 10", function () {
            var url1 = randomString(10, App.Constants.CharacterSet);
            var url2 = randomString(10, App.Constants.CharacterSet);
            expect(url1).not.toBe(url2);
        })
    });
    describe('addToMindmapMetaData', function () {

        it("Should call MindmapMetadata.insert()", function () {
            spyOn(MindmapMetadata, 'insert');
            addToMindmapMetaData("dummyId", "dummy@gmail.com");
            expect(MindmapMetadata.insert).toHaveBeenCalled();
        })
    });
    describe('Meteor Methods', function () {
        describe('deleteNode', function () {
            it("Should call mindMapService.deleteNode", function () {
                spyOn(mindMapService, 'deleteNode');
                Meteor.call("deleteNode", "dummyId", function (error, value) {
                    expect(mindMapService.deleteNode).toHaveBeenCalled();
                })
            })
        });

        describe('countMaps', function () {
            it("Should call Mindmaps.find()", function () {
                spyOn(Mindmaps, 'find');
                Meteor.call("countMaps", function (error, value) {
                    expect(Mindmaps.find).toHaveBeenCalled();
                })
            })
        });

        describe('addMapToUser', function () {
            it("Should call App.dbService.addUser and return true", function () {
                spyOn(App.DbService, 'addUser');
                Meteor.call("addMapToUser", "dummy@gmail.com", "dummyId", "o", function (error, value) {
                    expect(App.DbService.addUser).toHaveBeenCalled();
                })
            })
        });

        describe('findTree', function () {
            it("Should call mindMapService.findTree ", function () {
                spyOn(acl, 'findOne');
                Meteor.call("findTree", "dummyId", "dummy@gmail.com", function (error, value) {
                    expect(acl.findOne).toHaveBeenCalled();
                })
            })
        });

        describe('getSharableReadLink', function () {
            it("Should call MindmapMetadata.findOne", function () {
                spyOn(MindmapMetadata, 'findOne');
                Meteor.call("getSharableReadLink", "dummyId", function () {
                    expect(MindmapMetadata.findOne).toHaveBeenCalled();
                })
            });

            it("Should remove www.mindit.xyz from sharable read link and return modified link", function () {
                var document = {
                    rootId: "abcDW122Mxk",
                    owner: '*',
                    readOnlyLink: "www.mindit.xyz/sharedLink/a123snnn",
                    readWriteLink: "www.mindit.xyz/sharedLink/adsdsvsdv"
                };
                spyOn(MindmapMetadata, 'findOne').and.returnValue(document);
                var modifiedLink = "abc";
                Meteor.call("getSharableReadLink", "abcDW122Mxk", function (error, value) {
                    modifiedLink = value;
                    expect(modifiedLink).toBe("sharedLink/a123snnn");
                });
            });

        });

        describe('getSharableWriteLink', function () {
            it("Should call MindmapMetadata.findOne", function () {
                spyOn(MindmapMetadata, 'findOne');
                Meteor.call("getSharableWriteLink", "dummyId", function () {
                    expect(MindmapMetadata.findOne).toHaveBeenCalled();
                })
            });

            it("Should remove www.mindit.xyz from sharable read-write link and return modified link", function () {
                var document = {
                    rootId: "abcDW122Mxk",
                    owner: '*',
                    readOnlyLink: "www.mindit.xyz/sharedLink/a123snnn",
                    readWriteLink: "www.mindit.xyz/sharedLink/adsdsvsdv"
                };
                spyOn(MindmapMetadata, 'findOne').and.returnValue(document);
                var modifiedLink = "abc";
                Meteor.call("getSharableWriteLink", "abcDW122Mxk", function (error, value) {
                    modifiedLink = value;
                    expect(modifiedLink).toBe("sharedLink/adsdsvsdv");
                });
            })
        });

        describe('getRootNodeFromLink', function () {
            it("Should call MindmapMetadata.findOne", function () {
                spyOn(MindmapMetadata, 'findOne');
                Meteor.call("getRootNodeFromLink", "dummyLink", function () {
                    expect(MindmapMetadata.findOne).toHaveBeenCalled();
                })
            });
            it("Should return doc with null readWriteLink  if readOnlylink is passed as argument", function () {
                var document = {
                    rootId: "abcDW122Mxk",
                    owner: '*',
                    readOnlyLink: "www.mindit.xyz/sharedLink/a123snnn",
                    readWriteLink: "www.mindit.xyz/sharedLink/adsdsvsdv"
                };
                spyOn(MindmapMetadata, 'findOne').and.returnValue(document);
                var expectedDoc;
                Meteor.call("getRootNodeFromLink", "www.mindit.xyz/sharedLink/a123snnn", function (error, value) {
                    if (error) {
                        expect(error).toBe(null);
                    } else {
                        expectedDoc = value;
                        expect(expectedDoc.readWriteLink).toBe("");
                        expect(expectedDoc.readOnlyLink).toBe("www.mindit.xyz/sharedLink/a123snnn");
                    }
                });

            });
            it("Should return doc with null readOnlylink if readWriteLink is passed as argument", function () {
                var document = {
                    rootId: "abcDW122Mxk",
                    owner: '*',
                    readOnlyLink: "www.mindit.xyz/sharedLink/a123snnn",
                    readWriteLink: "www.mindit.xyz/sharedLink/adsdsvsdv"
                };
                spyOn(MindmapMetadata, 'findOne').and.returnValue(document);
                var expectedDoc;
                Meteor.call("getRootNodeFromLink", "www.mindit.xyz/sharedLink/adsdsvsdv", function (error, value) {
                    if (error) {
                        expect(error).toBe(null);
                    } else {
                        expectedDoc = value;
                        expect(expectedDoc.readOnlyLink).toBe("");
                        expect(expectedDoc.readWriteLink).toBe("www.mindit.xyz/sharedLink/adsdsvsdv");
                    }
                });

            });
        });

        describe('updateUserStatus', function () {
            it("Should call  App.usersStatusService.updateUserStatus", function () {
                spyOn(Meteor, "userId").and.returnValue("1_id");
                spyOn(Meteor.users, 'findOne').and.returnValue({services: {google: {email: "dummy@mail.com"}}});
                spyOn(App.usersStatusService, 'updateUserStatus');
                Meteor.call("updateUserStatus", "dummyMindmapId", "dummyNodeId", function (error, value) {
                    if (!error) {
                        expect(App.usersStatusService.updateUserStatus).toHaveBeenCalledWith("dummy@mail.com", "dummyMindmapId", "dummyNodeId");
                    }
                })
            });

            it("Should not call App.usersStatusService.updateUserStatus when user is not logged In", function () {
                spyOn(Meteor, "userId").and.returnValue(null);
                spyOn(App.usersStatusService, 'updateUserStatus');
                Meteor.call("updateUserStatus", "dummyMindmapId", "dummyNodeId", function (error, value) {
                    if (!error) {
                        expect(App.usersStatusService.updateUserStatus).not.toHaveBeenCalled();
                    }
                })
            })

        });

        describe('createRootNode', function () {
            it("Should call mindMapService.createRootNode", function () {
                spyOn(mindMapService, 'createRootNode');
                Meteor.call("createRootNode", "dummy@gmail.com", function (error, value) {
                    expect(mindMapService.createRootNode).toHaveBeenCalled();
                })
            });

        });
        describe('createNode', function () {
            it("Should call mindMapService.addNode", function () {
                spyOn(mindMapService, 'addNode');
                Meteor.call("createNode", "dummy@gmail.com", function (error, value) {
                    expect(mindMapService.addNode).toHaveBeenCalled();
                })
            });

        });

        describe('updateNode', function () {
            it("Should call mindMapService.updateNode", function () {
                spyOn(mindMapService, 'updateNode');
                Meteor.call("updateNode", "dummyId", {name: "dummy"}, function (error, value) {
                    expect(mindMapService.updateNode).toHaveBeenCalled();
                })
            });

        });

        describe('isPublicMindmap', function () {
            it("Should return true if given mindmap is public", function () {
                var DUMMY_PUBLIC_MINDMAPID = "QHYW2owkLbjbNnE4H";
                var obj = {
                    count: function () {
                        return 1;
                    }
                };
                spyOn(MindmapMetadata, 'find').and.returnValue(obj);
                Meteor.call("isPublicMindmap", DUMMY_PUBLIC_MINDMAPID, function (error, value) {
                    expect(value).toBe(true);
                })

            });
            it("Should return false if given mindmap is private", function () {
                var DUMMY_PRIVATE_MINDMAPID = "QHYW2owkLbjbNnE4H";
                var result = ["some enrty"];
                var obj = {
                    fetch: function () {
                        //some dummy functionality.
                    }
                };
                spyOn(acl, 'find').and.returnValue(obj);
                spyOn(obj, 'fetch').and.returnValue(result);
                Meteor.call("isPublicMindmap", DUMMY_PRIVATE_MINDMAPID, function (error, value) {
                    expect(value).toBe(false);
                })

            });

        })


    })
});