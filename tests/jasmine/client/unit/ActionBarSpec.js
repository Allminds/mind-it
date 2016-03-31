describe('actionbar.js', function () {
    it("should fetch image of online user", function () {
        spyOn(Meteor.users,'find').and.callThrough();
        var image = extractUserImage();
        expect(Meteor.users.find).toHaveBeenCalled();

    });
});