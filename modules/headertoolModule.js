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
        text                      :                 null,
        cjs                       :                 false,
        
        LOG:function (text){
              const consoleJSM = Components.utils.import("resource://gre/modules/devtools/Console.jsm", {});   
              let console = consoleJSM.console; 
              console.log(text); 
        },

        setText:function (s){
                this.LOG("set text   \n\n"+this.text);        
                this.text=s;
                try{
                    this.parser(this.text);
                }catch(e){
                  this.LOG("loading headers ko "+e);
                }
                
        },
        
        setCountinuosJS: function(b){
                this.cjs=b;
        },
        
        getWin: function(){
           var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
           var win = wm.getMostRecentWindow(null);
           return win;
        },

        observe: function(subject, topic, data)  {
              if(topic == "http-on-examine-response"){
                //WiP: expansion poin for future release modify the full HTTP incoming rq
                return true;
              }

              if (topic == "http-on-modify-request" ) {

                  this.LOG(topic+": (" + subject + ") mod request");

                  var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
                  var currURL = httpChannel.URI.spec

                  try{
                          this.LOG("apply headers on URL : "+currURL);
                          this.LOG("cjs    : "+this.cjs);
                          if(this.cjs){
                            this.LOG("reload js  \n\n"+this.text);
                            try{
                              this.parser(this.text,httpChannel);
                            }catch(e){
                              this.LOG("reload js ko "+e);
                            }
                          }
                  
                          for (var i in headerMap) {
                                  var patt=new RegExp(i,"i");
                                  var test=patt.test(currURL);
                                  this.LOG("regexp test "+i+":"+test);
                    
                                  if(test){
                                      for (var e in headerMap[i]) {
                                       
                                        //note: header starting with ">" and "<" cannot be set because now have a semantic
                                        if( e.charAt(0) == '<' ){
                                            //trim the extra flow command
                                            this.LOG('setResponseHeader < ' + e + ', value is: ' + headerMap[i][e]);
                                            httpChannel.setResponseHeader(e.substring(1), headerMap[i][e], false);
                                        }else if( e.charAt(0) == '>' ){
                                            //trim the extra flow command
                                            this.LOG('setRequestHeader > ' + e + ', value is: ' + headerMap[i][e]);
                                            httpChannel.setRequestHeader(e.substring(1), headerMap[i][e], false);
                                        }else{
                                            // any char other char just the default as rq
                                            this.LOG('setRequestHeader > ' + e + ', value is: ' + headerMap[i][e]);
                                            httpChannel.setRequestHeader(e, headerMap[i][e], false);
                                        }
                                        
                                      }
                                  }     

                          }
                  }catch(ex){}          
                  return true;
              }


              if (topic == "profile-after-change") {

                  this.LOG("profile-after-change");

                  var os = Components.classes["@mozilla.org/observer-service;1"]
                                     .getService(Components.interfaces.nsIObserverService);

                  os.addObserver(this, "http-on-modify-request", false);
                  //os.addObserver(this, "http-on-examine-response", false);
                  return true;
              }
          },

          register: function()  {
            this.LOG("register");
            var c = Components.classes["@mozilla.org/observer-service;1"]
                              .getService(Components.interfaces.nsIObserverService);
                                
            c.addObserver(this, "http-on-modify-request", false);
            //c.addObserver(this, "http-on-examine-response", false);
            this.LOG("register done");
            return "ok";
          },

          unregister: function() {
            this.observerService().removeObserver(this, "http-on-modify-request");
            //this.observerService().removeObserver(this, "http-on-examine-response");
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
          
          
          
          
          //===========================================================================

             jsEngine:function(text,httpChannel){

                                var jsStart;
                                var jsEnd;
                                var s = new Components.utils.Sandbox("http://code.google.com/p/headertool/");
                                //importing utility method inside the sandbox
                                s.b64                    = headertoolModule.HeaderTool.b64;
                                s.href                   = headertoolModule.HeaderTool.href;
                                s.hostname               = headertoolModule.HeaderTool.hostname;
                                s.pathname               = headertoolModule.HeaderTool.pathname;
                                s.previous               = headertoolModule.HeaderTool.previous;
                                s.next                   = headertoolModule.HeaderTool.next    ;
                                s.search                 = headertoolModule.HeaderTool.search  ;
                                s.md5                    = headertoolModule.HeaderTool.md5;
                                s.sha1                   = headertoolModule.HeaderTool.sha1;
                                s.sha256                 = headertoolModule.HeaderTool.sha256;
                                s.crypto                 = headertoolModule.HeaderTool.crypto;
                                s.getChecksumType        = headertoolModule.HeaderTool.getChecksumType;
                                s.getPathname            = headertoolModule.HeaderTool.getPathname;
                                s.getSearch              = headertoolModule.HeaderTool.getSearch;  
                                s.getElementsByTagName   = headertoolModule.HeaderTool.getElementsByTagName;
                                // WiP : but seems an unhappy jurney
                                // s.getHeader              = headertoolModule.HeaderTool.getHeader;
                                // s.httpChannel            = httpChannel;
                                

                                while ((jsStart=text.indexOf("${")) > -1){ 
                                        jsEnd=-1;
                                        var code;
                                        do{        
                                                jsEnd= text.indexOf("}",jsEnd+1);

                                                code = text.substring(jsStart+2,jsEnd);
                                                var openJsStatement=0;
                                                
                                                for(var i=0;i<code.length ; ++i){
                                                        if(code.charAt(i) == '{')
                                                                ++openJsStatement;
                                                        else if(code.charAt(i) == '}')
                                                                --openJsStatement;
                                                }
                                                
                                                //when is missing the end } skip to the end
                                                if(jsEnd == -1){
                                                        jsEnd=text.length;
                                                        break;
                                                }
                                                
                                        }while(openJsStatement != 0 || jsEnd == -1);

                                        var result;
                                        try{
                                                result = Components.utils.evalInSandbox(code, s);
                                        }catch(e){
                                                this.LOG("[EE] "+code+"\n\n"+e);
                                                result=" [error] ";
                                        }
                                        text = text.substring(0,jsStart) + result + text.substring(jsEnd+1) ;

                                }
                                return text;
                        },

                        /* ===================================================================================== *
                         * MAIN PARSER LOGIC
                         * ===================================================================================== */

                        parser : function(text, httpChannel) {

                                if(text==null){
                                        //if no code is provided load from editor
                                        var text = this.getCode();
                                }


                                this.clear();

                                text = this.jsEngine(text, httpChannel);

                                //alert("text:"+text);

                                var lines = text.split("\n"); 

                                var map=new Array();
                                var regexp="^.";

                                for(var i in lines){
                                        //skip line starting as comment 
                                        if(lines[i].length<2 || lines[i].charAt(0)=='#') //warren-bank fix on length
                                                continue;

                                        //a regexp is applied
                                        if(lines[i].charAt(0)=='@'){        
                                                this.put(regexp,map);
                                                map=new Array();
                                                regexp=lines[i].substring(1);
                                                continue;
                                        }

                                        //skip not valid line misssing semicolon
                                        if(lines[i].indexOf(":") == -1)
                                                continue;

                                        //skip comments in the middle 
                                        var comment = lines[i].indexOf("#");
                                        if(comment>-1)
                                                lines[i] = lines[i].substring(0,comment);



                                        var com = lines[i].split(":");
                                        try {
                                                //trim the header name
                                                while (com[0].indexOf(" ") > -1){ 
                                                        com[0] = com[0].replace(" ","");
                                                }
                                                while (com[0].indexOf("\t") > -1){ 
                                                        com[0] = com[0].replace("\t","");
                                                }
                                                var header = "";
                                                //ignore multy :        
                                                for(var i in com){
                                                        if(i==1){
                                                                header+=com[i];
                                                        }else if(i>1){
                                                                header+=":"+com[i];
                                                        }
                                                }

                                                map[com[0]]=header;
                                        } catch (anError) {
                                                dump("ERROR: " + anError);
                                        }

                                }

                                this.put(regexp,map);

                        },
                        /**
                              nsICryptoHash facility conversion algorithm
                              MD2            1         Message Digest Algorithm 2
                              MD5            2         Message-Digest algorithm 5
                              SHA1           3         Secure Hash Algorithm 1
                              SHA256         4         Secure Hash Algorithm 256
                              SHA384         5         Secure Hash Algorithm 384
                              SHA512         6         Secure Hash Algorithm 512
                         */
                        getChecksumType: function   (checksum) {
                                //checksum = checksum.toLowerCase();
                                switch(checksum) {
                                case 'md2'   : return 1; break;
                                case 'md5'   : return 2; break;
                                case 'sha1'  : return 3; break;
                                case 'sha256': return 4; break;
                                case 'sha384': return 5; break;
                                case 'sha512': return 6; break;
                                default: return false;
                                }
                        },

                        crypto:function (algorithm, str){
                                var converter =
                                        Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                                        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

                                // we use UTF-8 here, you can choose other encodings.
                                converter.charset = "UTF-8";
                                // result is an out parameter,
                                // result.value will contain the array length
                                var result = {};
                                // data is an array of bytes
                                var data = converter.convertToByteArray(str, result);
                                var ch = Components.classes["@mozilla.org/security/hash;1"]
                                .createInstance(Components.interfaces.nsICryptoHash);
                                var type = headertoolModule.HeaderTool.getChecksumType(algorithm);                      
                                ch.init(type /*ch.MD5*/);
                                ch.update(data, data.length);
                                var hash = ch.finish(false);

                                // return the two-digit hexadecimal code for a byte
                                function toHexString(charCode)
                                {
                                        return ("0" + charCode.toString(16)).slice(-2);
                                }

                                // convert the binary hash data to a hex string.
                                var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
                                return s;
                        },


                        getHeader:function(x){
                               var rqh = this.httpChannel.getRequestHeader(x);
                               var rsh = this.httpChannel.getResponseHeader(x);
                               return rqh?rqh:rsh;
                        },

                       
                        previous:function(){
                                var win = headertoolModule.HeaderTool.getWin(); return win.history.previous;
                        },
                        next:function(){
                                var win = headertoolModule.HeaderTool.getWin(); return win.history.next;
                        },
                        b64: function (x){
                                var win = headertoolModule.HeaderTool.getWin(); return win.btoa(x);
                        },

                        sha1:function(x){
                                return headertoolModule.HeaderTool.crypto("sha1",x);
                        },

                        md5:function(x){
                                return headertoolModule.HeaderTool.crypto("md5",x);
                        },

                        sha256:function(x){
                                return headertoolModule.HeaderTool.crypto("sha256",x);
                        },

                        getElementsByTagName:function(){
                                var win = headertoolModule.HeaderTool.getWin(); return win.content.document.getElementsByTagName(x);
                        },

                       /**Gets the name of the window.*/
                        windowName:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.name;
                        },

                        /*
                         *  LOCATIONS FUNCTIONS
                         */

                        /**Is a DOMString containing the whole URL.*/
                        href:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.href;
                        },
                        /**Is a DOMString containing the protocol scheme of the URL, including the final ':'.*/
                        protocol:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.protocol;
                        },
                        /**Is a DOMString containing the host, that is the hostname, a ':', and the port of the URL.*/
                        host:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.host;
                        },
                        /**Is a DOMString containing the domain of the URL.*/
                        hostname:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.hostname;
                        },
                        /**Is a DOMString containing the port number of the URL.*/
                        port:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.port;
                        },
                        /**Is a DOMString containing an initial '/' followed by the path of the URL.*/
                        pathname:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.pathname;
                        },
                        /**Is a DOMString containing a '?' followed by the parameters of the URL.*/
                        search:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.search;
                        },
                        /**Is a DOMString containing a '#' followed by the fragment identifier of the URL.*/
                        hash:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.hash;
                        },
                        /**Is a DOMString containing the username specified before the domain name.*/
                        username:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.username;
                        },
                        /**Is a DOMString containing the password specified before the domain name.*/
                        password:function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.password;
                        },
                        /**Returns a DOMString containing the canonical form of the origin of the specific location.*/
                        origin :function(){
                           var win = headertoolModule.HeaderTool.getWin(); return win.content.location.origin ;
                        },

                        /**Left overload for retrocompattibility*/
                        getPathname:function(){
                                var win = headertoolModule.HeaderTool.getWin(); return win.content.location.pathname;
                        },
                        /**Left overload for retrocompattibility*/
                        getSearch:function(){
                                var win = headertoolModule.HeaderTool.getWin(); return win.content.location.search;
                        },



}

headertoolModule.HeaderTool.register();
