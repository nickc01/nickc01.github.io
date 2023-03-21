// @ts-check

//This file contains many common and core components for the website to function

var core = {};

//---------------------------------------------------
//-----------------------Enums-----------------------
//---------------------------------------------------

/**
 * A enum of possible states a panel can be in
 */
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
core.headerBar = document.getElementById("panels");

/** 
 * Stores a list of all the available panels
 * @type {Array.<{button: Element, name: string, title: string, buttonID: string}>} */
core.panels = [];

/** 
 * Contains the currently loaded panel, or null if no panel is currently loaded
 * @type {{button: Element, name: string, title: string, buttonID: string} | null} */
core.selectedPanel = null;

core.urlParams = new URLSearchParams(window.location.search);

/**
 * How fast a panel should fade out when a panel button is clicked
 */
core.fadeOutSpeed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fade-speed').slice(0, -2));

core.currentPanelState = core.PanelState.Empty;

core.fontSize = parseFloat(window.getComputedStyle(document.body).getPropertyValue('font-size').slice(0, -2));

core.onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

core.AVIFSupported = null;


//---------------------------------------------------
//-----------------------Events----------------------
//---------------------------------------------------

core.events = {};

/** 
 * An event called whenever a panel button at the top of the screen is clicked
 * @type {Array.<(panel: {button: Element, name: string, title: string, buttonID: string}) => void>} */
core.events.onPanelButtonClickedEvent = new Array(0);

/** 
 * An event called whenever a panel unloads
 * @type {Array.<(panel: {button: Element, name: string, title: string, buttonID: string}) => void>} */
core.events.onPanelLeaveEvent = new Array(0);

/** 
 * An event called whenever a new panel loads in
 * @type {Array.<(panel: {button: Element, name: string, title: string, buttonID: string}) => void>} */
core.events.onEnterPanelEvent = new Array(0);

/**
 * An event called once every frame 
 * @type {Array.<(dt: number) => void>} */
core.events.updateEvent = new Array(0);

/** 
 * An event called whenever the current panel state changes.
 * @type {Array.<(newState: number) => void>}
 * @see core.PanelState */
core.events.panelStateChangeEvent = new Array(0);

/** 
 * An event called when the window is fully loaded
 * @type {Array.<() => void>} */
core.events.onWindowLoad = new Array(0);





//---------------------------------------------------
//---------------------Functions---------------------
//---------------------------------------------------

/**
 * Waits until conditionFunc returns true. When it does, it will call afterFunc
 * @param {() => boolean} conditionFunc The condition function to test
 * @param {() => void} afterFunc The function to call when conditionFunc returns true
 */
function waitUntil(conditionFunc, afterFunc)
{
    var interval = 0;
    interval = setInterval(() => {
        if (conditionFunc()) {
            clearInterval(interval);
            afterFunc();
        }
    });
}

/**
 * Loads the default panel upon loading the page, which may depend on what is in the URL
 */
core.loadDefaultPanel = function () {
    //If the url has "?project" in it. Then attempt to load up a project in the project panel
    if (core.urlParams.has("project") && core.urlParams.get("project")) {
        var project = core.urlParams.get("project");
        //Switch to the "Projects" panel
        core.switchToPanel("projects", false).then(() => {
            //Wait until the projects-panel.js script has loaded and the projects panel has loaded
            waitUntil(() => projectPanel && projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded,() => {
                //Open up the project and display it in a window
                projectPanel.openProject(project);
            });
        });
    }
    else {
        var foundPanel = false;
        //Loop through all the possible panels
        for (var i = 0; i < core.panels.length; i++) {
            //If "?PANEL_NAME" is included in the URL
            if (core.urlParams.has(core.panels[i].name)) {
                //Switch to that panel and break out of the loop
                core.switchToPanel(core.panels[i].name, false);
                foundPanel = true;
                break;
            }
        }
        //If no panel was found
        if (!foundPanel) {
            //Wait until the projects-panel.js script has loaded
            waitUntil(() => projectPanel && projectPanel.projects,() => {
                var loadedProject = false;
                //Loop over all the projects in the projects panel
                for (var p in projectPanel.projects) {
                    if (projectPanel.projects.hasOwnProperty(p)) {
                        //If "?PROJECT_NAME" is stored in the URL
                        if (core.urlParams.has(p)) {
                            //Switch to the projects panel
                            core.switchToPanel("projects", false).then(() => {
                                //Wait until the projects panel has loaded
                                waitUntil(() => projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded,() => {
                                    projectPanel.openProject(p);
                                });
                            });
                            loadedProject = true;
                            break;
                        }
                    }
                }

                //If we reached this point, then switch to the home panel by default
                if (!loadedProject) {
                    core.switchToPanel("home", false);
                }
            });
        }
    }
};

window.addEventListener('popstate', (event) => {
    core.urlParams = new URLSearchParams(document.location.search);
    core.loadDefaultPanel();
});


/**
 * Loads all the available panels
 */
core.loadPanels = function() {
    for (var i = 0; i < core.headerBar.childElementCount; i++) {
        var button = core.headerBar.children[i];
        if (button.tagName == "A") {
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
}

/**
 * Switches to a new panel
 * @param {string} panelName The name of the panel to switch to
 * @param {boolean} addToHistory If set to true, will record switch to the browser's history
 * @returns {Promise.<void>}
 */
core.switchToPanel = function(panelName, addToHistory = true) {
    var panel = core.panels.find(p => p.name == panelName);
    if (panel != null && (core.selectedPanel == null || core.selectedPanel.name != panel.name)) {
        return core.clickPanelButton(panel.button, addToHistory);
    }
    else {
        return Promise.resolve();
    }
}

/**
 * Called when a panel button is clicked
 * @param {Element} button The panel button that was clicked on
 * @returns {Promise.<void>}
 */
core.clickPanelButton = function(button, addToHistory = true) {
    var oldPanel = core.selectedPanel;
    
    //If the button leads the the panel that is currently already open, then return and do nothing
    if (oldPanel != null && oldPanel.buttonID == button.id) {
        return Promise.resolve();
    }

    //Deselect the old button
    if (oldPanel != null) {
        oldPanel.button.classList.remove("selected-menu-item");
    }

    //Find the panel that corresponds to the one the button is referring to
    var newPanel = core.panels.find(p => p.buttonID == button.id);

    //The new panel becomes the selected panel
    core.selectedPanel = newPanel;

    //Select the new button
    newPanel.button.classList.add("selected-menu-item");

    //Trigger the panel button clicked event
    core.callEvent(core.events.onPanelButtonClickedEvent, newPanel);

    //Trigger the on panel leave event if an old panel was originally loaded
    if (oldPanel != null) {
        core.callEvent(core.events.onPanelLeaveEvent, oldPanel);
    }

    //Close up the panel selection menu (only visible on mobile devices)
    var panelMenu = document.getElementById("panel-menu");
    if (panelMenu.classList.contains("panel-hovered")) {
        panelMenu.classList.remove("panel-hovered");
        core.updateBackgrounds();
    }

    //If this is being recorded to the browser history
    if (addToHistory) {
        //If we are going to the home panel, then no URL extensions are needed
        if (newPanel.name == "home") {
            window.history.pushState({}, "Nickc01 Portfolio", core.getURL());
        }
        else {
            //if we are going to any other panel, then extend the URL with the panel name
            window.history.pushState({}, "Nickc01 Portfolio", core.getURL() + "?" + newPanel.name);
        }
    }

    //Return a promise that will finish until the new panel is loaded
    return new Promise((resolve, reject) => {
        //Unload the current panel and fetch the html for the new panel
        Promise.all([core.unloadCurrentPanel(), fetch("panels/" + newPanel.name + ".html")]).then(response => {
            //If the unloading succeeded
            if (response[0]) {
                //Change the panel state to loading a new panel
                core.changePanelState(core.PanelState.Loading);

                //Convert the fetch response to to text 
                return response[1].text().then(panelSrc => {
                    //Create a new div element and add the entire html source to the new element
                    var newElement = document.createElement("div");
                    document.body.appendChild(newElement);
                    newElement.outerHTML = panelSrc;
                    //Change the panel state to idle
                    core.changePanelState(core.PanelState.Idle);
                    //Trigger the on enter panel event
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

/**
 * Unloads the current panel 
 * @returns {Promise.<boolean>} */
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
            //The onNewPanelClicked function will get called if a new panel button is clicked on
            //If that happens, then this means that the current panel load operation will need to be interrupted
            //This is signaled by resolving the promise to false if a panel button is clicked while the unloading process happens
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

/**
 * 
 * @param {number} a
 * @param {number} b
 */
core.randomInRange = function (a, b) {
    return core.lerp(a, b, Math.random());
}

core.setupHamburgerMenu = function () {
    var menu = document.getElementById("hamburger-menu");
    var panelMenu = document.getElementById("panel-menu");
    /*menu.addEventListener("mouseover", src => {
        menu.classList.add("hamburger-hovered");
    });
    menu.addEventListener("mouseout", src => {
        menu.classList.remove("hamburger-hovered");
    });*/
    menu.addEventListener("click", src => {
        if (panelMenu.classList.contains("panel-hovered")) {
            panelMenu.classList.remove("panel-hovered");
        }
        else {
            panelMenu.classList.add("panel-hovered");
        }
        core.updateBackgrounds();
    });

    var checkPanel = e => {
        if (panelMenu.classList.contains("panel-hovered")) {
            var rect = panelMenu.getBoundingClientRect();
            var mouseX = e.pageX;
            var mouseY = e.pageY - window.scrollY;
            if (mouseX < 0 || mouseX > rect.right || mouseY < 0 || mouseY > rect.bottom) {
                panelMenu.classList.remove("panel-hovered");
                core.updateBackgrounds();
            }
        }
    };

    panelMenu.addEventListener("mouseout", checkPanel);
    //panelMenu.addEventListener("mouseleave", checkPanel);
    //panelMenu.addEventListener("touchend", checkPanel);
    //document.addEventListener("mouseover", checkPanel);
    //window.addEventListener("mouseout", checkPanel);
    /*document.onclick = event => {
        console.log("DOCUMENT CLICKED");
        console.log("Event = " + event.target.id);
        if (event.target.id != "hamburger-menu") {
            panelMenu.classList.remove("panel-hovered");
        }
    };*/

    if (core.onMobile) {
        document.addEventListener("mouseover", checkPanel);

        window.addEventListener("touchstart", e => {
            if (e.touches.length > 0) {
                checkPanel({ pageX: e.touches[0].pageX, pageY: e.touches[0].pageY });
            }
        });
    }
}

core.setupPanelMenu = function() {
    var panelMenu = document.getElementById("panel-menu");

    /** @type {any} */
    var root = document.querySelector(':root');

    var updateHeaderBar = () => {
        root.style.setProperty('--header-height', panelMenu.offsetHeight.toString() + "px");
    };

    window.addEventListener('resize', updateHeaderBar);

    updateHeaderBar();
}

core.setupScrollBlackBackgrounds = function() {
    var panelMenu = document.getElementById("panel-menu");
    //var hamburger = document.getElementById("hamburger-menu");


    core.updateBackgrounds = () => {
        if (window.scrollY > core.fontSize * 1.75 || panelMenu.classList.contains("panel-hovered")) {
            if (!panelMenu.classList.contains("black-background")){
                panelMenu.classList.add("black-background");
            }
        }
        else
        {
            if (panelMenu.classList.contains("black-background")){
                panelMenu.classList.remove("black-background");
            }
        }
    };

    document.addEventListener('scroll', core.updateBackgrounds);

    window.addEventListener('resize', core.updateBackgrounds);
}

/** @type {Array.<(supported: boolean) => void>} */
var onAvifSupport = new Array(0);

/**
 * 
 * @param {(supported: boolean) => void} event
 */
core.checkAVIFSupport = function (event) {
    if (core.AVIFSupported === null) {
        onAvifSupport.push(event);
    }
    else {
        event(core.AVIFSupported);
    }
}

function verifyAVIF() {
    new Promise(() => {
        const image = new Image();
        image.onerror = () => {
            core.AVIFSupported = false;
            for (var i = 0; i < onAvifSupport.length; i++) {
                onAvifSupport[i](core.AVIFSupported);
            }
        }
        image.onload = () => {
            core.AVIFSupported = true;
            for (var i = 0; i < onAvifSupport.length; i++) {
                onAvifSupport[i](core.AVIFSupported);
            }
        }
                image.src =
                "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
    }).catch(() => false);
}

verifyAVIF();

//---------------------------------------------------
//------------------Initialization-------------------
//---------------------------------------------------

core.loadPanels();

core.loadDefaultPanel();

//core.setupPanelMenu();
core.setupHamburgerMenu();

core.setupScrollBlackBackgrounds();

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



window.onload = () => {
    core.callEvent(core.events.onWindowLoad);
}

console.log("Core Loaded");