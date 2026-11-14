#!/bin/bash
# usage: shotq.sh "<query>" <name>
cd "$(dirname "$0")"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --window-size=${XV_W:-1440},${XV_H:-900} --virtual-time-budget=4000 --screenshot="$(cygpath -w "$PWD/$2.png")" "http://localhost:${XV_PORT:-8766}/hurom-thaw/test/t.html?$1" 2>/dev/null
