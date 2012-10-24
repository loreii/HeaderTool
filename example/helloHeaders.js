var headerName  = "X-hello";
var headerValue = "world";

function LOG(text)
{
        var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage(text);
}

function myHTTPListener() { }





myHTTPListener.prototype = {
    
  observe: function(subject, topic, data)
  { 
    LOG("----------------------------> observe enter topic:"+topic);
    
    if (topic == "http-on-modify-request") {

          LOG("----------------------------> (" + subject + ") mod request");

          var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
          httpChannel.setRequestHeader(headerName, headerValue, false);
          return;
      }


      if (topic == "profile-after-change") {

          LOG("----------------------------> profile-after-change");

          var os = Components.classes["@mozilla.org/observer-service;1"]
                             .getService(Components.interfaces.nsIObserverService);

          os.addObserver(this, "http-on-modify-request", false);
          return;
      }
  },
 
  QueryInterface: function (iid) {
        if (iid.equals(Components.interfaces.nsIObserver) ||
            iid.equals(Components.interfaces.nsISupports))
            return this;
        
        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    },
};

var myModule = {
    registerSelf: function (compMgr, fileSpec, location, type) {

        var compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(this.myCID,
                                        this.myName,
                                        this.myProgID,
                                        fileSpec,
                                        location,
                                        type);


          LOG("----------------------------> registerSelf");

        var catMgr = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
        catMgr.addCategoryEntry("app-startup", this.myName, this.myProgID, true, true);
    },


    getClassObject: function (compMgr, cid, iid) {

          LOG("----------------------------> getClassObject");

        return this.myFactory;
    },

    myCID: Components.ID("{9cf5f3df-2505-42dd-9094-c1631bd1be1c}"),

    myProgID: "@dougt/myHTTPListener;1",

    myName:   "Simple HTTP Listener",

    myFactory: {
        QueryInterface: function (aIID) {
            if (!aIID.equals(Components.interfaces.nsISupports) &&
                !aIID.equals(Components.interfaces.nsIFactory))
                throw Components.results.NS_ERROR_NO_INTERFACE;
            return this;
        },

        createInstance: function (outer, iid) {

          LOG("----------------------------> createInstance");

          return new myHTTPListener();
        }
    },

    canUnload: function(compMgr) {
        return true;
    }
};

function NSGetModule(compMgr, fileSpec) {
    return myModule;
}
