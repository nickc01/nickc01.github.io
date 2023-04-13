

var windowDisplay = {};

windowDisplay.visible = false;
windowDisplay.videoVisible = true;
windowDisplay.vertical = false;

//The default width and height of the window in percentage
windowDisplay.defaultWidth = 80;
windowDisplay.defaultHeight = 65;

//The current width and height of the window in percentage
windowDisplay.width = 80;
windowDisplay.height = 65;

windowDisplay.events = {};

/** 
 * Called when the window is opened
 * @type {Array.<() => void>} */
windowDisplay.events.onWindowOpen = new Array(0);

/** 
 * Called when the window is closed
 * @type {Array.<() => void>} */
windowDisplay.events.onWindowClose = new Array(0);


windowDisplay.show = function() {
    if (windowDisplay.visible) {
        return;
    }
    windowDisplay.visible = true;

    //Disable scrolling in the main document so the user can scroll within the project window
    document.documentElement.style.overflowY = "hidden";

    document.getElementById("contents").scrollTo(0, 0);
    document.getElementById("description").scrollTo(0, 0);


    //Fade in the project window
    var selectedProjectArea = document.getElementById("selected-project-area")
    selectedProjectArea.classList.remove("fade-out-proj-window");
    selectedProjectArea.classList.add("fade-in-proj-window");

    //Load the project video
    var videoAreaElement = document.getElementById("video-area");
    if (!videoAreaElement.classList.contains(".hide-element"))
    {
        var vs = videoAreaElement.getElementsByTagName("video");
        if (vs.length > 0) {
            var videoElement = vs[0];
            videoElement.load();
        }
    }

    var closeButton = document.getElementById("close-button-svg");

    for (var i = 0; i < closeButton.childElementCount; i++) {
        var child = closeButton.children[i];
        child.setAttribute("width", 3.5 * core.fontSize);
        child.setAttribute("height", 0.5 * core.fontSize);
    }

    core.callEvent(windowDisplay.events.onWindowOpen);
}

windowDisplay.setVertical = function(vertical) {
    if (vertical != windowDisplay.vertical) {
        windowDisplay.vertical = vertical;
        if (vertical) {
            document.getElementById("contents").classList.add("vertical-contents");
        }
        else {
            document.getElementById("contents").classList.remove("vertical-contents");
        }
    }
}

windowDisplay.close = function() {
    if (!windowDisplay.visible) {
        return;
    }
    windowDisplay.visible = false;

    //Allow scrolling again in the main document
    document.documentElement.style.overflowY = "auto";

    //Fade the project window out
    var selectedProjectArea = document.getElementById("selected-project-area")
    selectedProjectArea.classList.remove("fade-in-proj-window");
    selectedProjectArea.classList.add("fade-out-proj-window");

    core.callEvent(windowDisplay.events.onWindowClose);
}

/** This closes the window upon hover (ONLY ON MOBILE DEVICES) */
windowDisplay.closeHovered = function() {
    if (window.innerWidth < (59.375 * core.fontSize) && core.usingTouchDevice()) {
        windowDisplay.close();
    }
}

windowDisplay.clear = function() {
    windowDisplay.setVideo(null);
    windowDisplay.clearTags();
    windowDisplay.clearLeftContent();
    windowDisplay.clearRightContent();
    windowDisplay.setBackgroundImage(null);
    windowDisplay.setTitleColor("BLANK TITLE");
}

windowDisplay.setVideo = function(videoSource) {
    var videoAreaElement = document.getElementById("video-area");
    var vs = videoAreaElement.getElementsByTagName("video");
    if (vs.length > 0) {
        var videoElement = vs[0];

        if (!videoSource)
        {
            videoElement.classList.add("hide-element");
            return;
        }
        else
        {
            videoElement.classList.remove("hide-element");
        }

        var sources = videoElement.getElementsByTagName("source");
        var sourceElement = null;
        if (sources.length == 0) {
            sourceElement = document.createElement('source');
            videoElement.appendChild(sourceElement);
        } else {
            sourceElement = sources[0];
        }
        sourceElement.setAttribute('src', videoSource);
    }
}

windowDisplay.clearTags = function() {
    document.getElementById("selected-project-tags").innerHTML ="";
}

/**
 * 
 * @param {string} label 
 */
windowDisplay.addTag = function(label) {
    var labelHTML = "<h1>" + label + "</h1>";
    document.getElementById("selected-project-tags").innerHTML += labelHTML;
}

/**
 * 
 * @param {Array<string>} labels 
 */
windowDisplay.addTags = function(labels) {
    for (const label of labels) {
        windowDisplay.addTag(label);
    }
}

windowDisplay.setLeftContent = function(innerHTML) {
    var extraContentElement = document.getElementById("extra-content");
    if (innerHTML)
    {
        extraContentElement.classList.remove("hide-element");
        extraContentElement.innerHTML = innerHTML;
    }
    else
    {
        windowDisplay.clearLeftContent();
    }
}

windowDisplay.clearLeftContent = function() {
    var extraContentElement = document.getElementById("extra-content");
    extraContentElement.innerHTML = "";
    extraContentElement.classList.add("hide-element");
}

windowDisplay.setRightContent = function(innerHTML) {
    var descriptionElement = document.getElementById("description");
    if (innerHTML)
    {
        descriptionElement.classList.remove("hide-element");
        descriptionElement.innerHTML = innerHTML;
    }
    else
    {
        windowDisplay.clearRightContent();
    }
}

windowDisplay.clearRightContent = function() {
    var descriptionElement = document.getElementById("description");
    descriptionElement.innerHTML = "";
    descriptionElement.classList.add("hide-element");
}

windowDisplay.setTextColor = function(cssColor) {
    root.style.setProperty('--project-text-color', cssColor);
}

windowDisplay.setTitleColor = function(cssColor) {
    root.style.setProperty('--title-text-color', cssColor);
}

windowDisplay.setForegroundColor = function(cssColor) {
    document.documentElement.style.setProperty('--window-foreground-color', cssColor);
}

windowDisplay.setBackgroundColor = function(cssColor) {
    document.documentElement.style.setProperty('--window-background-color', cssColor);

    var bottomColor = core.cssToColor(cssColor);

    document.documentElement.style.setProperty('--window-background-color-noalpha', "rgb(" + bottomColor[0] + ", " + bottomColor[1] + ", " + bottomColor[2] + ")");
}

/**
 * Sets the width percentage of the window 
 * @param {number} width
 */
windowDisplay.setWindowWidth = function (width) {
    if (windowDisplay.width != width) {
        windowDisplay.width = width;
        document.documentElement.style.setProperty('--window-width', width + '%');
    }
}

/**
 * Sets the height percentage of the window 
 * @param {number} height
 */
windowDisplay.setWindowHeight = function(height) {
    if (windowDisplay.height != height) {
        windowDisplay.height = height;
        document.documentElement.style.setProperty('--window-height', height + '%');
    }
}

windowDisplay.resetWindowWidth = function () {
    windowDisplay.setWindowWidth(windowDisplay.defaultWidth);
}

windowDisplay.resetWindowHeight = function () {
    windowDisplay.setWindowHeight(windowDisplay.defaultHeight);
}

windowDisplay.setBackgroundImage = function(imgSource) {
    root.style.setProperty('--project-background-image', imgSource ? imgSource : "url(images/perlin-background.png)");
}

/**
 * 
 * @param {string} title 
 * @param {number} titleWidth 
 */
windowDisplay.setWindowTitle = function(title, titleWidth = null) {
    if (!titleWidth) {
        titleWidth = 8.5 * title.length;
    }
    var titleElement = document.getElementById("selected-project-title");
    titleElement.textContent = title;

    //Update the title dimensions
    if (titleWidth) {
        titleElement.parentElement.setAttribute("viewBox", "0 " + (-(core.fontSize - 16)) + " " + (titleWidth * core.fontSize / 16) + " " + (25 * core.fontSize / 16));
    }
}

core.addToEvent(core.events.onPanelLeaveEvent, panel => {
    if (windowDisplay.visible) {
        windowDisplay.close();
    }
})

