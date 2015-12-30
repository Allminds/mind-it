describe('create.helpers.map.js', function () {
  it("should be able to return selected node data", function () {
    var fixture = '<div id="mindmap"> ' +
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="9300"> ' +
      '<g transform="translate(14400,4650)"><g transform="translate(0,0)" class="node level-0 selected">' +
      '<ellipse rx="125.859375" ry="28.834375" class="root-ellipse"></ellipse>' +
      '<rect x="-95.859375" y="-18.5" width="191.71875" height="29.5"></rect>' +
      '<text cols="60" rows="4" y="9">' +
      '<tspan x="0" dy="0">New Mindmap</tspan>' +
      '</text></g></g></svg> ' +
      '</div>';
    setFixtures(fixture);
    var node= $(".node.level-0").eq(0);
    node.click();
    $('.selected')[0].__data__ = 123;
    expect(App.map.getDataOfNodeWithClassNamesString(".node.selected")).toBe(123);
  });

  it("should find a node for given criteria", function () {
    var child1 = {_id: "first"};
    var child2 = {_id: "second"};
    var nodeData = {
      _id: "root",
      children: [child1,child2]
    };
    var findCriteria = function (x) {
      return x._id == "first"
    };
    expect(App.map.findOne(nodeData, findCriteria),child1);
  });

  it("should add new node", function () {
    var child1 = {_id:"child1"};
    var child2 = {_id:"child2"};
    var parent = {_id:"parent", position:"right", children:[child1,child2]};
    var name = "child3";
    var dir = "right";

    var newNode = App.map.addNewNode(parent, name, dir);
    expect(newNode.name).toBe(name);
    expect(newNode.parent_ids).toEqual([parent._id]);
  });

  it("should show an editor on making a node editable", function() {
    var fixture = '<div id="mindmap"> ' +
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="9300"> ' +
      '<g transform="translate(14400,4650)"><g transform="translate(0,0)" class="node level-0 selected">' +
      '<ellipse rx="125.859375" ry="28.834375" class="root-ellipse"></ellipse>' +
      '<rect x="-95.859375" y="-18.5" width="191.71875" height="29.5"></rect>' +
      '<text cols="60" rows="4" y="9">' +
      '<tspan x="0" dy="0">New Mindmap</tspan>' +
      '</text></g></g></svg> ' +
      '</div>';
    setFixtures(fixture);
    $(".node.level-0")[0].__data__ = {};
    $(".node.level-0")[0].__data__._id = 123;

    spyOn(App, 'showEditor');
    App.map.makeEditable(123);
    expect(App.showEditor).toHaveBeenCalled();
  })
});
