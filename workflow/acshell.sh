#!/bin/bash

QUERY="$1"
ARG="$2"

###################################
## 1. LIST APPS TO EXTRACT ICONS ##
###################################

if [[ "$ARG" == "--start" ]]; then
	LIST=$(find /Applications -maxdepth 2 | egrep -i "\.app$" | grep -i "$QUERY")

	echo '<?xml version="1.0"?><items>
		<item>
			<arg>online^'$QUERY'</arg>
			<title>Search app icons online</title>
			<subtitle>Switch to online search in App Store and Mac App Store</subtitle>
		</item>'
	while IFS= read -r line
	do
	appnm=$(basename "$line" | sed 's|.app||g')
	echo '<item>
			<arg>'$line'</arg>
			<title>'$appnm'</title>
			<icon type="fileicon">'$line'</icon>
		</item>'
	done <<< "$LIST"
	echo '</items>'

###################################
##     2. LIST ICONS TO FILE     ##
###################################

elif [[ "$ARG" == "--extract" ]]; then
	qr=$(echo "$QUERY" | awk -F'^' '{print $1}')
	argument=$(echo "$QUERY" | awk -F'^' '{print $2}')

	if [[ "$qr" == "online" ]]; then
		osascript -e 'tell application "Alfred 4" to run trigger "online" in workflow "com.dnnsmnstrr.alfred-workflow" with argument "'"$argument"'"'
	else
		appicon=$(python acpython.py "$QUERY/Contents/Info.plist" --local --icon)
		appicon=${appicon//.icns/}
		appname=$(python acpython.py "$QUERY/Contents/Info.plist" --local --name)

		sips -s format png "$QUERY/Contents/Resources/$appicon.icns" --out "$HOME/Desktop/$appname.png"

		osascript -e 'tell application "Alfred 4" to run trigger "notify" in workflow "com.dnnsmnstrr.alfred-workflow" with argument "'"$HOME/Desktop/$appname.png"'"'
	fi

###################################
##  3. DOWNLOAD ICON TO DESKTOP  ##
###################################

elif [[ "$ARG" == "--download" ]]; then
	IMGURL=$(echo "$QUERY" | awk -F'^' '{print $1}')
	IMGEXT=$(echo "$IMGURL" | awk -F'.' '{print $NF}')
	APPNM=$(echo "$QUERY" | awk -F'^' '{print $2}')
	DEV=$(echo "$QUERY" | awk -F'^' '{print $3}')

	curl -o "$HOME/Desktop/$APPNM.$IMGEXT" "$IMGURL"

	if [[ "$DEV" == "iOS" ]]; then
		python acpython.py "$HOME/Desktop/$APPNM.$IMGEXT" --mask
	fi

fi
