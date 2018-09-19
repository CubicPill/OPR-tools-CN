# OPR-tools-CN
A plugin for ingress OPR page    
![](https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/demo/screenshot.png)
![](https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/demo/dropdown.png)

Edited from [opr-tools](https://gitlab.com/1110101/opr-tools/) on Gitlab. Specially customized for Mainland China users      
Special thanks to original author [Oliwer Christ](https://gitlab.com/1110101) @1110101     
## Added Features:
- Add links for Intel Map, OSM, Baidu Map, Tencent Map, and Baidu StreetView
- Buttons to submit common 1-star rating and remark with one click
- Add common ratings according to Niantic's [Guideline](https://opr.ingress.com/guide), and automatically select the category of the candidate
- Match the possible duplicate portals by title

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
## 增加的功能:
- 增加了到 Intel, OSM, 百度地图, 腾讯地图和百度街景的跳转链接
- 增加了常见拒绝理由的按钮, 自动在评论框中添加拒绝原因并提交一星
- 按照 Niantic 发布的审核指导规则[英文版](https://opr.ingress.com/guide) [中文版](http://mp.weixin.qq.com/s/EdiIUE5s3B4iBOusRJ5q8Q) 在下拉菜单中添加了常见候选 portal, 自动打分并添加评论和种类
- 根据 portal 标题尝试自动匹配重复 portal

## 已知问题
- 由于页面的 AJAX, 插件可能会在页面元素全部显示完成后一段时间后加载完成 (常见于初次页面加载), 刷新页面可解决此问题
- 评分一星后确认对话框的 "取消" 键可能会失去响应, 点击页面空白处即可返回审核页面
- 此脚本在火狐浏览器上暂不可用, 请使用 Chrome 浏览器 + Tampermonkey 插件

如果对插件有任何反馈或新功能需求, 请在 issue 中提出     