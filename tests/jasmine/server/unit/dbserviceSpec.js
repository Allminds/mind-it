describe("Database operations calculation test", function () {
    it("Should return 'Insert' when MindMap is not public and no ACL entry for User & Mindmap exists", function () {
        var emptyAclRecord = {
            count: function () {
                return 0;
            }
        };

        spyOn(global, 'isMindMapPublic').and.returnValue(false);
        var operation = getDatabaseOperation(emptyAclRecord, "Xynjshsls", 'o');
        expect(operation).toBe('INSERT');
    });

    it("Should return 'Update' when MindMap is not public and ACL entry for User & Mindmap exists with 'read' but new permission is 'write' ", function () {

        var aclRecord = {
            count: function () {
                return 1;
            },
            fetch: function () {
                return [{"permissions": 'r'}]
            }
        };
        spyOn(global, 'isMindMapPublic').and.returnValue(false);

        var operation = getDatabaseOperation(aclRecord, "Xynjshsls", 'w');
        expect(operation).toBe('UPDATE');

    });

    it("Should return 'NONE' when MindMap is public", function () {

        var aclRecord = {
            count: function () {
                return 1;
            },
            fetch: function () {
                return [{"permissions": 'r'}]
            }
        };
        spyOn(global, 'isMindMapPublic').and.returnValue(true);

        var operation = getDatabaseOperation(aclRecord, "Xynjshsls", 'w');
        expect(operation).toBe('NONE');

    });

    it("Should return 'NONE' when MindMap is not public and ACL entry for User and Mindmap exists with 'write' permission", function () {

        var aclRecord = {
            count: function () {
                return 1;
            },
            fetch: function () {
                return [{"permissions": 'w'}]
            }
        };
        spyOn(global, 'isMindMapPublic').and.returnValue(false);

        var operation = getDatabaseOperation(aclRecord, "Xynjshsls", 'w');
        expect(operation).toBe('NONE');

    });
});
