# OPR-tools-CN
A plugin for ingress OPR page    
![](https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/demo/screenshot.png)
![](https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/demo/dropdown.png)

Edited from [opr-tools](https://gitlab.com/1110101/opr-tools/) on Gitlab. Specially customized for Mainland China users      
Special thanks to original author [Oliwer Christ](https://gitlab.com/1110101) @1110101     
## Features:
- Add links for Intel Map, OSM, Baidu Map, Tencent Map, and Baidu StreetView
- Buttons to submit common 1-star rating and remark with one click
- Add common ratings according to Niantic's [Guideline](https://opr.ingress.com/guide), and automatically select the category of the candidate
- Match the possible duplicate portals by title
## Key Shortcuts
- D: Mark the current opened portal as duplicate
- S: Skip to the next candidate
- Key 1-5: Rate current highlighted item
- Space or Enter: Submit / Confirm dialog
- Esc: Reset highlight / Close dialog
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
- Sometimes the script will fail or be very slow to initialize, especially at the first time of page loading. Reloading will fix this issue.
- After clicking the one-key rating button for 1-star items, the "Cancel" button on confirmation dialog may fail to function normally. You can cancel your decision by clicking the blank areas outside the dialog.
- The script will fail to work on FireFox, and I don't know why. So please use Google Chrome with Tampermonkey.

If there are any feedback/new feature requirement, please create an issue.     

# OPR-tools-CN
OPR 页面辅助插件     
![](https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/demo/screenshot_zh_CN.png)
![](https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/demo/dropdown_zh_CN.png)

本项目由 Gitlab 上的 [opr-tools](https://gitlab.com/1110101/opr-tools/) 修改而来, 为中国大陆用户做了特别优化
感谢原作者 [Oliwer Christ](https://gitlab.com/1110101) @1110101      
## 主要功能:
- 增加了到 Intel, OSM, 百度地图, 腾讯地图和百度街景的跳转链接
- 增加了常见拒绝理由的按钮, 自动在评论框中添加拒绝原因并提交一星
- 按照 Niantic 发布的审核指导规则[英文版](https://opr.ingress.com/guide) [中文版](http://mp.weixin.qq.com/s/EdiIUE5s3B4iBOusRJ5q8Q) 在下拉菜单中添加了常见候选 portal, 自动打分并添加评论和种类
- 根据 portal 标题尝试自动匹配重复 portal
## 键盘快捷键
- D: 提交当前已打开的重复 portal
- S: 跳过当前 portal
- 数字键 1-5: 为当前高亮项目评分
- 空格或回车: 提交评分/确认对话框
- Esc: 重置高亮/取消对话框
## Features of Original Plugin:
- ~~增加了到 Intel, OSM, 必应和一些国家地图的链接~~
- 关闭页面的自动滚动
- 自动打开 "这是什么?" 选择列表
- ~~在评论框下增加可自动输入常见一星拒绝理由的按钮~~
- 浏览已被处理的审核占总审核数的百分比
- 增加标题和描述的翻译按钮
- 将 portal 总体评分移动到左侧评分区域中
- 受 IITC Portal 样式启发, 将 portal 标记更换为小圆圈
- "附近的 Portal" 列表可使用鼠标滚轮左右滚动
- **键盘评分 (数字 1-5 评分, 空格键确认, Esc, Shift, Tab 键及小键盘按键切换)**
## 已知问题
- 由于页面的 AJAX, 插件可能会在页面元素全部显示完成后一段时间后加载完成 (常见于初次页面加载), 刷新页面可解决此问题
- 评分一星后确认对话框的 "取消" 键可能会失去响应, 点击页面空白处即可返回审核页面
- 此脚本在火狐浏览器上暂不可用, 请使用 Chrome 浏览器 + Tampermonkey 插件

如果对插件有任何反馈或新功能需求, 请在 issue 中提出     