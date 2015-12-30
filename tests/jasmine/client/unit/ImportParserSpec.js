describe('App.ImportParser', function () {
  var importParser;
  var mindmapService;
  beforeEach(function () {
    importParser = App.ImportParser.getInstance();
    mindmapService = new MindMapService();
  });

  it("should be able to access parser object globally", function () {
    expect(importParser).not.toBeNull();
  });

  it("Parser should set errorMessage to 'Invalid XML format', and should return null if invalid xml file is given", function () {
    var xmlString = "<node>testString</map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Invalid XML format");
    expect(id).toBeNull();
  });


  it("Parser should set errorMessage to 'Not a mindmap: Invalid mindmap file' if document root node is not <map> ", function () {
    var xmlString = "<node>testString</node>";
    importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Not a mindmap: Invalid mindmap file");
  });

  it("Parser should return null if root node is not <map> ", function () {
    var xmlString = "<node>testString</node>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(id).toBeNull();
  });

  it("Parser should set errorMessage to 'Not a mindmap: Root node not found', and should return null if no root nodes are present ", function () {
    var xmlString = "<map></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Not a mindmap: Root node not found");
    expect(id).toBeNull();
  });

  it("Parser should set errorMessage to 'Not a mindmap: Non 'node' element found, and should return null if root node is something other than node present ", function () {
    var xmlString = "<map><Node></Node></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Not a mindmap: Non 'node' element found");
    expect(id).toBeNull();
  });

  it("Parser should set errorMessage to 'Not a mindmap: non 'node' element found', and should return null if anything else than 'node' is present as xml element in the childNodes ", function () {
    var xmlString = "<map><node><Node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></Node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Not a mindmap: Non 'node' element found");
    expect(id).toBeNull();
  });

  it("Parser should set errorMessage to 'Not a mindmap: Multiple root nodes found', and should return null if more than one root nodes are present ", function () {
    var xmlString = "<map><node></node><node></node></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Not a mindmap: Multiple root nodes found");
    expect(id).toBeNull();
  });

  it("Parser should set errorMessage to 'Not a mindmap: POSITION attribute not found in child node of root node', and should return null if any immediate child node of root node does not contain POSITION attribute ", function () {
    var xmlString = "<map><node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\"></node></node></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Not a mindmap: POSITION attribute not found in child node of root node");
    expect(id).toBeNull();
  });

  it("Parser should not set errorMessage to 'Not a mindmap: POSITION attribute not found in child node of root node' if inner child node does not contain POSITION attribute ", function () {
    var xmlString = "<map><node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("");
    expect(id).not.toBeNull();
  });

  it("Parser should not set errorMessage and should return not null for a valid mindmap", function () {
    var xmlString = "<map><node ID=\"moFEj3x3nWGmd4mop\" TEXT=\"TempMM\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    var id = importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(importParser.errorMessage).toBe("");
    expect(id).not.toBeNull();
  });

  it("mindmapService.createRootNode method should be called exactly once on valid mindmap file", function () {
    var xmlString = "<map><node ID=\"moFEj3x3nWGmd4mop\" TEXT=\"TempMM\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    var id = importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(mindmapService.createRootNode.calls.count()).toEqual(1);
  });

  it("mindmapService.addNode method should be called exactly 3 times on valid mindmap file", function () {
    var xmlString = "<map><node ID=\"moFEj3x3nWGmd4mop\" TEXT=\"TempMM\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    var id = importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(mindmapService.addNode.calls.count()).toEqual(3);
  });


});
