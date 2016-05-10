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

});


describe("ACL entry addition and updation test based on calculated Database operations", function () {
    var email_id_for_test = "some_@_email.id";
    var mind_map_id_for_test = "SOME MAP ID";
    var access_permission_for_test = 'some permission';
    var fetched_record_for_test = "SOME RECORD";

    it("No database operations happen when user id is not valid for ACL entry", function () {
        var notLoggedInUserEmail = '*';
        var somePermission = 'r';

        spyOn(global, "fetchACLRecordByUserAndMindMap");

        App.DbService.addUser(notLoggedInUserEmail, "SOME MAP ID", somePermission);

        expect(fetchACLRecordByUserAndMindMap).not.toHaveBeenCalled();
    });

    it("New ACL entry is inserted when calculated Database operation is 'INSERT'", function () {
        spyOn(global, "fetchACLRecordByUserAndMindMap").and.returnValue(fetched_record_for_test);
        spyOn(global, "getDatabaseOperation").and.returnValue("INSERT");
        spyOn(global, "insertNewMappingInACL");

        App.DbService.addUser(mind_map_id_for_test, email_id_for_test, access_permission_for_test);

        expect(insertNewMappingInACL).toHaveBeenCalledWith(mind_map_id_for_test, email_id_for_test, access_permission_for_test);
        expect(fetchACLRecordByUserAndMindMap).toHaveBeenCalledWith(email_id_for_test, mind_map_id_for_test);
        expect(getDatabaseOperation).toHaveBeenCalledWith(fetched_record_for_test, access_permission_for_test);
    });

    it("ACL entry is updated when calculated Database operation is 'UPDATE'", function () {
        spyOn(global, "fetchACLRecordByUserAndMindMap").and.returnValue(fetched_record_for_test);
        spyOn(global, "getDatabaseOperation").and.returnValue("UPDATE");
        spyOn(global, "updateMappingInACL");

        App.DbService.addUser(mind_map_id_for_test, email_id_for_test, access_permission_for_test);

        expect(updateMappingInACL).toHaveBeenCalledWith(email_id_for_test, mind_map_id_for_test, access_permission_for_test);
        expect(fetchACLRecordByUserAndMindMap).toHaveBeenCalledWith(email_id_for_test, mind_map_id_for_test);
        expect(getDatabaseOperation).toHaveBeenCalledWith(fetched_record_for_test, access_permission_for_test);
    });

    it("No insert or update on ACL is performed when calculated Database operation is 'NONE'", function () {
        spyOn(global, "fetchACLRecordByUserAndMindMap").and.returnValue(fetched_record_for_test);
        spyOn(global, "getDatabaseOperation").and.returnValue("NONE");
        spyOn(global, "updateMappingInACL");
        spyOn(global, "insertNewMappingInACL");

        App.DbService.addUser(mind_map_id_for_test, email_id_for_test, access_permission_for_test);

        expect(updateMappingInACL).not.toHaveBeenCalled();
        expect(insertNewMappingInACL).not.toHaveBeenCalled();
        expect(fetchACLRecordByUserAndMindMap).toHaveBeenCalledWith(email_id_for_test, mind_map_id_for_test);
        expect(getDatabaseOperation).toHaveBeenCalledWith(fetched_record_for_test, access_permission_for_test);
    });
});
