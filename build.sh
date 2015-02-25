
#xpidl=/usr/lib/xulrunner-devel-1.9.1/bin/xpidl -m typelib -w -v -I /usr/lib64/xulrunner-devel-1.9.1/idl/ -e xpcom/HeaderTool.xpt xpcom/HeaderTool.idl
#/home/lore/Downloads/xulrunner-sdk/bin/xpidl -m typelib -w -v -I /home/lore/Downloads/xulrunner-sdk/idl/ -e xpcom/HeaderTool.xpt xpcom/HeaderTool.idl

#cp xpcom/HeaderTool.xpt components/
#cp xpcom/HeaderTool.js components/
rm ht.xpi
#remove temporary files
find ./ -name '*~'  -exec rm '{}' \; -print
zip ht.xpi -r * -x xpcom\* build.sh example\* \*svn\* \*git\*
