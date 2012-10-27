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

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://headertool/common.js");



headertoolModule.HeaderTool = {
          
        headerMap                 :                 new Array(),
                  
        LOG:function (text){
              //var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
              //consoleService.logStringMessage(text);
        },

        observe: function(subject, topic, data)  {
              if (topic == "http-on-modify-request") {

                  this.LOG("http-on-modify-request : (" + subject + ") mod request");

                  var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
                  var currURL = httpChannel.URI.spec

                  try{
                          this.LOG("apply headers on URL : "+currURL);
                  
                          for (var i in headerMap) {
                                  var patt=new RegExp(i,"i");
                                  var test=patt.test(currURL);
                                  this.LOG("regexp test "+i+":"+test);
                    
                                  if(test)
                                      for (var e in headerMap[i]) {
                                        this.LOG('key is: ' + e + ', value is: ' + headerMap[i][e]);
                                        httpChannel.setRequestHeader(e, headerMap[i][e], false);
                                      }

                          }
                  }catch(ex){}          
                  return;
              }


              if (topic == "profile-after-change") {

                  this.LOG("profile-after-change");

                  var os = Components.classes["@mozilla.org/observer-service;1"]
                                    .getService(Components.interfaces.nsIObserverService);

                  os.addObserver(this, "http-on-modify-request", false);
                  return;
              }
          },

	  register: function()  {
            this.LOG("register");
            var c = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
                            
            c.addObserver(this, "http-on-modify-request", false);
            this.LOG("register done");
            return "ok";
          },

          unregister: function() {
            this.observerService().removeObserver(this, "http-on-modify-request");
          },
        
          /* ================================ *
           * Map handling functions
           * ================================ */ 
          put: function(key,value){
            headerMap[key]=value;
          },
          
          remove: function(key){
            delete headerMap[key];
          },
          
          clear: function(){
            headerMap= new Array();
          },
          


}

headertoolModule.HeaderTool.register();
