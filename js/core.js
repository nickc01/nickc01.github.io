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

//This will be defined by the projects-panel.js script
var projectPanel = undefined;

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

/** 
 * Called when AVIF support is tested
 * @type {Array.<(supported: boolean) => void>} */
var onAvifSupport = new Array(0);





//---------------------------------------------------
//---------------------Functions---------------------
//---------------------------------------------------

/**
 * Waits until conditionFunc returns true. When it does, it will call afterFunc
 * @param {() => boolean} conditionFunc The condition function to test
 * @param {() => void} afterFunc The function to call when conditionFunc returns true
 */
core.waitUntil = function(conditionFunc, afterFunc) {
    var interval = 0;
    interval = setInterval(() => {
        if (conditionFunc()) {
            clearInterval(interval);
            afterFunc();
        }
    }, 25);
}

/**
 * Loads the default panel upon loading the page, which may depend on what is in the URL
 */
core.loadDefaultPanel = function() {
    //If the url has "?project" in it. Then attempt to load up a project in the project panel
    if (core.urlParams.has("project") && core.urlParams.get("project")) {
        var project = core.urlParams.get("project");
        //Switch to the "Projects" panel
        core.switchToPanel("projects", false).then(() => {
            //Wait until the projects-panel.js script has loaded and the projects panel has loaded
            core.waitUntil(() => projectPanel && projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded, () => {
                //Open up the project and display it in a window
                projectPanel.openProject(project);
            });
        });
    } else {
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
            core.waitUntil(() => projectPanel && projectPanel.projects, () => {
                var loadedProject = false;
                //Loop over all the projects in the projects panel
                for (var p in projectPanel.projects) {
                    if (projectPanel.projects.hasOwnProperty(p)) {
                        //If "?PROJECT_NAME" is stored in the URL
                        if (core.urlParams.has(p)) {
                            //Switch to the projects panel
                            core.switchToPanel("projects", false).then(() => {
                                //Wait until the projects panel has loaded
                                core.waitUntil(() => projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded, () => {
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
    } else {
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
        } else {
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
            } else {
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
    //If the panel currently isn't doing anything, then begin the fade out process
    if (core.currentPanelState == core.PanelState.Idle) {
        core.changePanelState(core.PanelState.Unloading);
        return new Promise((resolve, reject) => {
            var valid = true;
            var onNewPanelClicked = null;
            onNewPanelClicked = function(panel) {
                valid = false;
                core.removeFromEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
                return true;
            }
            //The onNewPanelClicked function will get called if a new panel button is clicked on
            //If that happens, then this means that the current panel load operation will need to be interrupted
            //This is signaled by resolving the promise to false if a panel button is clicked while the unloading process happens
            core.addToEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);

            //Get the primary sections of the document
            var sections = document.getElementsByClassName("primary-section");
            var oldSection = null;
            if (sections.length > 0) {
                oldSection = sections[0];
            }

            //Fade out the main section of the document
            if (oldSection) {
                oldSection.classList.remove("doFadeIn");
                if (!oldSection.classList.contains("doFadeOut")) {
                    oldSection.classList.add("doFadeOut");
                }
            }

            //Run this code after the fade out is complete
            setTimeout(() => {
                //Remove the old section
                if (oldSection) {
                    oldSection.parentElement.removeChild(oldSection);
                }
                //Notify the Promise that the old section has fully faded out
                if (valid) {
                    core.removeFromEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
                    core.changePanelState(core.PanelState.Empty);
                    resolve(true);
                } else {
                    core.changePanelState(core.PanelState.Empty);
                    resolve(false);
                }
            }, core.fadeOutSpeed);
        });
        //If the page is currently going through the unloading process, then wait until the panel gets removed
    } else if (core.currentPanelState == core.PanelState.Unloading) {
        return new Promise((resolve, reject) => {
            var onStateChange = null;
            var onNewPanelClicked = null;
            var cleanup = null;

            //Called when the panel state changes
            onStateChange = function(newState) {
                //If the state is Empty, then the unloading process has finished
                if (newState == core.PanelState.Empty) {
                    cleanup();
                    //Return true for success
                    resolve(true);
                } else {
                    //Return false for cancellation
                    resolve(false);
                }
            };

            //Called when a new panel button is clicked on, then the current unload process should be cancelled
            onNewPanelClicked = function(panel) {
                cleanup();
                //Return false for cancellation
                resolve(false);
            };

            //Used for removing the hooked events upon completion
            cleanup = function() {
                core.removeFromEvent(core.events.panelStateChangeEvent, onStateChange);
                core.removeFromEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
            };


            //Hook the events
            core.addToEvent(core.events.panelStateChangeEvent, onStateChange);
            core.addToEvent(core.events.onPanelButtonClickedEvent, onNewPanelClicked);
        });
        //If the current panel is being loaded in, then immediately cancel unloading the panel
    } else if (core.currentPanelState == core.PanelState.Loading) {
        return Promise.resolve(false);
        //If the current panel is already unloaded, then immediately return true for success
    } else {
        return Promise.resolve(true);
    }
}

/**
 * Adds an function to an event so the function gets called whenever the event is triggered
 * @param {Array<(...any) => any>} array The event array to add to
 * @param {(...any) => any} func The function to add
 */
core.addToEvent = function(array, func) {
    array.splice(0, 0, func);
}

/**
 * Removes a function from an event so it no longer gets called when the event is triggered
 * @param {Array<(...any) => any>} array The event array to remove from
 * @param {(...any) => any} func The function to remove
 * @returns {boolean} Returns true if the event was removed
 */
core.removeFromEvent = function(array, func) {
    var index = array.findIndex(f => f == func);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Checks if a function is added to an event array
 * @param {Array<(...any) => any>} array The event array to check
 * @param {(...any) => any} func The function to check
 * @returns {boolean} Returns true if the function is inside of the event array
 */
core.containsEvent = function(array, func) {
    return array.findIndex(f => f == func) > -1;
}

/**
 * Triggers an event
 * @param {Array<(...any) => any>} eventArray The event array to trigger
 * @param {...any} parameters Any parameters to pass to each of the functions in the array
 */
core.callEvent = function(eventArray, ...parameters) {
    for (var i = eventArray.length - 1; i >= 0; i--) {
        eventArray[i].call(this, ...parameters);
    }
}

/**
 * Changes the current state of the panel
 * @param {number} newState The new state of the panel
 * @see core.PanelState
 */
core.changePanelState = function(newState) {
    if (core.currentPanelState !== newState) {
        core.currentPanelState = newState;
        core.callEvent(core.events.panelStateChangeEvent, newState);
    }
}

/**
 * Obtains the URL, excluding anything after the "?" query string
 * @returns {string} */
core.getURL = function() {
    var url = window.location.href;
    if (url.search("/?") !== -1) {
        return url.split("?")[0];
    } else {
        return url;
    }
}

/**
 * Tests whether or not the browser is a touch device
 * @returns {boolean} Returns true if the browser is a touch device
 */
core.usingTouchDevice = function() {
    return ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
}

/**
 * Converts a css string into an array of RGBA colors ranging from 0 - 255
 * @param {string} value The css string to convert
 * @returns {Array.<number>} Returns the css string converted to RGBA
 */
core.cssToColor = function(value) {
    //If the string is a hex string, then run hexToRgb()
    if (value.startsWith("#")) {
        return core.hexToRgb(value);
    }
    //If the string is an rgba string, then slice the string to obtain only the numeric portion
    if (value.startsWith("rgba")) {
        value = value.slice(5, -1);
        //If the string is an rgb string, then do the same thing
    } else {
        value = value.slice(4, -1);
    }

    //Split the string by commas
    var result = value.split(", ");

    var colorResult = [0, 0, 0, 1.0];

    //Loop through each of the split strings and convert them into numbers
    for (var i = 0; i < result.length; i++) {
        colorResult[i] = Number(result[i]);
    }

    //Multiply the alpha by 255 to so it's also in the range of 0 - 255 like the rest of the numbers
    colorResult[3] *= 255;

    return colorResult;
}

/**
 * Converts an RGBA color array into a css string
 * @param {Array.<number>} colors The colors to convert
 * @returns {string} Returns the converted css string
 */
core.colorToCSS = function(colors) {
    if (colors.length > 3) {
        return "rgba(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ", " + (colors[3] / 255.0) + ")";
    } else {
        return "rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")";
    }
}

/**
 * Converts a color component into a hex representation
 * @param {number} c The color component to convert
 * @return {string} THe output hex representation
 */
function componentToHex(c) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
 * Converts an RGBA color array into a css hex string
 * @param {Array.<number>} color The color array to convert
 * @returns {string} The output css hex string
 */
core.rgbToHex = function(color) {
    var result = "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
    if (color.length >= 4) {
        result += componentToHex(color[3]);
    }
    return result;
}

/**
 * Converts a hex string to an RGBA array
 * @param {string} hex The hex string to convert
 * @returns {Array.<number>} The output RGBA array
 */
core.hexToRgb = function(hex) {
    hex = hex.replace(" ", "");
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)];
    } else {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255];
        }
        return null;
    }
}

/**
 * Linearly interpolates between {a} and {b} by {t}.
 * @param {number} a The first number to interpolate from
 * @param {number} b The second number to interpolate to
 * @param {number} t The interpolation amount
 * @returns {number} The interpolated number
 */
core.lerp = function(a, b, t) {
    return a + ((b - a) * t);
}

/**
 * Linearly interpolates between array {a} and array {b} by {t}
 * @param {Array.<number>} a The first arrray to interpolate from
 * @param {Array.<number>} b The second array to interpolate to
 * @param {number} t The interpolation amount
 * @returns {Array.<number>} The interpolated array
 */
core.lerpArray = function(a, b, t) {
    return [core.lerp(a[0], b[0], t), core.lerp(a[1], b[1], t), core.lerp(a[2], b[2], t), core.lerp(a[3], b[3], t)];
}

/**
 * Removes autoplay from the "#video-area" element
 */
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
 * Pick a random number between two numbers
 * @param {number} a The lower bound number
 * @param {number} b The upper bound number
 * @returns Returns a random value between a and b
 */
core.randomInRange = function(a, b) {
    return core.lerp(a, b, Math.random());
}

/**
 * Sets up the hamburger menu, which is only visible on mobile devices
 */
core.setupHamburgerMenu = function() {
    var menu = document.getElementById("hamburger-menu");
    var panelMenu = document.getElementById("panel-menu");
    menu.addEventListener("click", src => {
        if (panelMenu.classList.contains("panel-hovered")) {
            panelMenu.classList.remove("panel-hovered");
        } else {
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

    if (core.onMobile) {
        document.addEventListener("mouseover", checkPanel);

        window.addEventListener("touchstart", e => {
            if (e.touches.length > 0) {
                checkPanel({
                    pageX: e.touches[0].pageX,
                    pageY: e.touches[0].pageY
                });
            }
        });
    }
}

/**
 * Sets up the panel menu so that when you scroll down the page, a black background fades in on the panel area
 */
core.setupScrollBlackBackgrounds = function() {
    var panelMenu = document.getElementById("panel-menu");

    core.updateBackgrounds = () => {
        if (window.scrollY > core.fontSize * 1.75 || panelMenu.classList.contains("panel-hovered")) {
            if (!panelMenu.classList.contains("black-background")) {
                panelMenu.classList.add("black-background");
            }
        } else {
            if (panelMenu.classList.contains("black-background")) {
                panelMenu.classList.remove("black-background");
            }
        }
    };

    document.addEventListener('scroll', core.updateBackgrounds);

    window.addEventListener('resize', core.updateBackgrounds);
}

/**
 * Checks if the AVIF image format is supported in this browser
 * @param {(supported: boolean) => void} event The event to call when the AVIF test is applied
 */
core.checkAVIFSupport = function(event) {
    if (core.AVIFSupported === null) {
        onAvifSupport.push(event);
    } else {
        event(core.AVIFSupported);
    }
}

/**
 * Verifies if AVIF is supported in the browser
 */
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

//---------------------------------------------------
//------------------Initialization-------------------
//---------------------------------------------------

//Verify AVIF support
verifyAVIF();

//Load all the possible panels
core.loadPanels();

//Load the starting panel
core.loadDefaultPanel();

//Setup the mobile hamburger menu
core.setupHamburgerMenu();

//Setup the fading black background for the panel menu
core.setupScrollBlackBackgrounds();

//If we are on mobile, then disable video autoplay
if (core.onMobile) {
    RemoveAutoPlay();
}



//---------------------------------------------------
//--------------------Update Loop--------------------
//---------------------------------------------------

window.requestAnimationFrame(Update_Loop);

var prevTime = 0;

/**
 * The main update loop for the website
 * @param {number} time The current time
 */
function Update_Loop(time) {
    core.callEvent(core.events.updateEvent, (time - prevTime) / 1000.0);
    prevTime = time;

    window.requestAnimationFrame(Update_Loop);
}


//Trigger the onWindowLoad event
window.onload = () => {
    core.callEvent(core.events.onWindowLoad);
}

console.log("Core Loaded");