describe('Home page localstorage', function () {
  it("should clear mindmap related data", function () {
    clearNodeCollapsedState();
    var id = "";
    store.forEach(function (key) {
      if (key.indexOf("Meteor") == -1 && key.indexOf("amplify") == -1) {
        id = key;
      }
    });
    expect(id).toBe("");
  });
});