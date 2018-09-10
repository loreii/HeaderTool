Header Tool
============
You can easily _modify header_ on each HTTP call on the **Mozilla Firefox**.
The tool is based on the same mainstream idea of modifying the header but uses a more simple text editor interface to more quickly edit, store and save for multiple and repeated test cases.

**Download from** [addons.mozilla.org](https://addons.mozilla.org/it/firefox/addon/header-tool/)

Using this tool you can easily modify the header on each HTTP call on the **Mozilla Firefox**.
The tool is based on the same mainstream idea of modifying the header but uses a more simple text editor interface to more quickly edit, store and save for multiple and repeated test cases. For example, you can save your header in a simple txt file and reuse it by just copying _crtl+C_ and pasting _crtl+V_ it to the Mozilla Firefox Header Tool sidebar (F10→Menu→View→Side Bar→Header Tool). If you find an issue or you have an idea on how to improve this plugin pleaseopen a ticket, as soon as possible i'll try to fix it. If you are a developer don't hesitate to send to me the patch   

*Strengths* : **simplicity, _JS_ substitution like base 64, quick changes can be done easy.**
to 
Support for _JS_ substitution in **${ }** statement that permits you to do, for example : 

    #========================================================================================
    X-USERNAME    : ${b64('foo')}                      #base64 encoding"
    X-NOW         : ${new Date()}                      #current date"
    #========================================================================================
    Authorization : Basic ${b64("username:password")}  #implement Base authentication easily
    #========================================================================================
    X-SUMS     : ${
                      var a = "";                      #or do complex things :P
                      for(i = 0; i<100;++i){
                           a+=i
                      }
                    a;
                  }
    #========================================================================================

Javascript can be refreshed dynamically for each HTTP request selecting the continuous checkbox (since version 0.6.0).

    #========================================================================================
    x-multiline-js: ${
    //split header def on multiple line
    "aaaaaaa"
    }
    #========================================================================================
    X-PATH   : ${
            encodeURIComponent(
              ""+getPathname()+getSearch()
          ) }
    #========================================================================================
    #this is a comment
    x-header-example  : thisIsThe.Value           #this is an inline comment
    x-header-example2 : an other text with spaces #this is an inline comment
    x-header-example3 : text with %&£ $imbol$     #this is an inline comment
    #========================================================================================

Crypto functionalities
------------------------

    X-MD5    : ${md5('message')}
    X-SHA1   : ${sha1('message')}
    X-SHA256 : ${sha256('message')}


Example
------------------------
    Accept-Charset:            # Remove this header
    Accept-Language:fr         # Change to "fr" for every request
    @.*gif                     # Work on any http://*.gif
    Accept:*/*                 # Change Accept request to */*


You can also use the internal function  crypto("sha1","plain text"); where the first argument can vary between:
 
- 'md2'  
- 'md5'  
- 'sha1' 
- 'sha256'
- 'sha384'
- 'sha512'

Regular Expression Support
--------------------------
You can use the "@" character at the first char in a line in order to specify a 
regular expression set of header. Since this line all the headers above are
activated *only* for the matching URI.

    #========================================================================================
    x-all-0 : header-value      //no @modification so is always enabled
    @serverURI_1
    x-all-1a : header-value     //is taken in account only for server with serverURI_1 
    x-all-1b : header-value     //is taken in account only for server with serverURI_1 
    @serverURI_2
    x-all-2 : header-value      //is taken in account only for server with serverURI_2

    x-all-0 : header-value      //no @modification so is always enabled
    x-all-1 : header-value
    @^https                     //the following two headers is enabled only for HTTPS
    x-all-1a : header-value     
    x-all-1b : header-value     
    @prod                       //the following headers are enabled only for URI with "prod" inside
    x-all-2 : header-value      
    #========================================================================================

Misc functionalities
--------------------------

    b64            :${ b64()}
    href           :${ href()}
    hostname       :${ hostname()}
    pathname       :${ pathname()}
    previous       :${ previous()} //history previous   
    next           :${ next()}     //history next
    search         :${ search()}
    md5            :${ md5()}
    sha1           :${ sha1("sample")}
    sha256         :${ sha256("sample")}
    crypto         :${ crypto("sha512","sample")}
    getChecksumType:${ getChecksumType()}
    getPathname    :${ getPathname()}
    getSearch      :${ getSearch()}

Move from Modify Headers
------------------------
If you are already using modify headers you can simply switch to this plugin just with the following steps :
- enable all the headers inside the modify headers Enable All Button
- open a site for header visualization *http://headers.online*
- cut&paste in the header in the text area

