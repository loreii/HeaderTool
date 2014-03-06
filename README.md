=Header Tool =
<p align="justify"><p>You can easy [https://addons.mozilla.org/it/firefox/addon/header-tool/ modify header] on each HTTP call on the *Mozilla Firefox*.
The tool is based on the same main stream idea of modify header but use a more simple text editor interface more quicker do edit and to store and save for multiple and repeated test cases. </p>
[https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=X92HTHRK33RX2&lc=GB&item_name=Header%20Tool%20Firefox%20Plugin&item_number=HeaderTool&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted https://www.paypalobjects.com/en_US/GB/i/btn/btn_donateCC_LG.gif]
<g:plusone size="medium">+1</g:plusone>

</p>
<p align="justify">
Using this tool you can easy modify header on each HTTP call on the *Mozilla Firefox*.
The tool is based on the same main stream idea of modify header but use a more simple text editor interface more quicker do edit and to store and save for multiple and repeated test cases. As example you can save your header in a simple txt file and reuse it just cut (crtl+C) and pasting (crtl+V) it. [https://www.ohloh.net/p/HeaderTool Ohloh code analysis]. If you find an issue or you have an idea on how improve this plugin please [http://code.google.com/p/headertool/issues/list open a ticket] on this site, as soon as possible i'll try to fix it. If you are a developer don't hesitate to send to me the patch ;)   Strengths : simplicity, JS substitution like base 64, quick changes can do easy. You need a CR (Change Request) click [http://code.google.com/p/headertool/issues/list  here]? </p>



Support for JS substitution in ${} statement that permit you to do as example : 

{{{
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

}}}
<p>
Javascript can be refreshed dinamically for each HTTP request selecting the countinuos checkbox (since version 0.6.0).
</p>

[http://headertool.googlecode.com/files/cjs.png]

{{{
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
}}}


{{{
#========================================================================================

#this is a comment
x-header-example  : thisIsThe.Value           #this is an inline comment
x-header-example2 : an other text with spaces #this is an inline comment
x-header-example3 : text with %&£ $imbol$     #this is an inline comment

}}}

*Crypto functionalities*
{{{
X-MD5    : ${md5('message')}
X-SHA1   : ${sha1('message')}
X-SHA256 : ${sha256('message')}
}}}

*Example *
{{{
Accept-Charset:            # Remove this header
Accept-Language:fr         # Change to "fr" for every request
@.*gif                     # Work on any http://*.gif
Accept:*/*                 # Change Accept request to */*
}}}

<p align="justify">
<p>You can also use the internal function  crypto("sha1","plain text"); where the first argument can vary between:
 
  * 'md2'  
  * 'md5'  
  * 'sha1' 
  * 'sha256'
  * 'sha384'
  * 'sha512'

</p>
</p>

*Regular Expression Support* ==new==
<p align="justify">
You can use the "@" character at the first char in a line in order to specify a 
regular expression set of header. Since this line all the headers comes above is
activated *only* for the matching URI.
</p>
{{{
x-all-0 : header-value      //no @modification so is always enabled
@serverURI_1
x-all-1a : header-value     //is taken in account only for server with serverURI_1 
x-all-1b : header-value     //is taken in account only for server with serverURI_1 
@serverURI_2
x-all-2 : header-value      //is taken in account only for server with serverURI_2
}}}


{{{
x-all-0 : header-value      //no @modification so is always enabled
x-all-1 : header-value
@^https                     //the following two headers is enabled only for HTTPS
x-all-1a : header-value     
x-all-1b : header-value     
@prod                       //the following headers is enabled only for URI with "prod" inside
x-all-2 : header-value      
}}}

==Move from Modify Headers==
If you are already using modify headers you can simply switch to this plugin just with the following steps :
  # enable all the headers inside the modify headers (Enable All Button)
  # open a site for header visualization ( http://w3bt00l.tk/ or optimized for Header Tool https://w3bt00l.appspot.com/ht)
  # cut&past in the the header in the text area

==ScreenCast==
<wiki:video url="http://www.youtube.com/watch?v=8gcrLk9KTdk"/>

==Screenshots==
[http://headertool.googlecode.com/files/logo.png]
===0.4.0 Series===
[http://headertool.googlecode.com/files/statusbar.png]
===0.3.5 Series===
[http://headertool.googlecode.com/files/snap_0.3.5g.png]
===0.3.4 Series===
[http://headertool.googlecode.com/files/snap.png]
===0.1.0 Series===
[http://headertool.googlecode.com/files/snapshot2.png]


[https://play.google.com/store/apps/details?id=it.loreii.wallpapers&feature=search_result#?t=W251bGwsMSwyLDEsIml0LmxvcmVpaS53YWxscGFwZXJzIl0. https://play.google.com/static/client/images/435140425-play_logo.png ]
