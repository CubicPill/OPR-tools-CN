# OPR-tools-CN
A plugin for ingress OPR page    
![](https://ws1.sinaimg.cn/large/e43735f5ly1fhmckbc988j21kx1fwnpd.jpg)     
Edited from [opr-tools](https://gitlab.com/1110101/opr-tools/) on Gitlab. Specially customized for Mainland China users      
Special thanks to original author [Oliwer Christ](https://gitlab.com/1110101)
## Features:
- Add links for Intel Map, OSM, Baidu Map, Tencent Map, and Baidu StreetView
- Buttons to submit common 1-star rating and remark with one click
- Add common ratings according to Niantic's [Guideline](https://opr.ingress.com/guide), automatically select the category of the candidate (Under develpoment)
## Features of Original Plugin:
- ~~Additional links to map services like Intel, OpenStreetMap, bing and some national ones~~
- Disabled annoying automatic page scrolling
- Automatically opens the first listed possible duplicate and the "What is it?" filter text box
- ~~Buttons below the comments box to auto-type common 1-star rejection reasons~~ 
- Percent of total reviewed candidates processed
- Translate text buttons for title and description
- Moved overall portal rating to same group as other ratings
- Changed portal markers to small circles, inspied by IITC style
- Made "Nearby portals" list and map scrollable with mouse wheel
- **Keyboard navigation (Keys 1-5, Space to confirm, Esc, Shift, Tab for navigation + Keys on NUMPAD)**
## Known Issues
- Sometimes the script will fail to initialize, especially at the first time of page loading.
- After clicking the one-key rating button for 1-star items, the "Cancel" button on confirmation dialog may fail to function normally. You can cancel your decision by clicking the blank areas outside the dialog
- The script will fail to work on FireFox, and I don't know why. So please use Google Chrome with Tampermonkey.
