describe('analytics.countMaps', function () {
  it("should have called Meteor method to update map count", function () {
    spyOn(Meteor, "call");
    App.setMapsCount();
    expect(Meteor.call).toHaveBeenCalled();
  });
});