describe('actionbar.js', function () {

    beforeEach(function () {
        $.ajax({
            async: false // must be synchronous to guarantee that no tests are run before fixture is loaded
        });

        spyOn(Meteor, 'user').and.returnValue({services: {google: {email: "dummy@mail.com"}}});
    });

    it("should fetch images if user is logged in", function () {
        spyOn(MindmapMetadata, 'findOne').and.returnValue({onlineUsers: []});
        var imageResource = extractUserImage();
        expect(imageResource).not.toBe(undefined);
    });

    it("should mock Meteor.users.find()", function () {
        spyOn(MindmapMetadata, 'findOne').and.returnValue({onlineUsers: []});
        expect(MindmapMetadata.findOne).toHaveBeenCalled();

    });

    it("Should return valid image url if present", function () {
        spyOn(MindmapMetadata, 'findOne').and.returnValue({
            _id:         "1",
            onlineUsers: [{
                profile: {name: "user 1"},
                picture: "www.dummyimage.com"
            }, {profile: {name: "user 2"}, picture: "www.dummyimage1.com"}]
        });
        var imageUrl = extractUserImage();
        expect(imageUrl.length).toBe(2);
    });

    it("Should request the fullscreen mode and hide the fullscreen button when document is not in full screen mode", function () {
        spyOn(screenfull, 'isFullscreen').and.returnValue(false);
        spyOn(screenfull, 'request').and.returnValue(false);

        App.toggleFullscreen();

        expect(screenfull.request).toHaveBeenCalled();
        expect(document.getElementById("fullscreen-btn")).toBe(null);
    });
});