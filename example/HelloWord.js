Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function HelloWorld() { }

HelloWorld.prototype = {
  classDescription: "My Hello World Javascript XPCOM Component",
  classID:          Components.ID("{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"),
  contractID:       "@dietrich.ganx4.com/helloworld;1",
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIHelloWorld]),
  hello: function() { return "Hello World!"; }
};
var components = [HelloWorld];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}