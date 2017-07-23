// ==UserScript==
// @name         OPR tools CN
// @version      1.0.8
// @description  Add links to maps, rate on common objects, and other small improvements
// @author       CubicPill
// @match        https://opr.ingress.com/recon
// @grant        unsafeWindow
// @homepageURL  https://github.com/CubicPill/OPR-tools-CN
// @downloadURL  https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/opr_tools_cn.user.js
// @updateURL    https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/opr_tools_cn.user.js
// @require      https://raw.githubusercontent.com/wandergis/coordtransform/master/index.js

// ==/UserScript==

// original author 1110101, https://gitlab.com/1110101/opr-tools/graphs/master
// original source https://gitlab.com/1110101/opr-tools
// merge-requests welcome

/*
 MIT License

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

let STRINGS = {
    baidu: "Baidu",
    tencent: "Tencent",
    bdstreetview: "Baidu StreetView",
    photo: "Bad Photo",
    private: "Private Area",
    school: "School",
    face: "Face",
    temporary: "Temporary",
    location: "Location",
    agent: "Name In Title",
    apartment: "Apartment Sign",
    cemetery: "Cemetery",
    street_sign: "City/Street Sign",
    fire_dept: "Fire Department",
    hospital: "Hospital",
    hotel: "Hotel/Inn",
    exercise: "Exercise Equipment",
    post: "Post Office",
    survey_marker: "Survey Marker",
    water_tower: "Water Tower",
    fountain: "Fountain",
    gazebo: "Gazebo",
    mt_marker: "Mountain Top Marker",
    playground: "Playground",
    ruin: "Ruins",
    trail_mk: "Trail Marker",
    percent_processed: "Percent Processed"

};
const STRINGS_CN = {
    baidu: "百度地图",
    tencent: "腾讯地图",
    bdstreetview: "百度街景",
    photo: "低质量图片",
    private: "封闭区域",
    school: "中小学",
    face: "人脸",
    temporary: "临时景观",
    location: "位置不准确",
    agent: "标题包含 Codename",
    apartment: "小区招牌",
    cemetery: "墓园",
    street_sign: "路牌",
    fire_dept: "消防局",
    hospital: "医院",
    hotel: "酒店",
    exercise: "健身器材",
    post: "邮局",
    survey_marker: "测量地标",
    water_tower: "水塔",
    fountain: "喷泉",
    gazebo: "亭子",
    mt_marker: "山顶标记",
    playground: "运动场",
    ruin: "遗址",
    trail_mk: "步道路标",
    percent_processed: "已处理的百分比"
};
const PORTAL_MARKER = "data:image/PNG;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAAd0SU1FB+EHEAccLVUS/qUAAAI0SURBVDjLldTNa55VEAXw39zniTGRqvEDUqOLiEGKKEELbcS9IG79AxSJqCju3MZ/oNhFwFZtEZeKS1FKXRgRLVK6qSVoGkWbCkbRlHy8b/I+46K3sYg1eJZ35p4599yZCf9AfoH3NQZuUrRCCzo72NHo6xnESRJR77WQs8TxevKeceEx4TCmpEkQfsCSzleGfJOsBPIZ4oO/CeULijCGV3RekkaEgnItReqETbyt86ZFq7Gg21VU0yZ1jgozGBbOS5eE1Upyl3APHpJeVBx0wGsWfAuRiVkTilnpdfwpfC19h560U3W3OkMaUzqHhDuFI1rz5v3UzK1r9T0pvSHcjNM4j00MhHTV14GwjVVsCFPSI9IFj1os1tyCGaGVzgoXse3G2MEyzgpFelyxrwjDeBADLEtb9kLoScvoC5PCSJGG8QA6rEgDe6MTLmNLZ0XqlWpk4/8j0QqHdG4t1cCfhcDYdX3zXxSBO6qAdY1BMaQvLUkN7q1NuJdHRZpAK32PzeJ36zhT60zjvj2e2mBCmK7FzwhXio/0tT4XPsbdmKnVyr8oCezHDMYVp7Q+86uNNjZlXrJowryBg7hfGJXOKS7r/FZJxqT9mMa4dBFvCRfiQxnXpjdfNWrLE3gWT0sbdUB7Vc8wRjAqfKpzQmch3nUlZ+v058vE/O4WeBhPSYdrf01Woh+lJXyp+CSOOQf5PPHOdWtk92efU4zYZ9s4bpduq6E16Q+NX7AWx3Q5R8xdDf4FFQPK0NE5za8AAAAASUVORK5CYII=";

function addGlobalStyle(css) {
    let head, style;
    head = document.getElementsByTagName("head")[0];
    if (!head) {
        return;
    }
    style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = css;
    head.appendChild(style);
}


function init() {
    const w = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
    let tryNumber = 5;
    const initWatcher = setInterval(function () {
        if (tryNumber === 0) {
            clearInterval(initWatcher);
            w.document.getElementById("NewSubmissionController").insertAdjacentHTML("afterBegin", `
<div class='alert alert-danger'><strong><span class='glyphicon glyphicon-remove'></span> OPR tools initialization failed,</strong> check developer console for error details</div>
`);
            return;
        }
        if (w.angular) {
            let err = false;
            try {
                initAngular();
                clearInterval(initWatcher);
            }
            catch (error) {
                err = error;
                console.error(error);
            }
            if (!err) {
                try {
                    initScript();
                } catch (error) {
                    console.error(error);
                }
            }
        }
        tryNumber--;
    }, 500);

    function initAngular() {
        const el = w.document.querySelector("[ng-app='portalApp']");
        w.$app = w.angular.element(el);
        w.$injector = w.$app.injector();
        w.$rootScope = w.$app.scope();

        w.$scope = function (element) {
            return w.angular.element(element).scope();
        };
    }

    function initScript() {
        const descDiv = document.getElementById("descriptionDiv");
        const ansController = w.$scope(descDiv).answerCtrl;
        const subController = w.$scope(descDiv).subCtrl;
        const scope = w.$scope(descDiv);
        const pageData = subController.pageData;
        if (pageData === undefined) {
            setTimeout(initScript, 1000);
            console.log('pageData not loaded, retry in 1s');
            return;
        }
        let watchAdded = false;

        // run on init
        modifyPage();

        if (!watchAdded) {
            // re-run on data change
            scope.$watch("subCtrl.pageData", function () {
                modifyPage();
            });
        }

        function modifyPage() {

            // adding CSS
            addGlobalStyle(`
.dropdown {
position: relative;
display: inline-block;
}

.dropdown-content {
display: none;
position: absolute;
z-index: 1;
margin: 0;
}
.dropdown-menu li a {
color: #ddd !important;
}
.dropdown:hover .dropdown-content {
display: block;
background-color: #004746 !important;
border: 1px solid #0ff !important;
border-radius: 0px !important;

}
.dropdown-menu>li>a:focus, .dropdown-menu>li>a:hover {
background-color: #008780;
}
.modal-sm {
width: 350px !important;
}
.textButton{
color:#00FFFF;
}
`);


            // adding map buttons
            const wgs_lat = pageData.lat;
            const wgs_lng = pageData.lng;
            const name = pageData.title;
            const _gcj = coordtransform.wgs84togcj02(wgs_lng, wgs_lat);
            const gcj_lat = _gcj[1];
            const gcj_lng = _gcj[0];
            const _bd = coordtransform.gcj02tobd09(gcj_lng, gcj_lat);
            const bd_lat = _bd[1];
            const bd_lng = _bd[0];
            const mapButtons = [
                "<a class='button btn btn-default' target='intel' href='https://www.ingress.com/intel?ll=" + wgs_lat + "," + wgs_lng + "&z=17'>Intel</a>",
                "<a class='button btn btn-default' target='osm' href='https://www.openstreetmap.org/?mlat=" + wgs_lat + "&mlon=" + wgs_lng + "&zoom=16'>OSM</a>",
                "<a class='button btn btn-default' target='baidu' href='http://api.map.baidu.com/marker?location=" + wgs_lat + "," + wgs_lng + "&title=" + name + "&content=OPR_Candidate&output=html&coord_type=wgs84&src=OPR'>" + STRINGS.baidu + "</a>",
                "<a class='button btn btn-default' target='tencent' href='http://apis.map.qq.com/uri/v1/marker?&marker=coord:" + gcj_lat + "," + gcj_lng + ";title:" + name + ";addr:&referer=OPR'>" + STRINGS.tencent + "</a>",
                "<a class='button btn btn-default' target='baidu-streetview' href='http://api.map.baidu.com/pano/?x=" + bd_lng + "&y=" + bd_lat + "&lc=0&ak=ngDX6G7TgWSmjMstxolm7g642F7eUbkS'>" + STRINGS.bdstreetview + "</a>"
            ];
            descDiv.insertAdjacentHTML("beforeEnd", "<div><div class='btn-group'>" + mapButtons.join("") + "</div></div>");


            const textBox = w.document.querySelector("#submitDiv + .text-center > textarea");
            // moving submit button to right side of classification-div
            const submitDiv = w.document.querySelectorAll("#submitDiv, #submitDiv + .text-center");
            const classificationRow = w.document.querySelector(".classification-row");
            const newSubmitDiv = w.document.createElement("div");
            newSubmitDiv.className = "col-xs-12 col-sm-6";
            submitDiv[0].style.marginTop = 16;
            newSubmitDiv.appendChild(submitDiv[1]);
            newSubmitDiv.appendChild(submitDiv[0]);
            classificationRow.insertAdjacentElement("afterend", newSubmitDiv);


            // adding text buttons
            const selectButtonsDiv = w.document.createElement("div");
            const textButtons = [
                "<button id='photo' rate='1' class='button btn btn-default textButton' data-tooltip='indicates a low quality photo'>" + STRINGS.photo + "</button>",
                "<button id='private' rate='1' class='button btn btn-default textButton' data-tooltip='located on private residential property'>" + STRINGS.private + "</button>",
                "<button id='school' rate='1' class='button btn btn-default textButton' data-tooltip='located on school property'>" + STRINGS.school + "</button>",
                "<button id='face' rate='1' class='button btn btn-default textButton' data-tooltip='photo contains 1 or more people faces'>" + STRINGS.face + "</button>",
                "<button id='temporary' rate='1' class='button btn btn-default textButton' data-tooltip='seasonal or temporary display or item'>" + STRINGS.temporary + "</button>",
                "<button id='location' rate='1' class='button btn btn-default textButton' data-tooltip='location wrong'>" + STRINGS.location + "</button>",
                "<button id='agent' rate='1' class='button btn btn-default textButton' data-tooltip='agent name or codename in portal title/description'>" + STRINGS.agent + "</button>",
            ];

            descDiv.insertAdjacentElement("beforeEnd", selectButtonsDiv);


            // more uncommon ratings (following the niantic guideline) in a dropdown menu
            const uncommonRatingsDropDown = [
                "<li>1★</li>",
                "<li><div id='apartment' rate='1' node='074e62624e5af37799c3d3e98593e33f' class='textButton' >" + STRINGS.apartment + "</div> </li>",
                "<li><div id='cemetery' rate='1' node='415ab70db1057040f63d9b9480787e00' class='textButton' >" + STRINGS.cemetery + "</div> </li>",
                "<li><div id='street_sign' rate='1' class='textButton' >" + STRINGS.street_sign + "</div> </li>",
                "<li><div id='fire_dept' rate='1' node='5f6b705988ecd7252c1b3eef5401fc49' class='textButton' >" + STRINGS.fire_dept + "</div> </li>",
                "<li><div id='hospital' rate='1' node='c9591928484d4ea47225598026a7c86e' class='textButton' >" + STRINGS.hospital + "</div> </li>",
                "<li><div id='hotel' rate='1' node='28020d306dcc0a0173198d6be2829ec2' class='textButton' >" + STRINGS.hotel + "</div> </li>",

                "<li role='separator' class='divider'></li>",
                "<li>3★</li>",
                "<li><div id='exercise' rate='3' class='textButton' >" + STRINGS.exercise + "</div> </li>",

                "<li role='separator' class='divider'></li>",
                "<li>4★</li>",
                "<li><div id='post' rate='4' node='34f26c9f9efdf50021f3566c3ebb7ca7' class='textButton' >" + STRINGS.post + "</div> </li>",
                "<li><div id='survey_marker' rate='4' node='ee395ee3e249c57fb461785900cc1fc8' class='textButton' >" + STRINGS.survey_marker + "</div> </li>",
                "<li><div id='water_tower' rate='4' node='3ae6a743d3d327d58d0ced2cdf98ee4e' class='textButton' >" + STRINGS.water_tower + "</div> </li>",

                "<li role='separator' class='divider'></li>",
                "<li>5★</li>",
                "<li><div id='fountain' rate='5' node='8b2ab423b4b1d519da94473040edc07c' class='textButton' >" + STRINGS.fountain + "</div> </li>",
                "<li><div id='gazebo' rate='5' node='deaed3fc05b15a909711363addda3ba1' class='textButton' >" + STRINGS.gazebo + "</div> </li>",
                "<li><div id='mt_marker' rate='5' class='textButton' >" + STRINGS.mt_marker + "</div> </li>",
                "<li><div id='playground' rate='5' node='3d62e6a4c11d43527cf1316c81398804' class='textButton' >" + STRINGS.playground + "</div> </li>",
                "<li><div id='ruin' rate='5' node='c8c6278980e1fa30937eaaf012360310' class='textButton' >" + STRINGS.ruin + "</div> </li>",
                "<li><div id='trail_marker' rate='5' node='f72a4432da22afe781f94b9ae90ae0c3' class='textButton' >" + STRINGS.trail_mk + "</div> </li>",

            ];

            selectButtonsDiv.insertAdjacentHTML("beforeEnd", "<div class='btn-group' style='text-align: center'>" + textButtons.join("") +
                "<div class='button btn btn-primary dropdown'><span class='caret'></span><ul class='dropdown-content dropdown-menu'>" + uncommonRatingsDropDown.join("") + "</div>");

            function rateScore(star) {
                console.log("Rate " + star + " star");
                w.document.querySelectorAll('.btn-group')[currentSelectable + 2].querySelectorAll('button.button-star')[star - 1].click();
                if (currentSelectable === 0 && star === 1)
                    currentSelectable = 0;
                else
                    currentSelectable++;
            }

            function getAllLeafNodes() {
                const root = subController.categoryData.root;
                let leafNodes = [];

                function traverseAndPutLeaf(node) {
                    for (let n in node.children) {
                        if (node.children[n].hasOwnProperty("children")) {
                            if (node.children[n].children.length !== 0)
                                traverseAndPutLeaf(node.children[n]);
                            else
                                leafNodes.push(node.children[n]);
                        }
                    }
                }

                traverseAndPutLeaf(root);
                return leafNodes;
            }

            setTimeout(function () {
                w.leafNodes = getAllLeafNodes();

            }, 1000);

            function getNodeById(id) {
                for (let n in w.leafNodes) {
                    if (w.leafNodes[n].id === id)
                        return w.leafNodes[n];
                }
                return null;
            }

            function setNode(nodeId) {
                subController.backToRootNode();
                let node = getNodeById(nodeId);
                let list = [node];
                while (node.parent !== null) {
                    list.push(node.parent);
                    node = node.parent;
                }
                list.reverse();
                for (let n in list) {
                    subController.setWhatNode(list[n].id);
                }
            }

            const buttons = w.document.getElementsByClassName("textButton");
            for (let b in buttons) {
                if (buttons.hasOwnProperty(b)) {
                    buttons[b].addEventListener("click", function () {
                        currentSelectable = 0;
                        const source = event.target || event.srcElement;
                        let text;
                        switch (source.id) {
                            case "photo":
                                text = "Low quality photo";
                                break;
                            case "private":
                                text = "Private residential property";
                                break;
                            case "school":
                                text = "Located on primary or secondary school grounds";
                                break;
                            case "face":
                                text = "Picture contains one or more clear faces";
                                break;
                            case "temporary":
                                text = "Portal candidate is seasonal or temporary";
                                break;
                            case "location":
                                text = "Portal candidate's location is not on object";
                                break;
                            case "agent":
                                text = "Title or description contains agent name";
                                break;
                            case "apartment":
                                text = "Apartment Sign";
                                break;
                            case "cemetery":
                                text = "Cemetery";
                                break;
                            case "fire_dept":
                                text = "Fire department";
                                break;
                            case "hospital":
                                text = "Hospital";
                                break;
                            case "hotel":
                                text = "Hotel";
                                break;
                            case "street_sign":
                                text = "Street sign";
                                break;
                            case "exercise":
                                text = "Exercise equipment";
                                break;
                            case "mt_marker":
                                text = "Mountain top marker";
                                break;
                            default:
                                text = "";


                        }
                        if (source.hasAttribute('rate'))
                            rateScore(parseInt(source.getAttribute('rate')));
                        if (source.hasAttribute('node')) {
                            setNode(source.getAttribute('node'));
                        }
                        textBox.innerText = text;


                    }, false);
                }
            }


            // adding percent procressed number
            const stats = w.document.querySelector("#player_stats").children[2];

            const reviewed = parseInt(stats.children[3].children[2].innerText);
            const accepted = parseInt(stats.children[5].children[2].innerText);
            const rejected = parseInt(stats.children[7].children[2].innerText);

            let percent = (accepted + rejected) / reviewed;
            percent = Math.round(percent * 1000) / 10;
            w.document.querySelector("#player_stats:not(.visible-xs) div p:last-child")
                .insertAdjacentHTML("afterEnd", '<br><p><span class="glyphicon glyphicon-info-sign ingress-gray pull-left"></span>' +
                    '<span style="margin-left: 5px;" class="ingress-mid-blue pull-left">' + STRINGS.percent_processed + '</span> <span class="gold pull-right">' + percent + '%</span></p>');

            w.document.querySelector("#player_stats:not(.visible-xs) div p:last-child").insertAdjacentHTML("afterEnd", '<br><p><input style="width: 99%;" type="text" ' +
                'value="' + reviewed + ' / ' + (accepted + rejected ) + ' (' + accepted + '/' + rejected + ') / ' + percent + '%"/></p>');

            // kill autoscroll
            ansController.goToLocation = null;

            // portal image zoom button with "=s0"
            w.document.querySelector("#AnswersController .ingress-background").insertAdjacentHTML("beforeBegin",
                "<div style='position:absolute;float:left;'><a class='button btn btn-default' style='display:inline-block;' href='" + subController.pageData.imageUrl + "=s0' target='fullimage'><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div>");

            // REMOVED
            // skip "Your analysis has been recorded." dialog and go directly to next review
            //exportFunction(function () {
            //    window.location.assign("/recon");
            //}, ansController, {defineAs: "openSubmissionCompleteModal"});

            // Make photo filmstrip scrollable
            const filmstrip = w.document.getElementById("map-filmstrip");

            function scrollHorizontally(e) {
                e = window.event || e;
                const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                filmstrip.scrollLeft -= (delta * 50); // Multiplied by 50
                e.preventDefault();
            }

            filmstrip.addEventListener("DOMMouseScroll", scrollHorizontally, false);
            filmstrip.addEventListener("mousewheel", scrollHorizontally, false);

            // Replace map markers with a nice circle
            for (let i = 0; i < subController.markers.length; ++i) {
                const marker = subController.markers[i];
                marker.setIcon(PORTAL_MARKER);
            }
            subController.map.setZoom(16);

            // Re-enabling scroll zoom
            subController.map.setOptions(cloneInto({scrollwheel: true}, w));

            // HACKY way to move portal rating to the right side
            const scorePanel = w.document.querySelector("div[class~='pull-right']");
            let nodesToMove = Array.from(w.document.querySelector("div[class='btn-group']").parentElement.children);
            nodesToMove = nodesToMove.splice(2, 6);
            nodesToMove.push(w.document.createElement("br"));
            for (let j = nodesToMove.length - 1; j >= 0; --j) {
                scorePanel.insertBefore(nodesToMove[j], scorePanel.firstChild);
            }

            // Bind click-event to Dup-Images-Filmstrip. result: a click to the detail-image the large version is loaded in another tab
            const imgDups = w.document.querySelectorAll("#map-filmstrip > ul > li > img");
            const clickListener = function () {
                w.open(this.src + "=s0", 'fulldupimage');
            };
            for (let imgSep in imgDups) {
                if (imgDups.hasOwnProperty(imgSep)) {
                    imgDups[imgSep].addEventListener("click", function () {
                        const imgDup = w.document.querySelector("#content > img");
                        imgDup.removeEventListener("click", clickListener);
                        imgDup.addEventListener("click", clickListener);
                        imgDup.setAttribute("style", "cursor: pointer;");
                    });
                }
            }

            // add translate buttons to title and description (if existing)
            const link = w.document.querySelector("#descriptionDiv a");
            const content = link.innerText.trim();
            let a = w.document.createElement("a");
            let span = w.document.createElement("span");
            span.className = "glyphicon glyphicon-book";
            span.innerHTML = " ";
            a.appendChild(span);
            a.className = "button btn btn-default pull-right";
            a.target = 'translate';
            a.style.padding = '0px 4px';
            a.href = "https://translate.google.com/#auto/zh-CN/" + content;
            link.insertAdjacentElement("afterend", a);

            const description = w.document.querySelector("#descriptionDiv").innerHTML.split("<br>")[3].trim();
            if (description !== '&lt;No description&gt;' && description !== '') {
                a = w.document.createElement('a');
                span = w.document.createElement("span");
                span.className = "glyphicon glyphicon-book";
                span.innerHTML = " ";
                a.appendChild(span);
                a.className = "button btn btn-default pull-right";
                a.target = 'translate';
                a.style.padding = '0px 4px';
                a.href = "https://translate.google.com/#auto/zh-CN/" + description;
                const br = w.document.querySelectorAll("#descriptionDiv br")[2];
                br.insertAdjacentElement("afterend", a);
            }

            function editDistance(s1, s2) {
                s1 = s1.toLowerCase();
                s2 = s2.toLowerCase();
                let len1 = s1.length, len2 = s2.length;
                let d = [];
                let i, j;
                /*初始化二维数组，以及定义
                 if i == 0 且 j == 0，edit(i, j) = 0
                 if i == 0 且 j > 0，edit(i, j) = j
                 if i > 0 且j == 0，edit(i, j) = i
                 */

                for (i = 0; i <= len1; i++) {
                    d[i] = [];
                    d[i][0] = i;
                }
                for (j = 0; j <= len2; j++) {
                    d[0][j] = j;
                }
                for (i = 1; i <= len1; i++) {
                    for (j = 1; j <= len2; j++) {
                        let cost = s1[i] === s2[j] ? 0 : 1;
                        let deletion = d[i - 1][j] + 1; //删除动作
                        let insertion = d[i][j - 1] + 1; //增加动作
                        let substitution = d[i - 1][j - 1] + cost; //替换字符，如果相同cost=0；不同cost=1
                        d[i][j] = Math.min(deletion, insertion, substitution);
                    }
                }
                return 1 - d[len1][len2] / Math.max(len1, len2);
            }

            const activePortals = subController.activePortals;
            let estimatedDup = 1;
            let currRate = 0;
            if (activePortals.length !== 0) {
                for (let i = 0; i < Math.min(activePortals.length, 10); ++i) {
                    if (activePortals[i].title.toLowerCase().indexOf(pageData.title.toLowerCase()) >= 0
                        || pageData.title.toLowerCase().indexOf(activePortals[i].title.toLowerCase()) >= 0) {
                        estimatedDup = i + 1;
                        currRate = -1;
                        return;
                    } // handle situation that one is part of another
                    let rate = editDistance(activePortals[i].title, pageData.title);
                    if (rate > currRate && rate > 0.25) {
                        estimatedDup = i + 1;
                        currRate = rate;
                    }
                }
                console.log('Estimated duplicate: ' + activePortals[estimatedDup - 1].title + ', Rate: ' + currRate);

                // Automatically open the most possible duplicate
                try {
                    const e = w.document.querySelector("#map-filmstrip > ul > li:nth-child(" + estimatedDup + ") > img");
                    setTimeout(function () {
                        e.click();
                    }, 500);
                } catch (err) {
                }
            }

            // expand automatically the "What is it?" filter text box
            try {
                const f = w.document.querySelector("#AnswersController > form > div:nth-child(5) > div > p > span.ingress-mid-blue.text-center");
                setTimeout(function () {
                    f.click();
                }, 500);
            } catch (err) {
            }


            // keyboard navigation
            // keys 1-5 to vote
            // space/enter to confirm dialogs
            // esc or numpad "/" to reset selector
            // Numpad + - to navigate

            let currentSelectable = 0;
            let maxItems = 6;

            function highlight() {
                w.document.querySelectorAll('.btn-group').forEach(exportFunction((element) => {
                    element.style.border = 'none';
                }, w));
                if (currentSelectable < maxItems) {
                    w.document.querySelectorAll('.btn-group')[currentSelectable + 2].style.border = cloneInto('1px dashed #ebbc4a', w);
                }
            }

            addEventListener('keydown', (event) => {

                /*
                 keycodes:

                 8: Backspace
                 9: TAB
                 13: Enter
                 16: Shift
                 27: Escape
                 32: Space
                 107: NUMPAD +
                 109: NUMPAD -
                 111: NUMPAD /

                 49 - 53:  Keys 1-5
                 97 - 101: NUMPAD 1-5

                 */
                let numkey;
                if (event.keyCode >= 49 && event.keyCode <= 53)
                    numkey = event.keyCode - 48;
                else if (event.keyCode >= 97 && event.keyCode <= 101)
                    numkey = event.keyCode - 96;
                else
                    numkey = null;

                if (w.document.querySelector("input[type=text]:focus") || w.document.querySelector("textarea:focus")) {
                    return;
                }
                // "analyze next" button
                else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector('a.button[href="/recon"]')) {
                    w.document.location.href = '/recon';
                    event.preventDefault();
                } // submit low quality rating
                else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector('[ng-click="answerCtrl2.confirmLowQuality()"]')) {
                    w.document.querySelector('[ng-click="answerCtrl2.confirmLowQuality()"]').click();
                    currentSelectable = 0;
                    event.preventDefault();

                } // submit duplicate
                else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector('[ng-click="answerCtrl2.confirmDuplicate()"]')) {
                    w.document.querySelector('[ng-click="answerCtrl2.confirmDuplicate()"]').click();
                    currentSelectable = 0;
                    event.preventDefault();

                } // submit normal rating
                else if ((event.keyCode === 13 || event.keyCode === 32) && currentSelectable === maxItems) {
                    w.document.querySelector('[ng-click="answerCtrl.submitForm()"]').click();
                    event.preventDefault();

                } // close duplicate dialog
                else if ((event.keyCode === 27 || event.keyCode === 111) && w.document.querySelector('[ng-click="answerCtrl2.resetDuplicate()"]')) {
                    w.document.querySelector('[ng-click="answerCtrl2.resetDuplicate()"]').click();
                    currentSelectable = 0;
                    event.preventDefault();

                } // close low quality ration dialog
                else if ((event.keyCode === 27 || event.keyCode === 111) && w.document.querySelector('[ng-click="answerCtrl2.resetLowQuality()"]')) {
                    w.document.querySelector('[ng-click="answerCtrl2.resetLowQuality()"]').click();
                    currentSelectable = 0;
                    event.preventDefault();
                }
                // return to first selection (should this be a portal)
                else if (event.keyCode === 27 || event.keyCode === 111) {
                    currentSelectable = 0;
                }
                // select next rating
                else if ((event.keyCode === 107 || event.keyCode === 9) && currentSelectable < maxItems) {
                    currentSelectable++;
                    event.preventDefault();
                }
                // select previous rating
                else if ((event.keyCode === 109 || event.keyCode === 16 || event.keyCode === 8) && currentSelectable > 0) {
                    currentSelectable--;
                    event.preventDefault();

                }
                else if (numkey === null || currentSelectable >= maxItems) {
                    return;
                }
                // rating 1-5
                else {
                    rateScore(numkey);
                }
                highlight();
            });

            highlight();

            watchAdded = true;
        }

    }

}

window.addEventListener('load', function () {
    if (navigator.language === "zh-CN")
        STRINGS = STRINGS_CN;
    if (document.querySelector("[src*='all-min']")) {
        init();
    }
}, false);

