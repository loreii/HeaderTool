/*
Header Tool permit the HTTP Header handling as Mozilla Firefox plugin
Copyright (C) 2011  Lorenzo Pavesi

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

/* This tools i based in first instace on the following tutorial :
   - https://developer.mozilla.org/en/how_to_build_an_xpcom_component_in_javascript
   - https://developer.mozilla.org/en/Setting_HTTP_request_headers
 */

/*
e5b1dd2b-f168-4ea0-b0c0-3cee132cbcac

{ 0xe5b1dd2b, 0xf168, 0x4ea0, \
  { 0xb0, 0xc0, 0x3c, 0xee, 0x13, 0x2c, 0xbc, 0xac } }

*/
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var headerMap = new Array();
  
  
function LOG(text){
//       var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
//       consoleService.logStringMessage(text);
}

function HeaderTool() {
this.wrappedJSObject = this;
}

HeaderTool.prototype = {
  classDescription: "Header Tool Javascript XPCOM Component",
  classID:          Components.ID("{e5b1dd2b-f168-4ea0-b0c0-3cee132cbcac}"),
  contractID:       "@headertool.googlecode.com/headertool;1",
  QueryInterface: XPCOMUtils.generateQI(),
  

  hello: function() { return "Hello World!"; },
 
  observe: function(subject, topic, data)
  {
      if (topic == "http-on-modify-request") {

          LOG("(" + subject + ") mod request");

          var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
/*	  
	  var strURI="";
	  try{
	    LOG("httpChannel:"+httpChannel.referrer.prePath+httpChannel.referrer.path);
	    strURI=(""+httpChannel.referrer.prePath+httpChannel.referrer.path);
	  }catch(anError) {
	    LOG("ERROR: " + anError);
	  }
	  
	  var currentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator)
					.getMostRecentWindow("navigator:browser");

	  var currBrowser = currentWindow.getBrowser();
	  var currURL = currBrowser.currentURI.spec;
*/	  
	  var currURL = httpChannel.URI.spec

try{
	  LOG("currURL:"+currURL);
	  
	  for (var i in headerMap) {
	    var patt=new RegExp(i,"i");
	    var test=patt.test(currURL);
	    LOG("regexp test "+i+":"+test);
	    
	    if(test)
	      for (var e in headerMap[i]) {
		LOG('key is: ' + e + ', value is: ' + headerMap[i][e]);
		httpChannel.setRequestHeader(e, headerMap[i][e], false);
	      }

	  }
}catch(ex){}          
          return;
      }


      if (topic == "profile-after-change") {

          LOG("profile-after-change");

          var os = Components.classes["@mozilla.org/observer-service;1"]
                             .getService(Components.interfaces.nsIObserverService);

          os.addObserver(this, "http-on-modify-request", false);
          return;
      }
  },
 

  put: function(key,value){
    headerMap[key]=value;
  },
  
  remove: function(key){
    delete headerMap[key];
  },
  
  clear: function(){
    headerMap= new Array();
  },
  
 
  /*QueryInterface: function (iid) {
        if (iid.equals(Components.interfaces.nsIObserver) ||
            iid.equals(Components.interfaces.nsISupports))
            return this;
        
        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    },*/
  
  /*observerService: function() {
    return Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
  },*/

  register: function()
  {
    LOG("register");
    var c = Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
		     
    c.addObserver(this, "http-on-modify-request", false);
    LOG("register done");
    return "ok";
  },


  unregister: function()
  {
    this.observerService().removeObserver(this, "http-on-modify-request");
  }

    
  
};//prototype end



/**
* XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
* XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
*/
if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([HeaderTool]);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule([HeaderTool]);
