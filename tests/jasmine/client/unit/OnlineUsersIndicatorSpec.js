describe("Tests for user to current node mapping.", function () {
    var current_working_node_id, current_user_email, currentUserDetails;

    beforeEach(function () {
        current_working_node_id = 'SOME NODE ID';
        current_user_email = 'some email';
        currentUserDetails = {services: {google: {email: current_user_email}}};
    });

    it("Should return nothing when only currently logged user is working on MindMap", function () {
        var onlineUsersInformation = [{"currentWorkingNode": current_working_node_id, "email": current_user_email}];

        spyOn(Meteor, "user").and.returnValue(currentUserDetails);

        var expectedNodes = [];
        var actualNodes = OnlineUsersIndicator.getOnlineUsersInformation(onlineUsersInformation);

        expect(expectedNodes).toEqual(actualNodes);
    });

    it("Should return working node id for each online user other than currently logged in user", function () {
        var firstOtherUserWorkingNodeId = 'FIRST OTHER USER NODE ID';
        var firstOtherUserEmail = 'FIRST OTHER USER EMAIL';

        var secondOtherUserWorkingNodeId = 'SECOND OTHER USER NODE ID';
        var secondOtherUserEmail = 'SECOND OTHER USER EMAIL';

        var onlineUsersInformation = [
            {"currentWorkingNode": firstOtherUserWorkingNodeId, "email": firstOtherUserEmail},
            {"currentWorkingNode": secondOtherUserWorkingNodeId, "email": secondOtherUserEmail},
            {"currentWorkingNode": current_working_node_id, "email": current_user_email}
        ];

        spyOn(Meteor, "user").and.returnValue(currentUserDetails);
        spyOn(Color, "getColorCode");

        var actualNodes = OnlineUsersIndicator.getOnlineUsersInformation(onlineUsersInformation);

        expect(2).toBe(actualNodes.length);
        expect(firstOtherUserWorkingNodeId).toEqual(actualNodes[0].currentWorkingNode);
        expect(secondOtherUserWorkingNodeId).toEqual(actualNodes[1].currentWorkingNode);
    });

    it("Should return unique color code for each online user when number of online users is " +
        "less than number of unique colors", function () {
        var firstOtherUserColorCode = 'FIRST COLOR';
        var firstOtherUserEmail = 'FIRST OTHER USER EMAIL';

        var secondOtherUserColorCode = 'SECOND COLOR';
        var secondOtherUserEmail = 'SECOND OTHER USER EMAIL';

        var onlineUsersInformation = [
            {"email": firstOtherUserEmail},
            {"email": secondOtherUserEmail},
            {"email": current_user_email}
        ];

        spyOn(Meteor, "user").and.returnValue(currentUserDetails);
        spyOn(Color, "getColorCode").and.returnValues('FIRST COLOR', 'SECOND COLOR');

        var actualNodes = OnlineUsersIndicator.getOnlineUsersInformation(onlineUsersInformation);

        expect(2).toBe(actualNodes.length);
        expect(firstOtherUserColorCode).toBe(actualNodes[0].colorCode);
        expect(secondOtherUserColorCode).toBe(actualNodes[1].colorCode);
    });

    it("Should return color code for each online user when number of online users is " +
        "greater than number of unique colors", function () {
        var firstOtherUserColorCode = 'FIRST COLOR';
        var firstOtherUserEmail = 'FIRST OTHER USER EMAIL';

        var secondOtherUserColorCode = 'SECOND COLOR';
        var secondOtherUserEmail = 'SECOND OTHER USER EMAIL';

        var thirdOtherUserColorCode = 'FIRST COLOR';
        var thirdOtherUserEmail = 'THIRD OTHER USER EMAIL';

        var onlineUsersInformation = [
            {"email": firstOtherUserEmail},
            {"email": secondOtherUserEmail},
            {"email": thirdOtherUserEmail},
            {"email": current_user_email}
        ];

        spyOn(Meteor, "user").and.returnValue(currentUserDetails);
        spyOn(Color, "getColorCode").and.returnValues('FIRST COLOR', 'SECOND COLOR', 'FIRST COLOR');

        var actualNodes = OnlineUsersIndicator.getOnlineUsersInformation(onlineUsersInformation);

        expect(3).toBe(actualNodes.length);
        expect(Color.getColorCode).toHaveBeenCalledWith(0);
        expect(Color.getColorCode).toHaveBeenCalledWith(1);
        expect(Color.getColorCode).toHaveBeenCalledWith(2);

        expect(firstOtherUserColorCode).toBe(actualNodes[0].colorCode);
        expect(secondOtherUserColorCode).toBe(actualNodes[1].colorCode);
        expect(thirdOtherUserColorCode).toBe(actualNodes[2].colorCode);
    });

    it("Should return online user information for each online user other than currently logged in user", function () {
        var firstOtherUserWorkingNodeId = 'FIRST OTHER USER NODE ID';
        var firstOtherUserColorCode = 'FIRST COLOR';
        var firstOtherUserEmail = 'FIRST OTHER USER EMAIL';

        var secondOtherUserWorkingNodeId = 'SECOND OTHER USER NODE ID';
        var secondOtherUserColorCode = 'SECOND COLOR';
        var secondOtherUserEmail = 'SECOND OTHER USER EMAIL';

        var onlineUsersInformation = [
            {"currentWorkingNode": firstOtherUserWorkingNodeId, "email": firstOtherUserEmail},
            {"currentWorkingNode": secondOtherUserWorkingNodeId, "email": secondOtherUserEmail},
            {"currentWorkingNode": current_working_node_id, "email": current_user_email}
        ];

        spyOn(Meteor, "user").and.returnValue(currentUserDetails);
        spyOn(Color, "getColorCode").and.returnValues('FIRST COLOR', 'SECOND COLOR');

        var actualNodes = OnlineUsersIndicator.getOnlineUsersInformation(onlineUsersInformation);

        expect(2).toBe(actualNodes.length);
        expect(firstOtherUserWorkingNodeId).toEqual(actualNodes[0].currentWorkingNode);
        expect(secondOtherUserWorkingNodeId).toEqual(actualNodes[1].currentWorkingNode);
        
        expect(firstOtherUserColorCode).toBe(actualNodes[0].colorCode);
        expect(secondOtherUserColorCode).toBe(actualNodes[1].colorCode);
    });


});