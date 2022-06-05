// @ts-check

//This file contains many common and core components for the website to function

/*if (window.console) console = {
    log: function () {
        var output = '',
            console = document.getElementById('console');
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i] + ' ';
        }
        console.innerText += output + "\n";
    },
    error: function () {
        var output = '',
            console = document.getElementById('console');
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i] + ' ';
        }
        console.innerText += output + "\n";
    },
    warn: function () {
        var output = '',
            console = document.getElementById('console');
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i] + ' ';
        }
        console.innerText += output + "\n";
    },
    debug: function () {
        var output = '',
            console = document.getElementById('console');
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i] + ' ';
        }
        console.innerText += output + "\n";
    },
    info: function () {
        var output = '',
            console = document.getElementById('console');
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i] + ' ';
        }
        console.innerText += output + "\n";
    },
    exception: function () {
        var output = '',
            console = document.getElementById('console');
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i] + ' ';
        }
        console.innerText += output + "\n";
    }
};
console.log("Console Working");*/

var core = {};

//---------------------------------------------------
//-----------------------Enums-----------------------
//---------------------------------------------------

core.PanelState = {
    Empty: 0,
    Unloading: 1,
    Loading: 2,
    Idle: 3
}


//---------------------------------------------------
//---------------------Variables---------------------
//---------------------------------------------------

core.root = document.querySelector(':root');
core.headerBar = document.getElementById("header-bar");

/** @type {Array.<{button: Element, name: string, title: string, buttonID: string}>} */
core.panels = [];

/** @type {{button: Element, name: string, title: string, buttonID: string}} */
core.selectedPanel = null;

core.urlParams = new URLSearchParams(window.location.search);

core.fadeOutSpeed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fade-speed').slice(0, -2));

core.currentPanelState = core.PanelState.Empty;

core.fontSize = parseFloat(window.getComputedStyle(document.body).getPropertyValue('font-size').slice(0, -2));

core.onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);


//---------------------------------------------------
//-----------------------Events----------------------
//---------------------------------------------------

core.events = {};

/** @type {Array.<(panel: {button: Element, name: string, title: string, buttonID: string}) => void>} */
core.events.onPanelButtonClickedEvent = new Array(0);

/** @type {Array.<(panel: {button: Element, name: string, title: string, buttonID: string}) => void>} */
core.events.onPanelLeaveEvent = new Array(0);

/** @type {Array.<(panel: {button: Element, name: string, title: string, buttonID: string}) => void>} */
core.events.onEnterPanelEvent = new Array(0);

/** @type {Array.<(dt: number) => void>} */
core.events.updateEvent = new Array(0);

/** @type {Array.<(newState: number) => void>} */
core.events.panelStateChangeEvent = new Array(0);





//---------------------------------------------------
//---------------------Functions---------------------
//---------------------------------------------------

var loadingInterval = 0;

core.loadDefaultPanel = function () {
    if (loadingInterval != 0) {
        clearInterval(loadingInterval);
        loadingInterval = 0;
    }
    if (core.urlParams.has("project") && core.urlParams.get("project")) {
        var project = core.urlParams.get("project");
        core.switchToPanel("projects", false).then(() => {
            //Repeat until the projects have been loaded
            loadingInterval = setInterval(() => {
                if (projectPanel !== undefined && projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded) {
                    projectPanel.openProject(project);
                    clearInterval(loadingInterval);
                    loadingInterval = 0;
                }
            }, 100);
        });
    }
    else {
        var foundPanel = false;
        for (var i = 0; i < core.panels.length; i++) {
            if (core.urlParams.has(core.panels[i].name)) {
                core.switchToPanel(core.panels[i].name, false);
                foundPanel = true;
                break;
            }
        }

        //If we reached this point, then switch to the home panel by default
        if (!foundPanel) {
            core.switchToPanel("home", false);
        }
    }
};

window.addEventListener('popstate', (event) => {
    core.urlParams = new URLSearchParams(document.location.search);
    core.loadDefaultPanel();
});


//Loads all the available panels
core.loadPanels = function() {
    for (var i = 0; i < core.headerBar.childElementCount; i++) {
        var button = core.headerBar.children[i];
        var name = button.id.slice(0, -7);
        var title = button.innerHTML;
        button.setAttribute("onclick", "core.clickPanelButton(this);");

        core.panels.push({
            button: button,
            name: name,
            buttonID: button.id,
            title: title
        });
    }
}

/**
 * 
 * @param {string} panelName
 * @returns {Promise.<void>}
 */
core.switchToPanel = function(panelName, addToHistory = true) {
    var panel = core.panels.find(p => p.name == panelName);
    if (panel != null) {
        return core.clickPanelButton(panel.button, addToHistory);
    }
    else {
        return Promise.resolve();
    }
}

/**
 * 
 * @param {Element} button
 * @returns {Promise.<void>}
 */
core.clickPanelButton = function(button, addToHistory = true) {
    if (oldPanel != null && oldPanel.buttonID == button.id) {
        return;
    }
    var oldPanel = core.selectedPanel;

    if (oldPanel != null) {
        oldPanel.button.classList.remove("selected-menu-item");
    }

    var newPanel = core.panels.find(p => p.buttonID == button.id);

    core.selectedPanel = newPanel;

    if (newPanel != null) {
        newPanel.button.classList.add("selected-menu-item");
    }

    core.callEvent(core.events.onPanelButtonClickedEvent, newPanel);

    if (oldPanel != null) {
        core.callEvent(core.events.onPanelLeaveEvent, oldPanel);
    }

    if (addToHistory) {
        if (newPanel.name == "home") {
            window.history.pushState({}, "Nickc01 Portfolio", core.getURL());
        }
        else {
            window.history.pushState({}, "Nickc01 Portfolio", core.getURL() + "?" + newPanel.name);
        }
    }

    return new Promise((resolve, reject) => {
        Promise.all([core.unloadCurrentPanel(), fetch("panels/" + newPanel.name + ".html")]).then(response => {
            if (response[0]) {
                core.changePanelState(core.PanelState.Loading);
                return response[1].text().then(panelSrc => {
                    var newElement = document.createElement("div");
                    document.body.appendChild(newElement);
                    newElement.outerHTML = panelSrc;
                    core.changePanelState(core.PanelState.Idle);
                    core.callEvent(core.events.onEnterPanelEvent, newPanel);
                    resolve();
                });
            }
            else {
                reject("Panel is already being loaded");
            }
        }).catch(reason => {
            if (reason != "Panel is already being loaded") {
                throw reason;
            }
        });
    });
}

/** @returns {Promise.<boolean>} */
core.unloadCurrentPanel = function() {
    if (core.currentPanelState == core.PanelState.Idle) {
        core.changePanelState(core.PanelState.Unloading);
        return new Promise((resolve, reject) => {
            var valid = true;

            var onNewPanelClicked = null;
            onNewPanelClicked = function (panel) {
                valid = false;
                core.removeFromEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
            }
            core.addToEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);


            var sections = document.getElementsByClassName("primary-section");
            var oldSection = null;
            if (sections.length > 0) {
                oldSection = sections[0];
            }

            if (oldSection) {
                oldSection.classList.remove("doFadeIn");
                if (!oldSection.classList.contains("doFadeOut")) {
                    oldSection.classList.add("doFadeOut");
                }
            }

            setTimeout(() => {
                if (oldSection) {
                    oldSection.parentElement.removeChild(oldSection);
                }
                if (valid) {
                    core.removeFromEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
                    core.changePanelState(core.PanelState.Empty);
                    resolve(true);
                }
                else {
                    core.changePanelState(core.PanelState.Empty);
                    resolve(false);
                }
            }, core.fadeOutSpeed);
        });
    }
    else if (core.currentPanelState == core.PanelState.Unloading) {
        return new Promise((resolve, reject) => {
            var onStateChange = null;
            var onNewPanelClicked = null;
            var cleanup = null;

            onStateChange = function (newState) {
                if (newState == core.PanelState.Empty) {
                    cleanup();
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            };

            onNewPanelClicked = function (panel) {
                cleanup();
                resolve(false);
            };

            cleanup = function () {
                core.removeFromEvent(core.events.panelStateChangeEvent, onStateChange);
                core.removeFromEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
            };


            core.addToEvent(core.events.panelStateChangeEvent, onStateChange);
            core.addToEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
        });
    }
    else if (core.currentPanelState == core.PanelState.Loading) {
        return Promise.resolve(false);
    }
    else {
        return Promise.resolve(true);
    }
}

/**
 * 
 * @param {Array} array
 * @param {any} func
 */
core.addToEvent = function(array, func) {
    array.splice(0, 0, func);
}

/**
 *
 * @param {Array} array
 * @param {any} func
 */
core.removeFromEvent = function(array, func) {
    var index = array.findIndex(f => f == func);
    if (index > -1) {
        array.splice(index, 1);
    }
}
/**
 * 
 * @param {Array} eventArray
 * @param {...any} parameters
 */
core.callEvent = function(eventArray, ...parameters) {
    for (var i = eventArray.length - 1; i >= 0; i--) {
        eventArray[i].call(this, ...parameters);
    }
}

/**
 * 
 * @param {number} newState
 */
core.changePanelState = function(newState) {
    if (core.currentPanelState !== newState) {
        core.currentPanelState = newState;
        core.callEvent(core.events.panelStateChangeEvent, newState);
    }
}

/** @returns {string} */
core.getURL = function() {
    var url = window.location.href;
    if (url.search("/?") !== -1) {
        return url.split("?")[0];
    }
    else {
        return url;
    }
}

/** */
core.usingTouchDevice = function() {
    return ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
}

//var cssExpression = new RegExp(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})((,\s*[\d\.]*)?)\)/g);

/**
 * 
 * @param {string} value
 * @returns {Array.<number>}
 */
core.cssToColor = function (value) {
    if (value.startsWith("#")) {
        return core.hexToRgb(value);
    }
    if (value.startsWith("rgba")) {
        value = value.slice(5,-1);
    }
    else {
        value = value.slice(4,-1);
    }

    var result = value.split(", ");

    var colorResult = [0, 0, 0, 1.0];


    for (var i = 0; i < result.length; i++) {
        colorResult[i] = Number(result[i]);
    }

    /*if (result.length == 3) {
        result.push(1.0);
    }*/

    colorResult[3] *= 255;

    return colorResult;

    //171, 221, 126

    /*console.log("Value = " + value);
    console.log("Expression = " + cssExpression);
    return cssExpression.test(value);*/
}

/**
 * 
 * @param {Array.<number>} colors
 * @returns {string}
 */
core.colorToCSS = function (colors) {
    if (colors.length > 3) {
        return "rgba(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ", " + (colors[3] / 255.0) + ")";
    }
    else {
        return "rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")";
    }
}

/**
 * 
 * @param {number} c
 * @return {string}
 */
function componentToHex(c) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
 * 
 * @param {Array.<number>} color
 * @returns {string}
 */
core.rgbToHex = function(color) {
    var result = "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
    if (color.length >= 4) {
        result += componentToHex(color[3]);
    }
    return result;
}

/**
 * 
 * @param {string} hex
 * @returns {Array.<number>}
 */
core.hexToRgb = function(hex) {
    hex = hex.replace(" ", "");
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)];
    }
    else {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255];
        }
        return null;
    }
}

/**
 * 
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
core.lerp = function(a, b, t) {
    return a + ((b - a) * t);
}

/**
 * 
 * @param {Array.<number>} a
 * @param {Array.<number>} b
 * @param {number} t
 * @returns {Array.<number>}
 */
core.lerpArray = function(a, b, t) {
    return [core.lerp(a[0], b[0], t), core.lerp(a[1], b[1], t), core.lerp(a[2], b[2], t), core.lerp(a[3], b[3], t)];
}

function RemoveAutoPlay() {
    var videoAreaElement = document.getElementById("video-area");
    var vs = videoAreaElement.getElementsByTagName("video");
    if (vs.length > 0) {
        var videoElement = vs[0];
        videoElement.setAttribute("controls", '');
        videoElement.removeAttribute("autoplay");
    }
}

/*console.log("CSS Test = " + core.cssToColor("rgb(171, 221, 126)"));
console.log("CSS Test 2 = " + core.cssToColor("rgba(46, 56, 58, 1.00)"));

console.log("Color Test 1 = " + core.colorToCSS([255,0,0,127]));
console.log("Color Test 2 = " + core.colorToCSS([128, 125, 0, 255]));*/


//---------------------------------------------------
//------------------Initialization-------------------
//---------------------------------------------------

core.loadPanels();

core.loadDefaultPanel();

if (core.onMobile) {
    RemoveAutoPlay();
}



//---------------------------------------------------
//--------------------Update Loop--------------------
//---------------------------------------------------

window.requestAnimationFrame(Update_Loop);

var prevTime = 0;

/**
 * 
 * @param {number} time 
 */
function Update_Loop(time) {
    core.callEvent(core.events.updateEvent,(time - prevTime) / 1000.0);
    prevTime = time;

    window.requestAnimationFrame(Update_Loop);
}


console.log("Core Loaded");