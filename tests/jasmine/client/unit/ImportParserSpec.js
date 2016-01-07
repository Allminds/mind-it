describe('App.ImportParser', function () {
  var importParser;
  var mindmapService;
  beforeEach(function () {
    importParser = App.ImportParser;
    mindmapService = App.MindMapService.getInstance();
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

  it("Parser should set errorMessage to 'Not a mindmap: Non 'node' element found', and should return null if root node is something other than 'node' ", function () {
    var xmlString = "<map><Node></Node></map>";
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

  it("Parser should set errorMessage to 'Internal Error', and return null, if no mindMap Service is provided", function () {
    var xmlString = "<map><node></node></map>";
    var id = importParser.createMindmapFromXML(xmlString);
    expect(importParser.errorMessage).toBe("Internal Error");
    expect(id).toBeNull();
  });

  it("Parser should set errorMessage to 'Not a mindmap: non 'node' element found', and should return document id if anything else than 'node' is present as xml element in the childNodes ", function () {
    var xmlString = "<map><node><Node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></Node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    var id = importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(importParser.errorMessage).toBe("Errors in mindMap file, mindMap rendered might not be as expected");
    expect(id).not.toBeNull();
  });

  it("Parser should set error message as true if anything else than 'node' is present as xml element in the childNodes ", function () {
    var xmlString = "<map><node><Node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></Node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(importParser.errorMessage).toBe("Errors in mindMap file, mindMap rendered might not be as expected")
  });

  it("Parser should not set errorMessage, and should not return null, if inner child node does not contain POSITION attribute ", function () {
    var xmlString = "<map><node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    var id = importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(importParser.errorMessage).toBe("");
    expect(id).not.toBeNull();
  });

  it("Parser should not set errorMessage, and should not return null, if nodes do not contain TEXT attribute ", function () {
    var xmlString = "<map><node><node ID=\"kzqFndthdwXF7bY8f\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    var id = importParser.createMindmapFromXML(xmlString, mindmapService);
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

  it("Parser should not set warningFlag to true for a valid mindmap", function () {
    var xmlString = "<map><node ID=\"moFEj3x3nWGmd4mop\" TEXT=\"TempMM\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    importParser.createMindmapFromXML(xmlString, mindmapService);
  });

  it("mindmapService.createRootNode method should be called exactly once on valid mindmap file", function () {
    var xmlString = "<map><node ID=\"moFEj3x3nWGmd4mop\" TEXT=\"TempMM\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "createRootNode");
    spyOn(mindmapService, "addNode");
    importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(mindmapService.createRootNode.calls.count()).toEqual(1);
  });

  it("mindmapService.addNode method should be called exactly 3 times the valid mindmap file", function () {
    var xmlString = "<map><node ID=\"moFEj3x3nWGmd4mop\" TEXT=\"TempMM\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"six\" POSITION=\"left\"></node><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"seven\" POSITION=\"left\"><node ID=\"kzqFndthdwXF7bY8f\" TEXT=\"eight\"></node></node></node></map>";
    spyOn(mindmapService, "addNode");
    importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(mindmapService.addNode.calls.count()).toEqual(3);
  });

  it("should ignore the xml hook, font, edge tag while parsing", function() {
    var xmlString = '<map version="1.0.1"><node COLOR="#000000" CREATED="1451903277484" ID="ID_926874691" MODIFIED="1451907657022" TEXT="New Mindmap"><font NAME="SansSerif" SIZE="20"/><hook NAME="accessories/plugins/AutomaticLayout.properties"/><node COLOR="#0033ff" CREATED="1451903278869" ID="ID_1801074106" MODIFIED="1451907657022" POSITION="right" TEXT="A"><edge STYLE="sharp_bezier" WIDTH="8"/><font NAME="SansSerif" SIZE="18"/></node></node></map>';
    spyOn(mindmapService, "addNode");
    importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(mindmapService.addNode.calls.count()).toEqual(1);

  });

  it("should return true for when xml has only the supported tags", function() {
    var xmlString = '<map version="1.0.1"><node COLOR="#000000" CREATED="1451903277484" ID="ID_926874691" MODIFIED="1451907657022" TEXT="New Mindmap"><font NAME="SansSerif" SIZE="20"/><hook NAME="accessories/plugins/AutomaticLayout.properties"/><node COLOR="#0033ff" CREATED="1451903278869" ID="ID_1801074106" MODIFIED="1451907657022" POSITION="right" TEXT="A"><edge STYLE="sharp_bezier" WIDTH="8"/><font NAME="SansSerif" SIZE="18"/></node></node></map>';
    var xmlDoc = App.ImportParser.prepareXMLDoc(xmlString).documentElement.childNodes;

    var isValid = App.ImportParser.areTagsSupported(xmlDoc);
    expect(isValid).toBe(true);
  });

  it("should return false some xml includes tags that are not supported", function() {
    var xmlString = '<map version="1.0.1"><invalid-tag></invalid-tag></map>';
    var xmlDoc = App.ImportParser.prepareXMLDoc(xmlString).documentElement.childNodes;

    var isValid = App.ImportParser.areTagsSupported(xmlDoc);
    expect(isValid).toBe(false);
  });

  it("should ignore top level comments", function() {
    var xmlString = '<map version="1.0.1"><!-- To view this file, download free mind mapping software FreeMind from http://freemind.sourceforge.net --><node COLOR="#000000" CREATED="1451994521804" ID="ID_164690743" MODIFIED="1451994563649" TEXT="New Mindmap"></node></map>'
    spyOn(mindmapService, "createRootNode");
    importParser.createMindmapFromXML(xmlString, mindmapService);
    expect(mindmapService.createRootNode.calls.count()).toEqual(1);
    expect(importParser.errorMessage).toBe("");
  })

});
