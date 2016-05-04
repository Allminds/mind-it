describe("Database operations calculation test", function () {
    it("Should return 'Insert' when no ACL entry for User & Mindmap exists", function () {
        var emptyAclRecord = {
            count: function () {
                return 0;
            }
        };
        var operation = getDatabaseOperation(emptyAclRecord, "Xynjshsls", 'o');
        expect(operation).toBe('INSERT');
    });

    it("Should return 'Update' when ACL entry for User & Mindmap exists with 'read' but new permission is 'write' ", function () {

        var aclRecord = {
            count: function () {
                return 1;
            },
            fetch: function () {
                return [{"permissions": 'r'}]
            }
        };
        var operation = getDatabaseOperation(aclRecord, 'w');
        expect(operation).toBe('UPDATE');

    });

    it("Should return 'NONE' when ACL entry for User and Mindmap exists with 'write' or 'owner' permission", function () {

        var aclRecord = {
            count: function () {
                return 1;
            },
            fetch: function () {
                return [{"permissions": 'w'}]
            }
        };
        var operation = getDatabaseOperation(aclRecord, 'w');
        expect(operation).toBe('NONE');

    });

    it("Should return 'NONE' when user is not logged in", function () {

    });
});


describe("User Mapping entry in ACL test", function () {

    it("No database operations happen when user id is not valid for ACL entry", function () {
        var notLoggedInUserEmail = '*';
        var somePermission = 'r';
        spyOn(global, "fetchACLRecordByUserAndMindMap");
        App.DbService.addUser(notLoggedInUserEmail, "SOME MAP ID", somePermission);
        expect(fetchACLRecordByUserAndMindMap).not.toHaveBeenCalled();
    });
});
