// @ts-check

//This file contains the main logic for the projects panel

var projectPanel = {};

//---------------------------------------------------
//-----------------------Enums-----------------------
//---------------------------------------------------

projectPanel.ProjectsState = {
    Unloaded: 0,
    Loading: 1,
    Loaded: 2
}

projectPanel.ColorInterpolationState = {
    Idle: 0,
    Interpolating: 1,
    Full: 2,
    Reverting: 3
}

//---------------------------------------------------
//---------------------Variables---------------------
//---------------------------------------------------

projectPanel.projectOpen = false;

/** @type {string} */
projectPanel.openedProject = null;

/** @type {string} */
projectPanel.preparedProject = null;

projectPanel.currentProjectsState = projectPanel.ProjectsState.Unloaded;

/** @type {string} */
projectPanel.startupProject = null;

projectPanel.projects = [];

projectPanel.originalTopColor = [107, 157, 62, 255];

projectPanel.originalBottomColor = [20, 40, 10, 255];

projectPanel.interpolationSpeed = 5;

/** @type {Array.<string>} */
projectPanel.hoveredButtons = [];

//---------------------------------------------------
//-----------------------Events----------------------
//---------------------------------------------------

projectPanel.events = {};

/** @type {Array.<(project: any) => void>} */
projectPanel.events.projectColorChangeEvent = new Array(0);





//---------------------------------------------------
//---------------------Functions---------------------
//---------------------------------------------------

/**
 * 
 * @param {string} projectName
 */
projectPanel.openProject = function(projectName) {
    if (projectPanel.projectOpen) {
        return;
    }

    if (projectPanel.currentProjectsState != projectPanel.ProjectsState.Loaded) {
        return;
    }



    if (core.selectedPanel == null || core.selectedPanel.name != "projects" || core.currentPanelState != core.PanelState.Idle) {
        return;
    }

    projectPanel.prepareProject(projectName);

    projectPanel.openedProject = projectName;
    projectPanel.projectOpen = true;

    projectPanel.refreshColors();

    document.documentElement.style.overflowY = "hidden";
    //DisableWindowScrolling();
    /*if (colorSetter === null) {
        clearTimeout(colorSetter);
        colorSetter = null;
    }*/

    var project = projectPanel.projects[projectName];


    document.documentElement.style.setProperty('--project-window-top-color', project.color);
    document.documentElement.style.setProperty('--project-window-bottom-color', project.backgroundColor);

    var selectedProjectArea = document.getElementById("selected-project-area")
    selectedProjectArea.classList.remove("fade-out-proj-window");
    selectedProjectArea.classList.add("fade-in-proj-window");
    //onResize();

    var videoAreaElement = document.getElementById("video-area");
    var vs = videoAreaElement.getElementsByTagName("video");
    if (vs.length > 0) {
        var videoElement = vs[0];
        videoElement.load();
    }
}

/**
 * 
 * @param {string} projectName
 */
projectPanel.prepareProject = function (projectName) {
    //console.log("Project Name = " + projectName);
    //console.log("Prepared Project = " + projectPanel.preparedProject);
    /*if (projectPanel.preparedProject != projectName) {
        projectPanel.preparedProject = projectName;
        if (projectName == null) {
            core.callEvent(projectPanel.events.projectColorChangeEvent, null);
        }
        else {
            core.callEvent(projectPanel.events.projectColorChangeEvent, projectPanel.projects[projectName]);
        }
    }
    else {
        return;
    }*/

    if (projectName == null) {
        projectPanel.preparedProject = null;
        return;
    }
    else if (projectPanel.preparedProject == projectName) {
        return;
    }
    else {
        projectPanel.preparedProject = projectName;
    }

    var root = document.documentElement;

    var project = projectPanel.projects[projectName];

    var closeButton = document.getElementById("close-button-svg");

    for (var i = 0; i < closeButton.childElementCount; i++) {
        var child = closeButton.children[i];
        child.setAttribute("width", 3.75 * core.fontSize);
        child.setAttribute("height", 0.25 * core.fontSize);
    }

    var projectTitle = document.getElementById("selected-project-title");

    projectTitle.textContent = project.name;

    if (project.titleWidth != undefined) {
        projectTitle.parentElement.setAttribute("viewBox", "0 " + (-(core.fontSize - 16)) + " " + (project.titleWidth * core.fontSize / 16) + " " + (25 * core.fontSize / 16));
    }


    if (project.titleColor != undefined) {
        root.style.setProperty('--title-text-color', project.titleColor);
    }
    else {
        root.style.setProperty('--title-text-color', project.textColor);
    }

    root.style.setProperty('--project-background-image', "url(" + project.image + ")");
    root.style.setProperty('--project-text-color', project.textColor);

    var bottomColor = core.cssToColor(project.backgroundColor);
    bottomColor[3] = 255;

    root.style.setProperty('--project-window-bottom-color-solid', core.colorToCSS(bottomColor));


    var descriptionElement = document.getElementById("description");
    var date = "<h3>" + project.date + "</h3>";

    var description = "";

    for (var i = 0; i < project.description.length; i++) {
        description += "</br>" + project.description[i] + ".";
    }

    descriptionElement.innerHTML = date + description;

    if (project.skills != undefined) {
        var skills = "</br><h3>Skills:</h3>";

        for (var i = 0; i < project.skills.length; i++) {
            skills += " - " + project.skills[i] + "</br>";
        }

        descriptionElement.innerHTML += skills;
    }

    if (project.credits != undefined) {
        var credits = "</br><h3>Credits:</h3>";

        for (var i = 0; i < project.credits.length; i++) {
            var credit = project.credits[i];
            credits += " - " + credit.name + ": <a href=\"" + credit.link + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + credit.label + "</a></br>";
        }

        descriptionElement.innerHTML += credits;
    }

    descriptionElement.innerHTML += projectPanel.GenerateLinksElement(project.links);

    var videoAreaElement = document.getElementById("video-area");
    var vs = videoAreaElement.getElementsByTagName("video");
    if (vs.length > 0) {
        var videoElement = vs[0];
        var sources = videoAreaElement.getElementsByTagName("source");
        var sourceElement = null;
        if (sources.length == 0) {
            sourceElement = document.createElement('source');
            videoElement.appendChild(sourceElement);
        }
        else {
            sourceElement = sources[0];
        }
        sourceElement.setAttribute('src', project.video);
    }
}

/**
 * 
 * @param {Array.<{link: string, name: string}>} links
 * @returns {string}
 */
projectPanel.GenerateLinksElement = function(links) {
    if (links === undefined || links == null) {
        return "";
    }
    var outerHTML = "<div id=\"description-links\" class=\"unhighlightable\">";
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        outerHTML += "<a href=\"" + link.link + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + link.name + "</a>";
    }
    outerHTML += "</div>";
    return outerHTML;
}

projectPanel.closeProject = function() {
    if (!projectPanel.projectOpen) {
        return;
    }

    projectPanel.projectOpen = false;
    projectPanel.openedProject = null;

    document.documentElement.style.overflowY = "scroll";

    projectPanel.refreshColors();

    var selectedProjectArea = document.getElementById("selected-project-area")
    selectedProjectArea.classList.remove("fade-in-proj-window");
    selectedProjectArea.classList.add("fade-out-proj-window");

}

projectPanel.openWhenReady = function(projectName) {
    if (projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded) {
        projectPanel.openProject(projectName);
    }
    else {
        projectPanel.startupProject = projectName;
    }
}


projectPanel.loadProjects = function() {
    projectPanel.currentProjectsState == projectPanel.ProjectsState.Loading;
    fetch("projects.json").then(response => {
		return response.json();
    }).then(value => {
        projectPanel.projects = value["projects"];
        projectPanel.currentProjectsState = projectPanel.ProjectsState.Loaded;
        if (projectPanel.startupProject) {
            projectPanel.openProject(projectPanel.startupProject);
        }
	});
}

projectPanel.clearColors = function () {
    projectPanel.hoveredButtons.length = 0;
    projectPanel.refreshColors();
    //projectPanel.prepareProject(null);
}



/*projectPanel.setColors = function() {

}*/


core.addToEvent(core.events.onPanelLeaveEvent, panel => {
    if (panel.name == "projects") {
        projectPanel.closeProject();
        projectPanel.clearColors();
    }
})

core.addToEvent(core.events.onEnterPanelEvent, panel => {
    /*if (panel.name != "projects") {
        //projectPanel.clearColors();
        return;
    }*/

    var projectAreas = document.getElementsByClassName("projects-area");
    for (var i = 0; i < projectAreas.length; i++) {
        //Distribute(projectAreas.item(i));
        var projectsArea = projectAreas.item(i);

        var divs = projectsArea.getElementsByTagName("div");

        for (var i = 0; i < divs.length; i++) {
            registerProjectEvent(divs[i], 'click', source => {
                //OpenProject(source);
                //console.log("Button Pressed = " + source.id);
                projectPanel.openWhenReady(source.id);
            });
            registerProjectEvent(divs[i], 'mouseover', source => {
                //UpdateSelectedProject(source);
                projectPanel.prepareProject(source.id);
                projectPanel.addHoveredButton(source.id);

                //console.log("Hovered = " + source.id);
                //console.log("List = " + projectPanel.hoveredButtons);

                if (core.usingTouchDevice() && window.innerWidth < (59.375 * core.fontSize)) {
                    //OpenProject(source);
                    projectPanel.openWhenReady(source.id);
                }
            });
            registerProjectEvent(divs[i], 'mouseout', source => {
                //console.log("Unhovered = " + source.id);
                //console.log("List = " + projectPanel.hoveredButtons);
                projectPanel.removeHoveredButton(source.id);
            });
        }
    }

    //var projectsArea = document.getElementById("projects-area");

    //var root = window.getComputedStyle(document.documentElement);
    //originalTopColor = root.getPropertyValue("--project-window-top-color");
    //originalBottomColor = root.getPropertyValue("--project-window-bottom-color-solid");
});

core.addToEvent(projectPanel.events.projectColorChangeEvent, project => {
    //console.log("Project");
    //console.log(project);
    if (project == null)
    {
        //TODO TODO TODO - RESET COLORS
        //console.log("REVERTING");
        revertInterpolation();
    }
    else
    {
        //TODO TODO TODO - Change colors to project
        interpolateToColor(project.color,project.backgroundColor);
    }
});

/**
 * 
 * @param {string} id
 */
projectPanel.addHoveredButton = function (id) {
    if (projectPanel.hoveredButtons.length > 0 && projectPanel.hoveredButtons[0] != id) {
        projectPanel.hoveredButtons.length = 0;
    }
    projectPanel.hoveredButtons.push(id);
    projectPanel.refreshColors();
}

/**
 * 
 * @param {string} id
 */
projectPanel.removeHoveredButton = function (id) {
    var index = projectPanel.hoveredButtons.findIndex(v => v == id);
    if (index > -1) {
        projectPanel.hoveredButtons.splice(index, 1);
        projectPanel.refreshColors();
    }
}


projectPanel.refreshColors = function () {
    //console.log("CORE = " + core.j);
    if (core.selectedPanel == null || core.selectedPanel.name != "projects") {
        core.callEvent(projectPanel.events.projectColorChangeEvent, null);
        return;
    }
    if (projectPanel.projectOpen) {
        core.callEvent(projectPanel.events.projectColorChangeEvent, projectPanel.projects[projectPanel.openedProject]);
    }
    else if (projectPanel.hoveredButtons.length > 0) {
        core.callEvent(projectPanel.events.projectColorChangeEvent, projectPanel.projects[projectPanel.hoveredButtons[0]]);
    }
    else {
        core.callEvent(projectPanel.events.projectColorChangeEvent, null);
    }
}

projectPanel.closeButtonHover = function () {
    if (window.innerWidth < (59.375 * core.fontSize) && core.usingTouchDevice()) {
        projectPanel.closeProject();
    }
}


/**
 * 
 * @param {HTMLDivElement} element
 * @param {string} evtName
 * @param {(source: Element) => void} func
 */
function registerProjectEvent(element, evtName, func) {
    element.addEventListener(evtName, source => {
        //console.log("ACTION = " + evtName + ", sourc = " + source.id);
        /** @type {Node} */
        var currentElement = source.target;
        while (currentElement != null && currentElement.parentNode != null && !currentElement.parentNode.classList.contains("projects-area")) {
            currentElement = currentElement.parentNode;
        }
        func(currentElement);
    });
}

var colorInterpolationValue = 0.0;
var colorInterpolationState = projectPanel.ColorInterpolationState.Idle;

var startTopColor = projectPanel.originalTopColor.slice();
var startBottomColor = projectPanel.originalBottomColor.slice();

var endTopColor = projectPanel.originalTopColor.slice();
var endBottomColor = projectPanel.originalBottomColor.slice();

/*function printInterpState() {
    if (colorInterpolationState == projectPanel.ColorInterpolationState.Full) {
        console.log("Interp State = Full");
    }
    else if (colorInterpolationState == projectPanel.ColorInterpolationState.Idle) {
        console.log("Interp State = Idle");
    }
    else if (colorInterpolationState == projectPanel.ColorInterpolationState.Interpolating) {
        console.log("Interp State = Interpolating");
    }
    else if (colorInterpolationState == projectPanel.ColorInterpolationState.Reverting) {
        console.log("Interp State = Reverting");
    }
}*/


function interpolateToColor(topColor, bottomColor) {
    //console.log("Interpolating");
    //console.log("Trace = " + console.trace());
    //printInterpState();
    /*if (colorInterpolationState == projectPanel.ColorInterpolationState.Reverting) {
        
    }*/
    core.removeFromEvent(core.events.updateEvent, projectPanel.revert_color_update);
    core.removeFromEvent(core.events.updateEvent, projectPanel.interpolation_color_update);

    /*if (startTopColor == null) {
        startTopColor = projectPanel.originalTopColor.slice();
        startBottomColor = projectPanel.originalBottomColor.slice();
    }
    else {
        
    }*/

    startTopColor = core.lerpArray(startTopColor, endTopColor, colorInterpolationValue);
    startBottomColor = core.lerpArray(startBottomColor, endBottomColor, colorInterpolationValue);

    colorInterpolationValue = 0.0;

    endTopColor = core.cssToColor(topColor);
    endBottomColor = core.cssToColor(bottomColor);

    colorInterpolationState = projectPanel.ColorInterpolationState.Interpolating;

    //console.log("Start Top Color = " + startTopColor);
    //console.log("Start Bottom Color = " + startBottomColor);

    //console.log("End Top Color = " + endTopColor);
    //console.log("End Bottom Color = " + endBottomColor);

    core.addToEvent(core.events.updateEvent, projectPanel.interpolation_color_update);
}

function revertInterpolation() {
    //console.log("Reverting");
    /*if (colorInterpolationState == projectPanel.ColorInterpolationState.Interpolating) {
        
    }*/
    core.removeFromEvent(core.events.updateEvent, projectPanel.interpolation_color_update);
    core.removeFromEvent(core.events.updateEvent, projectPanel.revert_color_update);

    endTopColor = core.lerpArray(startTopColor, endTopColor, colorInterpolationValue);
    endBottomColor = core.lerpArray(startBottomColor, endBottomColor, colorInterpolationValue);

    startTopColor = projectPanel.originalTopColor.slice();
    startBottomColor = projectPanel.originalBottomColor.slice();

    //console.log("Reverting To = " + startTopColor);
    //console.log("Reverting To Bottom = " + startBottomColor);

    colorInterpolationValue = 1.0;

    colorInterpolationState == projectPanel.ColorInterpolationState.Reverting;

    core.addToEvent(core.events.updateEvent, projectPanel.revert_color_update);


    /*if (startTopColor != null) {
        startTopColor = projectPanel.originalTopColor.slice();
        startBottomColor = projectPanel.originalBottomColor.slice();
    }
    else {
        startTopColor = lerpArray(startTopColor, endTopColor, colorInterpolationValue);
        startBottomColor = lerpArray(startBottomColor, endBottomColor, colorInterpolationValue);
    }*/
    //console.log("Interpolation State = " + colorInterpolationState);

    /*if (colorInterpolationState == projectPanel.ColorInterpolationState.Full ||
        colorInterpolationState == projectPanel.ColorInterpolationState.Interpolating) {
        
    }*/
}

projectPanel.interpolation_color_update = function(dt) {
    colorInterpolationValue += dt * projectPanel.interpolationSpeed;
    //console.log("PROJECT PANEL INTERP = " + colorInterpolationValue);
    if (colorInterpolationValue >= 1) {
        colorInterpolationValue = 1;
        colorInterpolationState = projectPanel.ColorInterpolationState.Full;
        core.removeFromEvent(core.events.updateEvent, projectPanel.interpolation_color_update);
    }

    projectPanel.calculate_colors();
}

var rootStyle = document.documentElement;

projectPanel.calculate_colors = function() {
    //console.log("FROM = " + core.colorToCSS(lerpArray(startTopColor, endTopColor, colorInterpolationValue)));
    //console.log("TO = " + core.colorToCSS(lerpArray(startBottomColor, endBottomColor, colorInterpolationValue)));
    rootStyle.style.setProperty("--project-window-top-color", core.colorToCSS(core.lerpArray(startTopColor, endTopColor, colorInterpolationValue)));
    rootStyle.style.setProperty("--project-window-bottom-color-solid", core.colorToCSS(core.lerpArray(startBottomColor, endBottomColor, colorInterpolationValue)));
}

projectPanel.revert_color_update = function(dt) {
    colorInterpolationValue -= dt * projectPanel.interpolationSpeed;
    if (colorInterpolationValue <= 0) {
        colorInterpolationValue = 0;
        //console.log("Interp = " + colorInterpolationValue);
        colorInterpolationState = projectPanel.ColorInterpolationState.Idle;
        core.removeFromEvent(core.events.updateEvent, projectPanel.revert_color_update);
    }

    projectPanel.calculate_colors();
}





//---------------------------------------------------
//------------------Initialization-------------------
//---------------------------------------------------

projectPanel.loadProjects();

console.log("Project Panel Loaded");