var a=/^-+$/,n=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)  ?\d{1,2} \d{2}:\d{2}(:\d{2})? [A-Z]{3,4} \d{4} - /,c=/^[\w+.-]+@[\w.-]+/;const o={name:"rpmchanges",token:function(t){return t.sol()&&(t.match(a)||t.match(n))?"tag":t.match(c)?"string":(t.next(),null)}};var i=/^(i386|i586|i686|x86_64|ppc64le|ppc64|ppc|ia64|s390x|s390|sparc64|sparcv9|sparc|noarch|alphaev6|alpha|hppa|mipsel)/,p=/^[a-zA-Z0-9()]+:/,l=/^%(debug_package|package|description|prep|build|install|files|clean|changelog|preinstall|preun|postinstall|postun|pretrans|posttrans|pre|post|triggerin|triggerun|verifyscript|check|triggerpostun|triggerprein|trigger)/,m=/^%(ifnarch|ifarch|if)/,s=/^%(else|endif)/,u=/^(\!|\?|\<\=|\<|\>\=|\>|\=\=|\&\&|\|\|)/;const h={name:"rpmspec",startState:function(){return{controlFlow:!1,macroParameters:!1,section:!1}},token:function(t,e){var r=t.peek();if(r=="#")return t.skipToEnd(),"comment";if(t.sol()){if(t.match(p))return"header";if(t.match(l))return"atom"}if(t.match(/^\$\w+/)||t.match(/^\$\{\w+\}/))return"def";if(t.match(s))return"keyword";if(t.match(m))return e.controlFlow=!0,"keyword";if(e.controlFlow){if(t.match(u))return"operator";if(t.match(/^(\d+)/))return"number";t.eol()&&(e.controlFlow=!1)}if(t.match(i))return t.eol()&&(e.controlFlow=!1),"number";if(t.match(/^%[\w]+/))return t.match("(")&&(e.macroParameters=!0),"keyword";if(e.macroParameters){if(t.match(/^\d+/))return"number";if(t.match(")"))return e.macroParameters=!1,"keyword"}return t.match(/^%\{\??[\w \-\:\!]+\}/)?(t.eol()&&(e.controlFlow=!1),"def"):(t.next(),null)}};export{o as rpmChanges,h as rpmSpec};
