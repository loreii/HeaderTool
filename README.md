Header Tool
============
You can easy _modify header_ on each HTTP call on the **Mozilla Firefox**.
The tool is based on the same main stream idea of modify header but use a more simple text editor interface more quicker do edit and to store and save for multiple and repeated test cases.

**Download from** [addons.mozilla.org](https://addons.mozilla.org/it/firefox/addon/header-tool/)

Using this tool you can easy modify header on each HTTP call on the **Mozilla Firefox**.
The tool is based on the same main stream idea of modify header but use a more simple text editor interface more quicker do edit and to store and save for multiple and repeated test cases. As example you can save your header in a simple txt file and reuse it just cut _crtl+C_ and pasting _crtl+V_ it. If you find an issue or you have an idea on how improve this plugin pleasepen a ticket, as soon as possible i'll try to fix it. If you are a developer don't hesitate to send to me the patch   

*Strengths* : **simplicity, _JS_ substitution like base 64, quick changes can do easy.**

Support for _JS_ substitution in **${ }** statement that permit you to do as example : 

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

Javascript can be refreshed dinamically for each HTTP request selecting the countinuos checkbox (since version 0.6.0).

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
regular expression set of header. Since this line all the headers comes above is
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
    @prod                       //the following headers is enabled only for URI with "prod" inside
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
- open a site for header visualization *http://w3bt00l.tk/* or optimized for Header Tool *https://w3bt00l.appspot.com/ht*
- cut&past in the the header in the text area

