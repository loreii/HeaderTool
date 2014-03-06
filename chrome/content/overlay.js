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

/* 
  This tools i based in first instace on :
   - https://developer.mozilla.org/en/how_to_build_an_xpcom_component_in_javascript
   - https://developer.mozilla.org/en/Setting_HTTP_request_headers
 */

Components.utils.import("resource://headertool/common.js");
Components.utils.import("resource://headertool/headertoolModule.js");


/* ===================================================================================== *
 * HTNamespace namespace.
 * ===================================================================================== */

if (typeof (headertool) == "undefined") {

        /* ========================================== *
         *    Namespace inizialization 
         * ========================================== */        
        var headertool = {                                                                         
                        text                                  : ""   , 
                        preferencies                          : null ,
                        supportstrings                        : null ,
                        window_about                          : null ,  // about+help window
                        logEnable                             : false,  
                        globalfile                            : null ,
                        initialized                           : false,
                        
                        LOG:function (text){
                                if(headertool.logEnable == false)
                                        return; 
                                var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                .getService(Components.interfaces.nsIConsoleService);
                                consoleService.logStringMessage(text);
                        },

                        onMenuItemCommand: function(e) {
                                headertool.LOG("onMenuItemCommand" + e);
                                var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                .getService(Components.interfaces.nsIPromptService);
                        },

                        onToolbarButtonCommand: function(e) {
                                headertool.LOG("onToolbarButtonCommand " + e);
                                headertool.onMenuItemCommand(e);
                        },
                       
                        /* ===================================================================================== *
                         * Initializes this object.
                         * ===================================================================================== */
                        startup : function() {
                                
                                headertool.LOG("Initialization ("+headertool.initialized+")");
                                try{
                                if(headertool.initialized==false){
                                        

                                        headertool.preferencies = Components.classes["@mozilla.org/preferences-service;1"]
                                        .getService(Components.interfaces.nsIPrefService)
                                        .getBranch("extensions.headertool.preferencies.");

                                        headertool.supportstrings = Components.classes["@mozilla.org/supports-string;1"]
                                        .createInstance(Components.interfaces.nsISupportsString);

                                        headertool.LOG("Initialization... [done]");
                                }
                                }catch(exx){
                                        headertool.LOG("Initialization... [ KO ] " +exx );
                                }
                                // initialization code
                                this.initialized = true;
                        },

                        shutdown : function() {
                                headertool.LOG("Shutdown invocation!");
                        },

                        getCode:function(){
                                try{ 
                                        return headertool.text;
                                }catch(exx){
                                        headertool.LOG("Exception in getCode -> \n'"+exx+"'");
                                        return "";
                                }
                        },  
                        
                        setCode:function(value){
                                try{ 
                                        var txt = null;
                                        try{
                                            txt = document.getElementById("headerText");
                                        }catch(exx){
                                            txt = document.getElementById("sidebar").contentDocument.getElementById("headerText")
                                        }
                                        headertool.text=value;
                                        return txt.value=value;
                                }catch(exx){
                                        
                                        headertool.LOG("Exception in setCode -> \n'"+exx+"'");
                                }
                        },

                        /* ===================================================================================== *
                         *  DISPLAY THE ABOUT WINDOW
                         * ===================================================================================== */
                        openAbout : function() {
                                if(this.window_about == null || this.window_about.closed){
                                        this.window_about = window.open("chrome://headertool/content/about.html",
                                                        "Header Tool About", "resizable=yes,scrollbars=yes,status=yes,width=520,height=230");
                                }else{
                                        this.window_about.focus();
                                };
                        },


                        /* ===================================================================================== *
                         *  SAVED HEADER FUNCTIONS
                         * ===================================================================================== */
                        loadPref:function(e){
                                headertool.LOG("Loading Preferencies ("+e+")");  
                                var value=false;
                                // Init preferencies
                                try{

                                        value = headertool.preferencies.getBoolPref("onoff"); 
                                        headertool.LOG("Preference onoff : "+value);      
                                        var text = headertool.preferencies.getComplexValue("editor",
                                                        Components.interfaces.nsISupportsString).data;

                                        headertool.text = text;
                                        
                                        if(value==true){
                                                headertool.parser(text);
                                                headertool.LOG("Reset UI...");      
                                                //Reset UI
                                                document.getElementById("headertool_button_apply").setAttribute('disabled', 'true');
                                                document.getElementById("headertool_button_clear").setAttribute('disabled', 'false');
                                        }

                                        headertool.LOG("Startup with editor value -> \n'"+text+"'");  
                                }catch(exx){
                                        headertool.LOG("Exception during loading preferencies : "+exx+"");  
                                        headertool.preferencies.setBoolPref("onoff", false); 
                                }

                           
                                
                                headertool.setCode( headertool.text );
                                headertool.LOG("Loading Preferencies... [done]");
                                
                        },

                        savePref : function (){
                                try{
                                        headertool.LOG("Preferencies saving..");

                                        headertool.supportstrings.data = window.document.getElementById("headerText").value;
                                        
                                        headertool.preferencies.setComplexValue("editor", 
                                                        Components.interfaces.nsISupportsString, headertool.supportstrings);
                                        
                                        headertool.setCode( headertool.supportstrings.data );
                                        
                                        headertool.LOG("Preferencies saving .. [done]");
                                }catch(ee){
                                        headertool.LOG("Preferencies saving .. [fail]\n"+ee);
                                }
                        },

                        togleOnOff: function() {

                                var value = headertool.preferencies.getBoolPref("onoff"); 
                                headertool.preferencies.setBoolPref("onoff", !value); 
                                headertool.LOG("Togle to "+!value);
                        },

                        setCountinuosJS: function(b) {
                                    headertoolModule.HeaderTool.setCountinuosJS(b)
                        },


                        /* ===================================================================================== *
                         * MAIN PARSER LOGIC
                         * ===================================================================================== */

                        parser : function(text) {
                                if(text==null){
                                        //if no code is provided load from editor
                                        var text = this.getCode();
                                }

                                headertoolModule.HeaderTool.setText(text)
                                headertool.togleOnOff();
                        },


                        /* ======================================= *
                         * Remove the headers set 
                         * ======================================= */
                        clear : function() {
                                headertoolModule.HeaderTool.clear();
                                headertool.togleOnOff();
                        },


                        /* ======================================================================================= *
                         * Take the current editor code, add a new menu item putting as a value the editor code.
                         * Is called by the save as button
                         * ======================================================================================= */
                        loadCurrentConfiguration : function(){

                                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                                var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                                fp.init(window, "Select a File", nsIFilePicker.modeOpen);
                                var res = fp.show();
                                if (res == nsIFilePicker.returnOK){
                                        var thefile = fp.file;

                                        // open an input stream from file
                                        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                                        createInstance(Components.interfaces.nsIFileInputStream);
                                        istream.init(thefile, 0x01, 0444, 0);
                                        istream.QueryInterface(Components.interfaces.nsILineInputStream);

                                        // read lines into array
                                        var line = {};
                                        var lines = "";
                                        var hasmore;
                                        do {
                                                hasmore = istream.readLine(line);
                                                lines += (line.value)+"\n"; 
                                        } while(hasmore);
                                        headertool.LOG("Preferencies loading \n"+lines);
                                        headertool.setCode(lines);  
                                        istream.close();
                                        //window.document.getElementById("headerText").setAttribute("saved",lines);

                                }

                        },

                        /* ======================================================================================= *
                         * Take the menu item value and set it into the editor code, i called on select by menuitem
                         * ======================================================================================= */
                        saveCurrentConfiguration : function(){

                                if(this.globalfile==null){

                                        var nsIFilePicker = Components.interfaces.nsIFilePicker;
                                        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                                        fp.init(window, "Select a File", nsIFilePicker.modeOpen);
                                        var res = fp.show();
                                        if (res == nsIFilePicker.returnOK){
                                                var thefile = fp.file;
                                                headertool.save(thefile); 
                                        }
                                }else{
                                        headertool.save(this.globalfile); 
                                }

                        },

                        save : function(thefile){
                                // file is nsIFile, data is a string
                                var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                                createInstance(Components.interfaces.nsIFileOutputStream);

                                // use 0x02 | 0x10 to open file for appending.
                                foStream.init(thefile, 0x02 | 0x08 | 0x20, 0666, 1); 
                                // write, create, truncate
                                // In a c file operation, we have no need to set file mode with or operation,
                                // directly using "r" or "w" usually.

                                // if you are sure there will never ever be any non-ascii text in data you can 
                                // also call foStream.writeData directly
                                var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                                createInstance(Components.interfaces.nsIConverterOutputStream);
                                converter.init(foStream, "UTF-8", 0, 0);
                                var data = headertool.getCode();
                                headertool.LOG(" saving \n"+data);
                                converter.writeString(data);
                                converter.close(); // this closes foStream}
                                headertool.LOG("saving .. [done]");
                        },

                        /*
                         * Take the menu item value and set it into the editor code, i called on select by menuitem
                         */
                        saveAsCurrentConfiguration : function(){

                                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                                var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                                fp.init(window, "Select a File", nsIFilePicker.modeOpen);
                                var res = fp.show();
                                if (res == nsIFilePicker.returnOK){
                                        var thefile = fp.file;
                                        this.globalfile=thefile;
                                        save(thefile); 
                                }
                        },

                        copyToClip:function(text){
                                var gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
                                getService(Components.interfaces.nsIClipboardHelper);  
                                gClipboardHelper.copyString(text);  
                        },

                        serialize:function(trailing,text){
                                try{
                                        text = headertoolModule.HeaderTool.jsEngine(text);
                                        var lines = text.split("\n"); 
                                        var result = "";
                                        for(var i in lines){
                                                //skip line starting as comment
                                                if(lines[i].length<2 || lines[i].charAt(0)=='#')
                                                        continue;

                                                //a regexp is applied
                                                if(lines[i].charAt(0)=='@'){        
                                                        continue;
                                                }

                                                //skip not valid line misssing semicolon
                                                if(lines[i].indexOf(":") == -1)
                                                        continue;

                                                //skip comments in the middle 
                                                var comment = lines[i].indexOf("#");
                                                if(comment>-1)
                                                        lines[i] = lines[i].substring(0,comment);

                                                result+=" "+trailing+"'"+lines[i]+"' \\\n";
                                        }
                                        headertool.copyToClip(result);
                                }catch(e){
                                        alert(e);
                                }
                        },


        };//END OF NAMESPACE

        /**
         * Constructor.
         */
        (function() {
                headertool.startup();
        }).apply(headertool);


};


window.addEventListener("load", headertool.loadPref, false);
