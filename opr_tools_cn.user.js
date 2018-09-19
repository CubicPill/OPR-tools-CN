// ==UserScript==
// @name         OPR tools CN
// @version      2.0.0
// @description  Add links to maps, rate on common objects, and other small improvements
// @author       CubicPill
// @match        https://opr.ingress.com/*
// @grant        unsafeWindow
// @grant        GM_notification
// @grant        GM_addStyle
// @homepageURL  https://github.com/CubicPill/OPR-tools-CN
// @downloadURL  https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/opr_tools_cn.user.js
// @updateURL    https://raw.githubusercontent.com/CubicPill/OPR-tools-CN/master/opr_tools_cn.user.js
// @require      https://raw.githubusercontent.com/wandergis/coordtransform/master/index.js
// @require      https://cdn.rawgit.com/alertifyjs/alertify.js/v1.0.10/dist/js/alertify.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.4.4/proj4.js
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
const STRINGS_EN = {
    baidu: "Baidu",
    tencent: "Tencent",
    amap: "Amap",
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
    percent_processed: "Percent Processed",
    next_badge_tier: "Next badge tier",
    new_preset_name: "New preset name:",
    preset: "Preset",
    created_preset: "✔ Created preset",
    delete_preset: "Deleted preset",
    applied_preset: "✔ Applied",
    preset_tooltip: "(OPR-Tools) Create your own presets for stuff like churches, playgrounds or crosses'.\nHowto: Answer every question you want included and click on the +Button.\n\nTo delete a preset shift-click it.",
    expired: "EXPIRED",
};

const STRINGS_CN = {
    baidu: "百度地图",
    tencent: "腾讯地图",
    amap: "高德地图",
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
    percent_processed: "已处理的百分比",
    next_badge_tier: "下一等级牌子",
    preset: "预设评分",
    new_preset_name: "新预设评分名称:",
    created_preset: "✔ 创建预设",
    delete_preset: "删除预设",
    applied_preset: "✔ 使用预设",
    preset_tooltip: "(OPR-Tools) 为长椅、操场等物品建立自己的预设评分.\n使用方法: 对所有希望包括的评分项评分，然后点击 + 按钮.\n\n删除预设请按住 Shift 键然后点击。",
    expired: "已过期",

};
let STRINGS = STRINGS_CN;

if (navigator.language.search('en'))
    STRINGS = STRINGS_EN;
STRINGS = STRINGS_CN;

const OPRT = {
    SCANNER_OFFSET: "oprt_scanner_offset",
    REFRESH: "oprt_refresh",
    FROM_REFRESH: "oprt_from_refresh",
    REFRESH_NOTI_SOUND: "oprt_refresh_noti_sound",
    REFRESH_NOTI_DESKTOP: "oprt_refresh_noti_desktop",
    MAP_TYPE: "oprt_map_type",
};


// polyfill for ViolentMonkey
if (typeof exportFunction !== "function") {
    exportFunction = (func, scope, options) => {
        if (options && options.defineAs) {
            scope[options.defineAs] = func;
        }
        return func;
    };
}
if (typeof cloneInto !== "function") {
    cloneInto = obj => obj;
}

function addGlobalStyle(css) {
    GM_addStyle(css);

    addGlobalStyle = () => {
    }; // noop after first run
}


function init() {
    const w = typeof unsafeWindow == "undefined" ? window : unsafeWindow;
    let tryNumber = 15;

    let oprt_customPresets;

    let browserLocale = window.navigator.languages[0] || window.navigator.language || "en";

    const initWatcher = setInterval(() => {
        if (tryNumber === 0) {
            clearInterval(initWatcher);
            w.document.getElementById("NewSubmissionController")
                .insertAdjacentHTML("afterBegin", `
<div class='alert alert-danger'><strong><span class='glyphicon glyphicon-remove'></span> OPR-Tools initialization failed, refresh page</strong></div>
`);
            addRefreshContainer();
            return;
        }
        if (w.angular) {
            let err = false;
            try {
                initAngular();
            }
            catch (error) {
                err = error;
                // console.log(error);
            }
            if (!err) {
                try {
                    initScript();
                    clearInterval(initWatcher);
                } catch (error) {
                    console.log(error);
                    if (error === 41) {
                        addRefreshContainer();
                    }
                    if (error !== 42) {
                        clearInterval(initWatcher);
                    }
                }
            }
        }
        tryNumber--;
    }, 1000);

    function initAngular() {
        const el = w.document.querySelector("[ng-app='portalApp']");
        w.$app = w.angular.element(el);
        w.$injector = w.$app.injector();
        w.inject = w.$injector.invoke;
        w.$rootScope = w.$app.scope();

        w.getService = function getService(serviceName) {
            w.inject([serviceName, function (s) {
                w[serviceName] = s;
            }]);
        };

        w.$scope = element => w.angular.element(element).scope();
    }

    function initScript() {
        const subMissionDiv = w.document.getElementById("NewSubmissionController");
        const subController = w.$scope(subMissionDiv).subCtrl;
        const newPortalData = subController.pageData;

        const whatController = w.$scope(w.document.getElementById("WhatIsItController")).whatCtrl;

        const answerDiv = w.document.getElementById("AnswersController");
        const ansController = w.$scope(answerDiv).answerCtrl;

        // adding CSS
        addGlobalStyle(GLOBAL_CSS);

        modifyHeader();

        if (subController.errorMessage !== "") {
            // no portal analysis data available
            throw 41; // @todo better error code
        }

        if (typeof newPortalData === "undefined") {
            // no submission data present
            throw 42; // @todo better error code
        }

        // detect portal edit
        if (subController.reviewType === "NEW") {
            modifyNewPage(ansController, subController, whatController, newPortalData);
        } else if (subController.reviewType === "EDIT") {
            modifyEditPage(ansController, subController, newPortalData);
        }

        checkIfAutorefresh();

        startExpirationTimer(subController);

    }

    function modifyNewPage(ansController, subController, whatController, newPortalData) {

        mapButtons(newPortalData, w.document.getElementById("descriptionDiv"), "beforeEnd");

        let newSubmitDiv = moveSubmitButton();
        let {submitButton, submitAndNext} = quickSubmitButton(newSubmitDiv, ansController);

        textButtons();

        const customPresetUI = `
<div class="row" id="presets"><div class="col-xs-12">
	<div>` + STRINGS.preset + `&nbsp;<button class="button btn btn-default btn-xs" id="addPreset">+</button></div>
	<div class='btn-group' id="customPresets"></div>
</div></div>`;

        w.document.querySelector("form[name='answers'] div.row").insertAdjacentHTML("afterend", customPresetUI);

        addCustomPresetButtons();

        // we have to inject the tooltip to angular
        w.$injector.invoke(cloneInto(["$compile", ($compile) => {
            let compiledSubmit = $compile(`<span class="glyphicon glyphicon-info-sign darkgray" uib-tooltip-trigger="outsideclick" uib-tooltip-placement="left" tooltip-class="goldBorder" uib-tooltip="` + STRINGS.preset_tooltip + `"></span>&nbsp; `)(w.$scope(document.getElementById("descriptionDiv")));
            w.document.getElementById("addPreset").insertAdjacentElement("beforebegin", compiledSubmit[0]);
        }], w, {cloneFunctions: true}));

        // click listener for +preset button
        w.document.getElementById("addPreset").addEventListener("click", exportFunction(event => {
            alertify.okBtn("Save").prompt(STRINGS.new_preset_name,
                (value, event) => {
                    event.preventDefault();
                    if (value == "undefined" || value == "") {
                        return;
                    }
                    saveCustomPreset(value, ansController, whatController);
                    alertify.success(STRINGS.created_preset + ` <i>${value}</i>`);
                    addCustomPresetButtons();

                }, event => {
                    event.preventDefault();
                }
            );
        }), w, false);

        let clickListener = exportFunction(event => {
            const source = event.target || event.srcElement;
            let value = source.id;
            if (value === "" || event.target.nodeName !== "BUTTON") {
                return;
            }

            let preset = oprt_customPresets.find(item => item.uid === value);

            if (event.shiftKey) {
                alertify.log(STRINGS.delete_preset + ` <i>${preset.label}</i>`);
                w.document.getElementById(preset.uid).remove();
                deleteCustomPreset(preset);
                return;
            }

            ansController.formData.quality = preset.quality;
            ansController.formData.description = preset.description;
            ansController.formData.cultural = preset.cultural;
            ansController.formData.uniqueness = preset.uniqueness;
            ansController.formData.location = preset.location;
            ansController.formData.safety = preset.safety;

            // the controller's set by ID function doesn't work
            // and autocomplete breaks if there are any spaces
            // so set the field to the first word from name and match autocomplete by ID
            // at the very least, I know this will set it and leave the UI looking like it was manually set.
            whatController.whatInput = preset.nodeName.split(" ")[0];
            let nodes = whatController.getWhatAutocomplete();
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id == preset.nodeId) {
                    whatController.whatNode = nodes[i];
                    break;
                }
            }
            whatController.whatInput = "";

            // update ui
            event.target.blur();
            w.$rootScope.$apply();

            alertify.success(STRINGS.applied_preset + ` <i>${preset.label}</i>`);

        }, w);

        w.document.getElementById("customPresets").addEventListener("click", clickListener, false);

        // make photo filmstrip scrollable
        const filmstrip = w.document.getElementById("map-filmstrip");
        let lastScrollLeft = filmstrip.scrollLeft;

        function scrollHorizontally(e) {
            e = window.event || e;
            if (("deltaY" in e && e.deltaY !== 0 || "wheelDeltaY" in e && e.wheelDeltaY !== 0) && lastScrollLeft === filmstrip.scrollLeft) {
                e.preventDefault();
                const delta = (e.wheelDeltaY || -e.deltaY * 25 || -e.detail);
                filmstrip.scrollLeft -= (delta);
                lastScrollLeft = filmstrip.scrollLeft;
            }
        }

        filmstrip.addEventListener("wheel", exportFunction(scrollHorizontally, w), false);
        filmstrip.addEventListener("DOMMouseScroll", exportFunction(scrollHorizontally, w), false);

        // hotfix for #27 not sure if it works
        let _initMap = subController.initMap;
        subController.initMap = exportFunction(() => {
            _initMap();
            mapMarker(subController.markers);
        });

        mapOriginCircle(subController.map2);
        mapMarker(subController.markers);
        mapTypes(subController.map, false);
        mapTypes(subController.map2, true);

        // hook resetStreetView() and re-apply map types and options to first map. not needed for duplicates because resetMap() just resets the position
        let _resetStreetView = subController.resetStreetView;
        subController.resetStreetView = exportFunction(() => {
            _resetStreetView();
            mapOriginCircle(subController.map2)
            mapTypes(subController.map2, true);
        }, w);

        // adding a green 40m circle around the new location marker that updates on dragEnd
        let draggableMarkerCircle;
        let _showDraggableMarker = subController.showDraggableMarker;
        subController.showDraggableMarker = exportFunction(() => {
            _showDraggableMarker();

            w.getService("NewSubmissionDataService");
            let newLocMarker = w.NewSubmissionDataService.getNewLocationMarker();

            google.maps.event.addListener(newLocMarker, "dragend", function () {

                if (draggableMarkerCircle == null)
                    draggableMarkerCircle = new google.maps.Circle({
                        map: subController.map2,
                        center: newLocMarker.position,
                        radius: 40,
                        strokeColor: "#4CAF50", // material green 500
                        strokeOpacity: 1,
                        strokeWeight: 2,
                        fillOpacity: 0,
                    });
                else draggableMarkerCircle.setCenter(newLocMarker.position);

            });

        });

        document.querySelector("#street-view + small").insertAdjacentHTML("beforeBegin", "<small class='pull-left'><span style='color:#ebbc4a'>Circle:</span> 40m</small>");

        // move portal rating to the right side. don't move on mobile devices / small width
        if (screen.availWidth > 768) {
            const scorePanel = w.document.querySelector("div[class~='pull-right']");
            let nodeToMove = w.document.querySelector("div[class='btn-group']").parentElement;
            scorePanel.insertBefore(nodeToMove, scorePanel.firstChild);
        }

        // bind click-event to Dup-Images-Filmstrip. result: a click to the detail-image the large version is loaded in another tab
        const imgDups = w.document.querySelectorAll("#map-filmstrip > ul > li > img");
        const openFullImage = function () {
            w.open(`${this.src}=s0`, "fulldupimage");
        };
        for (let imgSep in imgDups) {
            if (imgDups.hasOwnProperty(imgSep)) {
                imgDups[imgSep].addEventListener("click", () => {
                    const imgDup = w.document.querySelector("#content > img");
                    if (imgDup !== null) {
                        imgDup.removeEventListener("click", openFullImage);
                        imgDup.addEventListener("click", openFullImage);
                        imgDup.setAttribute("style", "cursor: pointer;");
                    }
                });
            }
        }

        // add translate buttons to title and description (if existing)
        let lang = "en";
        try {
            lang = browserLocale.split("-")[0];
        } catch (e) {
        }
        const link = w.document.querySelector("#descriptionDiv a");
        const content = link.innerText.trim();
        let a = w.document.createElement("a");
        let span = w.document.createElement("span");
        span.className = "glyphicon glyphicon-book";
        span.innerHTML = " ";
        a.appendChild(span);
        a.className = "translate-title button btn btn-default pull-right";
        a.target = "translate";
        a.style.padding = "0px 4px";
        a.href = `https://translate.google.com/#auto/${lang}/${encodeURIComponent(content)}`;
        link.insertAdjacentElement("afterend", a);

        const description = w.document.querySelector("#descriptionDiv").innerHTML.split("<br>")[3].trim();
        if (description !== "&lt;No description&gt;" && description !== "") {
            a = w.document.createElement("a");
            span = w.document.createElement("span");
            span.className = "glyphicon glyphicon-book";
            span.innerHTML = " ";
            a.appendChild(span);
            a.className = "translate-description button btn btn-default pull-right";
            a.target = "translate";
            a.style.padding = "0px 4px";
            a.href = `https://translate.google.com/#auto/${lang}/${encodeURIComponent(description)}`;
            const br = w.document.querySelectorAll("#descriptionDiv br")[2];
            br.insertAdjacentElement("afterend", a);
        }

        // automatically open the first listed possible duplicate
        try {
            const e = w.document.querySelector("#map-filmstrip > ul > li:nth-child(1) > img");
            if (e !== null) {
                setTimeout(() => {
                    e.click();
                }, 500);
            }
        } catch (err) {
        }

        expandWhatIsItBox();

        // keyboard navigation
        // keys 1-5 to vote
        // space/enter to confirm dialogs
        // esc or numpad "/" to reset selector
        // Numpad + - to navigate

        let currentSelectable = 0;
        let maxItems = 7;

        // a list of all 6 star button rows, and the two submit buttons
        let starsAndSubmitButtons = w.document.querySelectorAll(".col-sm-6 .btn-group, .col-sm-4.hidden-xs .btn-group, .big-submit-button");

        function highlight() {
            starsAndSubmitButtons.forEach(exportFunction((element) => {
                element.style.border = "none";
            }, w));
            if (currentSelectable <= maxItems - 2) {
                starsAndSubmitButtons[currentSelectable].style.border = cloneInto("1px dashed #ebbc4a", w);
                submitAndNext.blur();
                submitButton.blur();
            } else if (currentSelectable == 6) {
                submitAndNext.focus();
            }
            else if (currentSelectable == 7) {
                submitButton.focus();
            }

        }

        addEventListener("keydown", (event) => {

            /*
            keycodes:

            8: Backspace
            9: TAB
            13: Enter
            16: Shift
            27: Escape
            32: Space
            68: D
            107: NUMPAD +
            109: NUMPAD -
            111: NUMPAD /

            49 - 53:  Keys 1-5
            97 - 101: NUMPAD 1-5

             */

            if (event.keyCode >= 49 && event.keyCode <= 53)
                numkey = event.keyCode - 48;
            else if (event.keyCode >= 97 && event.keyCode <= 101)
                numkey = event.keyCode - 96;
            else
                numkey = null;

            // do not do anything if a text area or a input with type text has focus
            if (w.document.querySelector("input[type=text]:focus") || w.document.querySelector("textarea:focus")) {
                return;
            }
            // "analyze next" button
            else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector("a.button[href=\"/recon\"]")) {
                w.document.location.href = "/recon";
                event.preventDefault();
            } // submit low quality rating
            else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector("[ng-click=\"answerCtrl2.confirmLowQuality()\"]")) {
                w.document.querySelector("[ng-click=\"answerCtrl2.confirmLowQuality()\"]").click();
                currentSelectable = 0;
                event.preventDefault();
            } // submit low quality rating alternate
            else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector("[ng-click=\"answerCtrl2.confirmLowQualityOld()\"]")) {
                w.document.querySelector("[ng-click=\"answerCtrl2.confirmLowQualityOld()\"]").click();
                currentSelectable = 0;
                event.preventDefault();
            } // click first/selected duplicate (key D)
            else if ((event.keyCode === 68) && w.document.querySelector("#content > button")) {
                w.document.querySelector("#content > button").click();
                currentSelectable = 0;
                event.preventDefault();

            } // click on translate title link (key T)
            else if (event.keyCode === 84) {
                const link = w.document.querySelector("#descriptionDiv > .translate-title");
                if (link) {
                    link.click();
                    event.preventDefault();
                }

            } // click on translate description link (key Y)
            else if (event.keyCode === 89) {
                const link = w.document.querySelector("#descriptionDiv > .translate-description");
                if (link) {
                    link.click();
                    event.preventDefault();
                }

            } // submit duplicate
            else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector("[ng-click=\"answerCtrl2.confirmDuplicate()\"]")) {
                w.document.querySelector("[ng-click=\"answerCtrl2.confirmDuplicate()\"]").click();
                currentSelectable = 0;
                event.preventDefault();

            } // submit normal rating
            else if ((event.keyCode === 13 || event.keyCode === 32) && currentSelectable === maxItems) {
                w.document.querySelector("[ng-click=\"answerCtrl.submitForm()\"]").click();
                event.preventDefault();

            } // close duplicate dialog
            else if ((event.keyCode === 27 || event.keyCode === 111) && w.document.querySelector("[ng-click=\"answerCtrl2.resetDuplicate()\"]")) {
                w.document.querySelector("[ng-click=\"answerCtrl2.resetDuplicate()\"]").click();
                currentSelectable = 0;
                event.preventDefault();

            } // close low quality ration dialog
            else if ((event.keyCode === 27 || event.keyCode === 111) && w.document.querySelector("[ng-click=\"answerCtrl2.resetLowQuality()\"]")) {
                w.document.querySelector("[ng-click=\"answerCtrl2.resetLowQuality()\"]").click();
                currentSelectable = 0;
                event.preventDefault();
            }
            // return to first selection (should this be a portal)
            else if (event.keyCode === 27 || event.keyCode === 111) {
                currentSelectable = 0;
            }
            // skip portal if possible
            else if (event.keyCode === 106 || event.keyCode === 220) {
                if (newPortalData.canSkip)
                    ansController.skipToNext();
            }
            else if (event.keyCode === 72) {
                showHelp(); // @todo
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
            else if (numkey === null || currentSelectable > maxItems - 2) {
                return;
            }
            else if (numkey !== null && event.shiftKey) {
                try {
                    w.document.getElementsByClassName("customPresetButton")[numkey - 1].click();
                } catch (e) {
                    // ignore
                }
            }
            // rating 1-5
            else {
                starsAndSubmitButtons[currentSelectable].querySelectorAll("button.button-star")[numkey - 1].click();
                currentSelectable++;
            }
            highlight();
        });

        highlight();

        modifyNewPage = () => {
        }; // just run once

    }

    function modifyEditPage(ansController, subController, newPortalData) {
        let editDiv = w.document.querySelector("div[ng-show=\"subCtrl.reviewType==='EDIT'\"]");

        mapButtons(newPortalData, editDiv, "afterEnd");

        let newSubmitDiv = moveSubmitButton();
        let {submitButton, submitAndNext} = quickSubmitButton(newSubmitDiv, ansController);

        textButtons();

        mapTypes(subController.locationEditsMap, true);

        // add translation links to title and description edits
        if (newPortalData.titleEdits.length > 1 || newPortalData.descriptionEdits.length > 1) {
            for (const titleEditBox of editDiv.querySelectorAll(".titleEditBox")) {
                const content = titleEditBox.innerText.trim();
                let a = w.document.createElement("a");
                let span = w.document.createElement("span");
                span.className = "glyphicon glyphicon-book";
                span.innerHTML = " ";
                a.appendChild(span);
                a.className = "translate-title button btn btn-default pull-right";
                a.target = "translate";
                a.style.padding = "0px 4px";
                a.href = `https://translate.google.com/#auto/${browserLocale.split("-")[0]}/${encodeURIComponent(content)}`;
                titleEditBox.querySelector("p").style.display = "inline-block";
                titleEditBox.insertAdjacentElement("beforeEnd", a);
            }
        }

        if (newPortalData.titleEdits.length <= 1) {
            let titleDiv = editDiv.querySelector("div[ng-show=\"subCtrl.pageData.titleEdits.length <= 1\"] h3");
            const content = titleDiv.innerText.trim();
            let a = w.document.createElement("a");
            let span = w.document.createElement("span");
            span.className = "glyphicon glyphicon-book";
            span.innerHTML = " ";
            a.appendChild(span);
            a.className = "translate-title button btn btn-default";
            a.target = "translate";
            a.style.padding = "0px 4px";
            a.style.marginLeft = "14px";
            a.href = `https://translate.google.com/#auto/${browserLocale.split("-")[0]}/${encodeURIComponent(content)}`;
            titleDiv.insertAdjacentElement("beforeend", a);
        }

        if (newPortalData.descriptionEdits.length <= 1) {
            let titleDiv = editDiv.querySelector("div[ng-show=\"subCtrl.pageData.descriptionEdits.length <= 1\"] p");
            const content = titleDiv.innerText.trim() || "";
            if (content !== "<No description>" && content !== "") {
                let a = w.document.createElement("a");
                let span = w.document.createElement("span");
                span.className = "glyphicon glyphicon-book";
                span.innerHTML = " ";
                a.appendChild(span);
                a.className = "translate-title button btn btn-default";
                a.target = "translate";
                a.style.padding = "0px 4px";
                a.style.marginLeft = "14px";
                a.href = `https://translate.google.com/#auto/${browserLocale.split("-")[0]}/${encodeURIComponent(content)}`;
                titleDiv.insertAdjacentElement("beforeEnd", a);
            }
        }

        expandWhatIsItBox();

        // fix locationEditsMap if only one location edit exists
        if (newPortalData.locationEdits.length <= 1)
            subController.locationEditsMap.setZoom(19);


        /* EDIT PORTAL */
        // keyboard navigation

        let currentSelectable = 0;
        let hasLocationEdit = (newPortalData.locationEdits.length > 1);
        // counting *true*, please don't shoot me
        let maxItems = (newPortalData.descriptionEdits.length > 1) + (newPortalData.titleEdits.length > 1) + (hasLocationEdit) + 2;

        let mapMarkers;
        if (hasLocationEdit) mapMarkers = subController.allLocationMarkers;
        else mapMarkers = [];

        // a list of all 6 star button rows, and the two submit buttons
        let starsAndSubmitButtons = w.document.querySelectorAll(
            "div[ng-show=\"subCtrl.reviewType==='EDIT'\"] > div[ng-show=\"subCtrl.pageData.titleEdits.length > 1\"]:not(.ng-hide)," +
            "div[ng-show=\"subCtrl.reviewType==='EDIT'\"] > div[ng-show=\"subCtrl.pageData.descriptionEdits.length > 1\"]:not(.ng-hide)," +
            "div[ng-show=\"subCtrl.reviewType==='EDIT'\"] > div[ng-show=\"subCtrl.pageData.locationEdits.length > 1\"]:not(.ng-hide)," +
            ".big-submit-button");


        /* EDIT PORTAL */
        function highlight() {
            let el = editDiv.querySelector("h3[ng-show=\"subCtrl.pageData.locationEdits.length > 1\"]");
            el.style.border = "none";

            starsAndSubmitButtons.forEach(exportFunction((element) => {
                element.style.border = "none";
            }, w));
            if (hasLocationEdit && currentSelectable === maxItems - 3) {
                el.style.borderLeft = cloneInto("4px dashed #ebbc4a", w);
                el.style.borderTop = cloneInto("4px dashed #ebbc4a", w);
                el.style.borderRight = cloneInto("4px dashed #ebbc4a", w);
                el.style.padding = cloneInto("16px", w);
                el.style.marginBottom = cloneInto("0", w);
                submitAndNext.blur();
                submitButton.blur();
            }
            else if (currentSelectable < maxItems - 2) {
                starsAndSubmitButtons[currentSelectable].style.borderLeft = cloneInto("4px dashed #ebbc4a", w);
                starsAndSubmitButtons[currentSelectable].style.paddingLeft = cloneInto("16px", w);
                submitAndNext.blur();
                submitButton.blur();
            } else if (currentSelectable === maxItems - 2) {
                submitAndNext.focus();
            }
            else if (currentSelectable === maxItems) {
                submitButton.focus();
            }

        }

        /* EDIT PORTAL */
        addEventListener("keydown", (event) => {

            /*
            Keycodes:

            8: Backspace
            9: TAB
            13: Enter
            16: Shift
            27: Escape
            32: Space
            68: D
            107: NUMPAD +
            109: NUMPAD -
            111: NUMPAD /

            49 - 53:  Keys 1-5
            97 - 101: NUMPAD 1-5
             */

            if (event.keyCode >= 49 && event.keyCode <= 53)
                numkey = event.keyCode - 48;
            else if (event.keyCode >= 97 && event.keyCode <= 101)
                numkey = event.keyCode - 96;
            else
                numkey = null;

            // do not do anything if a text area or a input with type text has focus
            if (w.document.querySelector("input[type=text]:focus") || w.document.querySelector("textarea:focus")) {
                return;
            }
            // "analyze next" button
            else if ((event.keyCode === 13 || event.keyCode === 32) && w.document.querySelector("a.button[href=\"/recon\"]")) {
                w.document.location.href = "/recon";
                event.preventDefault();
            }  // submit normal rating
            else if ((event.keyCode === 13 || event.keyCode === 32) && currentSelectable === maxItems) {
                w.document.querySelector("[ng-click=\"answerCtrl.submitForm()\"]").click();
                event.preventDefault();

            } // return to first selection (should this be a portal)
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
            else if (numkey === null || currentSelectable > maxItems - 2) {
                return;
            }
            // rating 1-5
            else {

                if (hasLocationEdit && currentSelectable === maxItems - 3 && numkey <= mapMarkers.length) {
                    google.maps.event.trigger(angular.element(document.getElementById("NewSubmissionController")).scope().getAllLocationMarkers()[numkey - 1], "click");
                }
                else {
                    if (hasLocationEdit) numkey = 1;
                    starsAndSubmitButtons[currentSelectable].querySelectorAll(".titleEditBox, input[type='checkbox']")[numkey - 1].click();
                    currentSelectable++;
                }

            }
            highlight();
        });

        highlight();

    }

    // add map buttons
    function mapButtons(newPortalData, targetElement, where) {
        // coordinate format conversion
        const coordUtm33 = proj4("+proj=longlat", "+proj=utm +zone=33", [newPortalData.lng, newPortalData.lat]);
        const coordUtm35 = proj4("+proj=longlat", "+proj=utm +zone=35", [newPortalData.lng, newPortalData.lat]);
        const coordPuwg92 = proj4("+proj=longlat", "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs", [newPortalData.lng, newPortalData.lat]);
        const wgs_lat = newPortalData.lat;
        const wgs_lng = newPortalData.lng;
        const name = newPortalData.title;
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
            "<a class='button btn btn-default' target='amap' href='http://uri.amap.com/marker?position=" + wgs_lng + "," + wgs_lat + "&name=" + name + "&src=opr&coordinate=wgs84&callnative=0\n'>" + STRINGS.amap + "</a>",
            "<a class='button btn btn-default' target='baidu-streetview' href='http://api.map.baidu.com/pano/?x=" + bd_lng + "&y=" + bd_lat + "&lc=0&ak=ngDX6G7TgWSmjMstxolm7g642F7eUbkS'>" + STRINGS.bdstreetview + "</a>"
        ];


        targetElement.insertAdjacentHTML(where, `<div><div class='btn-group'>${mapButtons.join("")}`);
    }

    // add new button "Submit and reload", skipping "Your analysis has been recorded." dialog
    function quickSubmitButton(submitDiv, ansController) {
        let submitButton = submitDiv.querySelector("button");
        submitButton.classList.add("btn", "btn-warning");
        let submitAndNext = submitButton.cloneNode(false);
        submitAndNext.innerHTML = `<span class="glyphicon glyphicon-floppy-disk"></span>&nbsp;<span class="glyphicon glyphicon-forward"></span>`;
        submitAndNext.title = "Submit and go to next review";
        submitAndNext.addEventListener("click", exportFunction(() => {
            exportFunction(() => {
                window.location.assign("/recon");
            }, ansController, {defineAs: "openSubmissionCompleteModal"});
        }, w));

        w.$injector.invoke(cloneInto(["$compile", ($compile) => {
            let compiledSubmit = $compile(submitAndNext)(w.$scope(submitDiv));
            submitDiv.querySelector("button").insertAdjacentElement("beforeBegin", compiledSubmit[0]);
        }], w, {cloneFunctions: true}));
        return {submitButton, submitAndNext};
    }

    function textButtons() {

        let emergencyWay = "";
        if (browserLocale.includes("de")) {
            emergencyWay = "RETTUNGSWEG!1";
        } else {
            emergencyWay = "Emergency Way";
        }

        // add text buttons
        const textButtons = `
<button id='photo' class='button btn btn-default textButton' data-tooltip='Indicates a low quality photo'>Photo</button>
<button id='private' class='button btn btn-default textButton' data-tooltip='Located on private residential property'>Private</button>`;
        const textDropdown = `
<li><a class='textButton' id='school' data-tooltip='Located on school property'>School</a></li>
<li><a class='textButton' id='person' data-tooltip='Photo contains 1 or more people'>Person</a></li>
<li><a class='textButton' id='perm' data-tooltip='Seasonal or temporary display or item'>Temporary</a></li>
<li><a class='textButton' id='location' data-tooltip='Location wrong'>Location</a></li>
<li><a class='textButton' id='natural' data-tooltip='Candidate is a natural feature'>Natural</a></li>
<li><a class='textButton' id='emergencyway' data-tooltip='Obstructing emergency way'>${emergencyWay}</a></li>
`;

        const textBox = w.document.querySelector("#submitDiv + .text-center > textarea");

        w.document.querySelector("#submitDiv + .text-center").insertAdjacentHTML("beforeend", `
<div class='btn-group dropup'>${textButtons}
<div class='button btn btn-default dropdown'><span class='caret'></span><ul class='dropdown-content dropdown-menu'>${textDropdown}</ul>
</div></div><div class="hidden-xs"><button id='clear' class='button btn btn-default textButton' data-tooltip='clears the comment box'>Clear</button></div>
`);

        const buttons = w.document.getElementsByClassName("textButton");
        for (let b in buttons) {
            if (buttons.hasOwnProperty(b)) {
                buttons[b].addEventListener("click", exportFunction(event => {
                    const source = event.target || event.srcElement;
                    let text = textBox.value;
                    if (text.length > 0) {
                        text += ",\n";
                    }
                    switch (source.id) {
                        case "photo":
                            text += "Low quality photo";
                            break;
                        case "private":
                            text += "Private residential property";
                            break;
                        case "duplicate":
                            text += "Duplicate of previously reviewed portal candidate";
                            break;
                        case "school":
                            text += "Located on primary or secondary school grounds";
                            break;
                        case "person":
                            text += "Picture contains one or more people";
                            break;
                        case "perm":
                            text += "Portal candidate is seasonal or temporary";
                            break;
                        case "location":
                            text += "Portal candidate's location is not on object";
                            break;
                        case "emergencyway":
                            text += "Portal candidate is obstructing the path of emergency vehicles";
                            break;
                        case "natural":
                            text += "Portal candidate is a natural feature";
                            break;
                        case "clear":
                            text = "";
                            break;
                    }

                    textBox.value = text;
                    textBox.dispatchEvent(new Event("change"));

                    event.target.blur();

                }, w), false);
            }
        }
    }


    // adding a 40m circle around the portal (capture range)
    function mapOriginCircle(map) {
        // noinspection JSUnusedLocalSymbols
        const circle = new google.maps.Circle({
            map: map,
            center: map.center,
            radius: 40,
            strokeColor: "#ebbc4a",
            strokeOpacity: 0.8,
            strokeWeight: 1.5,
            fillOpacity: 0,
        });
    }

    // replace map markers with a nice circle
    function mapMarker(markers) {
        for (let i = 0; i < markers.length; ++i) {
            const marker = markers[i];
            marker.setIcon(PORTAL_MARKER);
        }
    }

    // set available map types
    function mapTypes(map, isMainMap) {
        const PROVIDERS = {
            GOOGLE: "google",
            KARTVERKET: "kartverket",
        };

        const types = [
            {provider: PROVIDERS.GOOGLE, id: "roadmap"},
            {provider: PROVIDERS.GOOGLE, id: "terrain"},
            {provider: PROVIDERS.GOOGLE, id: "satellite"},
            {provider: PROVIDERS.GOOGLE, id: "hybrid"},
            {provider: PROVIDERS.KARTVERKET, id: `${PROVIDERS.KARTVERKET}_topo`, code: "topo4", label: "NO - Topo"},
            {
                provider: PROVIDERS.KARTVERKET,
                id: `${PROVIDERS.KARTVERKET}_raster`,
                code: "toporaster3",
                label: "NO - Raster"
            },
            {
                provider: PROVIDERS.KARTVERKET,
                id: `${PROVIDERS.KARTVERKET}_sjo`,
                code: "sjokartraster",
                label: "NO - Sjøkart"
            },
        ];

        const defaultType = "hybrid";

        const mapOptions = {
            // re-enabling map scroll zoom and allow zoom with out holding ctrl
            scrollwheel: true,
            gestureHandling: "greedy",
            // map type selection
            mapTypeControl: true,
            mapTypeControlOptions: {
                mapTypeIds: types.map(t => t.id),
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        };
        map.setOptions(cloneInto(mapOptions, w));

        // register custom map types
        types.forEach(t => {
            switch (t.provider) {
                case PROVIDERS.KARTVERKET:
                    map.mapTypes.set(t.id, new google.maps.ImageMapType({
                        layer: t.code,
                        name: t.label,
                        alt: t.label,
                        maxZoom: 19,
                        tileSize: new google.maps.Size(256, 256),
                        getTileUrl: function (coord, zoom) {
                            return `//opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=${this.layer}&zoom=${zoom}&x=${coord.x}&y=${coord.y}`;
                        }
                    }));
                    break;
            }
        });

        // track current selection for main position map
        if (isMainMap) {
            // save selection when changed
            map.addListener("maptypeid_changed", function () {
                w.localStorage.setItem(OPRT.MAP_TYPE, map.getMapTypeId());
            });

            // get map type saved from last use or fall back to default
            map.setMapTypeId(w.localStorage.getItem(OPRT.MAP_TYPE) || defaultType);
        }
    }

    // move submit button to right side of classification-div. don't move on mobile devices / small width
    function moveSubmitButton() {
        const submitDiv = w.document.querySelectorAll("#submitDiv, #submitDiv + .text-center");

        if (screen.availWidth > 768) {
            let newSubmitDiv = w.document.createElement("div");
            const classificationRow = w.document.querySelector(".classification-row");
            newSubmitDiv.className = "col-xs-12 col-sm-6";
            submitDiv[0].style.marginTop = 16;
            newSubmitDiv.appendChild(submitDiv[0]);
            newSubmitDiv.appendChild(submitDiv[1]);
            classificationRow.insertAdjacentElement("afterend", newSubmitDiv);

            // edit-page - remove .col-sm-offset-3 from .classification-row (why did you add this, niantic?
            classificationRow.classList.remove("col-sm-offset-3");
            return newSubmitDiv;
        } else {
            return submitDiv[0];
        }
    }

    // expand automatically the "What is it?" filter text box
    function expandWhatIsItBox() {
        try {
            const f = w.document.querySelector("#WhatIsItController > div > p > span.ingress-mid-blue.text-center");
            setTimeout(() => {
                f.click();
            }, 250);
        } catch (err) {
        }
    }


    function modifyHeader() {
        // stats enhancements: add processed by nia, percent processed, progress to next recon badge numbers

        // get scanner offset from localStorage
        let oprt_scanner_offset = parseInt(w.localStorage.getItem(OPRT.SCANNER_OFFSET)) || 0;

        const lastPlayerStatLine = w.document.querySelector("#player_stats:not(.visible-xs) div");
        const stats = w.document.querySelector("#player_stats").children[2];

        const reviewed = parseInt(stats.children[3].children[2].innerText);
        const accepted = parseInt(stats.children[5].children[2].innerText);
        const rejected = parseInt(stats.children[7].children[2].innerText);

        const processed = accepted + rejected - oprt_scanner_offset;
        const percent = Math.round(processed / reviewed * 1000) / 10;

        const reconBadge = {100: "Bronze", 750: "Silver", 2500: "Gold", 5000: "Platin", 10000: "Black"};
        let nextBadgeName, nextBadgeCount;

        for (const key in reconBadge) {
            if (processed <= key) {
                nextBadgeCount = key;
                nextBadgeName = reconBadge[key];
                break;
            }
        }
        const nextBadgeProcess = processed / nextBadgeCount * 100;

        lastPlayerStatLine.insertAdjacentHTML("beforeEnd", `<br>
<p><span class="glyphicon glyphicon-info-sign ingress-gray pull-left"></span><span style="margin-left: 5px;" class="ingress-mid-blue pull-left">Processed <u>and</u> accepted analyses:</span> <span class="gold pull-right">${processed} (${percent}%) </span></p>`);

        if (accepted < 10000) {

            lastPlayerStatLine.insertAdjacentHTML("beforeEnd", `
<br><div>Next recon badge tier: <b>${nextBadgeName} (${nextBadgeCount})</b><span class='pull-right'></span>
<div class='progress'>
<div class='progress-bar progress-bar-warning'
role='progressbar'
aria-valuenow='${nextBadgeProcess}'
aria-valuemin='0'
aria-valuemax='100'
style='width: ${Math.round(nextBadgeProcess)}%;'
title='${nextBadgeCount - processed} to go'>
${Math.round(nextBadgeProcess)}%
</div></div></div>
`);
        }

        else lastPlayerStatLine.insertAdjacentHTML("beforeEnd", `<hr>`);
        lastPlayerStatLine.insertAdjacentHTML("beforeEnd", `<p><i class="glyphicon glyphicon-share"></i> <input readonly onFocus="this.select();" style="width: 90%;" type="text"
value="Reviewed: ${reviewed} / Processed: ${accepted + rejected } (Created: ${accepted}/ Rejected: ${rejected}) / ${Math.round(percent)}%"/></p>`);

        let tooltipSpan = `<span class="glyphicon glyphicon-info-sign ingress-gray pull-left" uib-tooltip-trigger="outsideclick" uib-tooltip-placement="left" tooltip-class="goldBorder"
uib-tooltip="Use negative values, if scanner is ahead of OPR"></span>`;

        // ** opr-scanner offset
        if (accepted < 10000) {
            lastPlayerStatLine.insertAdjacentHTML("beforeEnd", `
<p id='scannerOffsetContainer'>
<span style="margin-left: 5px" class="ingress-mid-blue pull-left">Scanner offset:</span>
<input id="scannerOffset" onFocus="this.select();" type="text" name="scannerOffset" size="8" class="pull-right" value="${oprt_scanner_offset}">
</p>`);
        }

        // we have to inject the tooltip to angular
        w.$injector.invoke(cloneInto(["$compile", ($compile) => {
            let compiledSubmit = $compile(tooltipSpan)(w.$scope(stats));
            w.document.getElementById("scannerOffsetContainer").insertAdjacentElement("afterbegin", compiledSubmit[0]);
        }], w, {cloneFunctions: true}));


        ["change", "keyup", "cut", "paste", "input"].forEach(e => {
            w.document.getElementById("scannerOffset").addEventListener(e, (event) => {
                w.localStorage.setItem(OPRT.SCANNER_OFFSET, event.target.value);
            });
        });
        // **

        modifyHeader = () => {
        }; // just run once
    }

    function addRefreshContainer() {

        let cbxRefresh = w.document.createElement("input");
        let cbxRefreshSound = w.document.createElement("input");
        let cbxRefreshDesktop = w.document.createElement("input");

        cbxRefresh.id = OPRT.REFRESH;
        cbxRefresh.type = "checkbox";
        cbxRefresh.checked = (w.localStorage.getItem(cbxRefresh.id) == "true");

        cbxRefreshSound.id = OPRT.REFRESH_NOTI_SOUND;
        cbxRefreshSound.type = "checkbox";
        cbxRefreshSound.checked = (w.localStorage.getItem(cbxRefreshSound.id) == "true");

        cbxRefreshDesktop.id = OPRT.REFRESH_NOTI_DESKTOP;
        cbxRefreshDesktop.type = "checkbox";
        cbxRefreshDesktop.checked = (w.localStorage.getItem(cbxRefreshDesktop.id) == "true");

        let refreshPanel = w.document.createElement("div");
        refreshPanel.className = "panel panel-ingress";

        refreshPanel.addEventListener("change", (event) => {
            w.localStorage.setItem(event.target.id, event.target.checked); // i'm lazy
            if (event.target.checked) {
                startRefresh();
            } else {
                stopRefresh();
            }
        });

        refreshPanel.innerHTML = `
<div class='panel-heading'><span class='glyphicon glyphicon-refresh'></span> Refresh <sup>beta</sup> <a href='https://gitlab.com/1110101/opr-tools'><span class='label label-success pull-right'>OPR-Tools</span></a></div>
<div id='cbxDiv' class='panel-body bg-primary' style='background:black;'></div>`;

        refreshPanel.querySelector("#cbxDiv").insertAdjacentElement("afterbegin", appendCheckbox(cbxRefreshSound, "Notification sound"));
        refreshPanel.querySelector("#cbxDiv").insertAdjacentElement("afterbegin", appendCheckbox(cbxRefreshDesktop, "Desktop notification"));
        refreshPanel.querySelector("#cbxDiv").insertAdjacentElement("afterbegin", appendCheckbox(cbxRefresh, "Refresh every 5-10 minutes"));

        let colDiv = w.document.createElement("div");
        colDiv.className = "col-md-4 col-md-offset-4";
        colDiv.appendChild(refreshPanel);

        let rowDiv = w.document.createElement("div");
        rowDiv.className = "row";
        rowDiv.appendChild(colDiv);

        w.document.getElementById("NewSubmissionController").insertAdjacentElement("beforeend", rowDiv);

        cbxRefresh.checked === true ? startRefresh() : stopRefresh();

        function appendCheckbox(checkbox, text) {
            let label = w.document.createElement("label");
            let div = w.document.createElement("div");
            div.className = "checkbox";
            label.appendChild(checkbox);
            label.appendChild(w.document.createTextNode(text));
            div.appendChild(label);
            return div;
        }

        addRefreshContainer = () => {
        }; // run only once
    }

    let refreshIntervalID;

    function startRefresh() {
        let time = getRandomIntInclusive(5, 10) * 60000;

        refreshIntervalID = setInterval(() => {
            reloadOPR();
        }, time);

        function reloadOPR() {
            clearInterval(refreshIntervalID);
            w.sessionStorage.setItem(OPRT.FROM_REFRESH, "true");
            w.document.location.reload();
        }

        // source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    function stopRefresh() {
        clearInterval(refreshIntervalID);
    }

    function checkIfAutorefresh() {
        if (w.sessionStorage.getItem(OPRT.FROM_REFRESH)) {
            // reset flag
            w.sessionStorage.removeItem(OPRT.FROM_REFRESH);

            if (w.document.hidden) { // if tab in background: flash favicon
                let flag = true;

                if (w.localStorage.getItem(OPRT.REFRESH_NOTI_SOUND) == "true") {
                    let audio = document.createElement("audio");
                    audio.src = NOTIFICATION_SOUND;
                    audio.autoplay = true;
                }
                if (w.localStorage.getItem(OPRT.REFRESH_NOTI_DESKTOP) == "true") {
                    GM_notification({
                        "title": "OPR - New Portal Analysis Available",
                        "text": "by OPR-Tools",
                        "image": "https://gitlab.com/uploads/-/system/project/avatar/3311015/opr-tools.png",
                    });
                }

                let flashId = setInterval(() => {
                    flag = !flag;
                    changeFavicon(`${flag ? PORTAL_MARKER : "/imgpub/favicon.ico"}`);
                }, 1000);

                // stop flashing if tab in foreground
                addEventListener("visibilitychange", () => {
                    if (!w.document.hidden) {
                        changeFavicon("/imgpub/favicon.ico");
                        clearInterval(flashId);
                    }
                });
            }
        }
    }

    function changeFavicon(src) {
        let link = w.document.querySelector("link[rel='shortcut icon']");
        link.href = src;
    }

    function startExpirationTimer(subController) {

        w.document.querySelector("ul.nav.navbar-nav > li:nth-child(7)").insertAdjacentHTML("afterbegin", "<a><span id=\"countdownDisplay\"></span></a>");

        let countdownEnd = subController.countdownDate;
        let countdownDisplay = document.getElementById("countdownDisplay");
        countdownDisplay.style.color = "white";

        // Update the count down every 1 second
        let counterInterval = setInterval(function () {
            // Get todays date and time
            let now = new Date().getTime();
            // Find the distance between now an the count down date
            let distance = countdownEnd - now;
            // Time calculations for minutes and seconds
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element
            countdownDisplay.innerText = `${minutes}m ${seconds}s `;

            if (distance < 0) {
                // If the count down is finished, write some text
                clearInterval(counterInterval);
                countdownDisplay.innerText = STRINGS.expired;
                countdownDisplay.classList.add("blink");


            } else if (distance < 60) {
                countdownDisplay.style.color = "red";
            }
        }, 1000);
    }


    function addCustomPresetButtons() {
        // add customPreset UI
        oprt_customPresets = getCustomPresets(w);
        let customPresetOptions = "";
        for (const customPreset of oprt_customPresets) {
            customPresetOptions += `<button class='button btn btn-default customPresetButton' id='${customPreset.uid}'>${customPreset.label}</button>`;
        }
        w.document.getElementById("customPresets").innerHTML = customPresetOptions;
    }

    function getCustomPresets(w) {
        // simply to scope the string we don't need after JSON.parse
        let presetsJSON = w.localStorage.getItem("oprt_custom_presets");
        if (presetsJSON != null && presetsJSON != "") {
            return JSON.parse(presetsJSON);
        }
        return [];
    }

    function saveCustomPreset(label, ansController, whatController) {
        // uid snippet from https://stackoverflow.com/a/47496558/6447397
        let preset = {
            uid: [...Array(5)].map(() => Math.random().toString(36)[3]).join(""),
            label: label,
            nodeName: whatController.whatNode.name,
            nodeId: whatController.whatNode.id,
            quality: ansController.formData.quality,
            description: ansController.formData.description,
            cultural: ansController.formData.cultural,
            uniqueness: ansController.formData.uniqueness,
            location: ansController.formData.location,
            safety: ansController.formData.safety
        };
        oprt_customPresets.push(preset);
        w.localStorage.setItem("oprt_custom_presets", JSON.stringify(oprt_customPresets));
    }

    function deleteCustomPreset(preset) {
        oprt_customPresets = oprt_customPresets.filter(item => item.uid !== preset.uid);
        w.localStorage.setItem("oprt_custom_presets", JSON.stringify(oprt_customPresets));
    }

    function showHelp() {
        let helpString = `<a href='https://gitlab.com/1110101/opr-tools'><span class='label label-success'>OPR-Tools</span></a> Key shortcuts
<table class="table table-condensed ">
	<thead>
	<tr>
		<th>Key(s)</th>
		<th>Function</th>
	</tr>
	</thead>
	<tbody>
	<tr>
		<td>Keys 1-5, Numpad 1-5</td>
		<td>Valuate current selected field (the yellow highlighted one)</td>
	</tr>
	<tr>
		<td><i>Shift</i> + Keys 1-5</td>
		<td>Apply custom preset (if exists)</td>
	</tr>
	<tr>
		<td>D</td>
		<td>Mark current candidate as a duplicate of the opened portal in "duplicates"</td>
	</tr>
	<tr>
		<td>T</td>
		<td>Open title translation</td>
	</tr>
	<tr>
		<td>Y</td>
		<td>Open description translation</td>
	</tr>
	<tr>
		<td>Space, Enter, Numpad Enter</td>
		<td>Confirm dialog / Send valuation</td>
	</tr>
	<tr>
		<td>Tab, Numpad +</td>
		<td>Next field</td>
	</tr>
	<tr>
		<td>Shift, Backspace, Numpad -</td>
		<td>Previous field</td>
	</tr>
	<tr>
		<td>Esc, Numpad /</td>
		<td>First field</td>
	</tr>
	<tr>
		<td>^, Numpad *</td>
		<td>Skip Portal (if possible)</td>
	</tr>
	</tbody>
</table>`;

        alertify.closeLogOnClick(false).logPosition("bottom right").delay(0).log(helpString, (ev) => {
            ev.preventDefault();
            ev.target.closest("div.default.show").remove();

        }).reset();

    }

}

setTimeout(() => {
    init();
}, 500);


//region const

const GLOBAL_CSS = `
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

/**
* Ingress Panel Style
*/

.panel-ingress {
background-color: #004746;
border: 1px solid #0ff;
border-radius: 1px;
box-shadow: inset 0 0 6px rgba(255, 255, 255, 1);
color: #0ff;
}

/**
* Tooltip Styles
*/

/* Add this attribute to the element that needs a tooltip */
[data-tooltip] {
position: relative;
cursor: pointer;
}

/* Hide the tooltip content by default */
[data-tooltip]:before,
[data-tooltip]:after {
visibility: hidden;
-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
filter: progid: DXImageTransform.Microsoft.Alpha(Opacity=0);
opacity: 0;
pointer-events: none;
}

/* Position tooltip above the element */
[data-tooltip]:before {
position: absolute;
top: 150%;
left: 50%;
margin-bottom: 5px;
margin-left: -80px;
padding: 7px;
width: relative;
-webkit-border-radius: 3px;
-moz-border-radius: 3px;
border-radius: 3px;
background-color: #000;
background-color: hsla(0, 0%, 20%, 0.9);
color: #fff;
content: attr(data-tooltip);
text-align: center;
font-size: 14px;
line-height: 1.2;
z-index: 100;
}

/* Triangle hack to make tooltip look like a speech bubble */
[data-tooltip]:after {
position: absolute;
top: 132%;
left: relative;
width: 0;
border-bottom: 5px solid #000;
border-bottom: 5px solid hsla(0, 0%, 20%, 0.9);
border-right: 5px solid transparent;
border-left: 5px solid transparent;
content: " ";
font-size: 0;
line-height: 0;
}

/* Show tooltip content on hover */
[data-tooltip]:hover:before,
[data-tooltip]:hover:after {
visibility: visible;
-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
filter: progid: DXImageTransform.Microsoft.Alpha(Opacity=100);
opacity: 1;
}

blink, .blink {
-webkit-animation: blink 2s step-end infinite;
-moz-animation: blink 2s step-end infinite;
-o-animation: blink 2s step-end infinite;
animation: blink 2s step-end infinite;
}

@-webkit-keyframes blink {
67% { opacity: 0 }
}

@-moz-keyframes blink {
67% { opacity: 0 }
}

@-o-keyframes blink {
67% { opacity: 0 }
}

@keyframes blink {
67% { opacity: 0 }
}

.titleEditBox:hover {
	box-shadow: inset 0 0 20px #ebbc4a;
}

.titleEditBox:active {
	box-shadow: inset 0 0 15px 2px white;
}

.alertify .dialog .msg {
color: black;
}
.alertify-logs > .default {
    background-image: url(/img/ingress-background-dark.png) !important;
}

.btn-xs {
padding: 1px 5px !important;
}

`;

const PORTAL_MARKER = "data:image/PNG;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAAd0SU1FB+EHEAccLVUS/qUAAAI0SURBVDjLldTNa55VEAXw39zniTGRqvEDUqOLiEGKKEELbcS9IG79AxSJqCju3MZ/oNhFwFZtEZeKS1FKXRgRLVK6qSVoGkWbCkbRlHy8b/I+46K3sYg1eJZ35p4599yZCf9AfoH3NQZuUrRCCzo72NHo6xnESRJR77WQs8TxevKeceEx4TCmpEkQfsCSzleGfJOsBPIZ4oO/CeULijCGV3RekkaEgnItReqETbyt86ZFq7Gg21VU0yZ1jgozGBbOS5eE1Upyl3APHpJeVBx0wGsWfAuRiVkTilnpdfwpfC19h560U3W3OkMaUzqHhDuFI1rz5v3UzK1r9T0pvSHcjNM4j00MhHTV14GwjVVsCFPSI9IFj1os1tyCGaGVzgoXse3G2MEyzgpFelyxrwjDeBADLEtb9kLoScvoC5PCSJGG8QA6rEgDe6MTLmNLZ0XqlWpk4/8j0QqHdG4t1cCfhcDYdX3zXxSBO6qAdY1BMaQvLUkN7q1NuJdHRZpAK32PzeJ36zhT60zjvj2e2mBCmK7FzwhXio/0tT4XPsbdmKnVyr8oCezHDMYVp7Q+86uNNjZlXrJowryBg7hfGJXOKS7r/FZJxqT9mMa4dBFvCRfiQxnXpjdfNWrLE3gWT0sbdUB7Vc8wRjAqfKpzQmch3nUlZ+v058vE/O4WeBhPSYdrf01Woh+lJXyp+CSOOQf5PPHOdWtk92efU4zYZ9s4bpduq6E16Q+NX7AWx3Q5R8xdDf4FFQPK0NE5za8AAAAASUVORK5CYII=";


const NOTIFICATION_SOUND = `data:audio/ogg;base64,
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
HAE=`;
//endregion
