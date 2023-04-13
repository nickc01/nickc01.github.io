// @ts-check

//This file contains the main logic for the projects panel

var projectPanel = {};

//---------------------------------------------------
//-----------------------Enums-----------------------
//---------------------------------------------------

/** A list of valid states the projectPanel.projects array can be in */
projectPanel.ProjectsState = {
    Unloaded: 0,
    Loading: 1,
    Loaded: 2
}

/** The different states used for interpolating colors */
projectPanel.ColorInterpolationState = {
    Idle: 0,
    Interpolating: 1,
    Full: 2,
    Reverting: 3
}

//---------------------------------------------------
//---------------------Variables---------------------
//---------------------------------------------------

/** Is a project currently being viewed in a window? */
projectPanel.projectOpen = false;

/** @type {string | null} The project that is currently being viewed in a window */
projectPanel.openedProject = null;

/** @type {string | null} The project that is currently being hovered over and/or viewed in a window */
projectPanel.preparedProject = null;

/** The current state of the project window */
projectPanel.currentProjectsState = projectPanel.ProjectsState.Unloaded;

/** @type {string | null} The project to open upon loading the page. Used if the URL contains a project name */
projectPanel.startupProject = null;

/** Contains all possible projects that can be loaded into a window*/
projectPanel.projects = null;

//The top color of the UI
projectPanel.originalTopColor = [107, 157, 62, 255];

//The bottom color of the UI
projectPanel.originalBottomColor = [20, 40, 10, 255];

//How fast to interpolate between two colors
projectPanel.interpolationSpeed = 5;

/** @type {Array.<string>} A list of all the buttons currently being hovered over */
projectPanel.hoveredButtons = [];

//---------------------------------------------------
//-----------------------Events----------------------
//---------------------------------------------------

projectPanel.events = {};

/** @type {Array.<(project: any) => void>} Called whenever the UI changes color, which is called when a button is hovered over */
projectPanel.events.projectColorChangeEvent = new Array(0);





//---------------------------------------------------
//---------------------Functions---------------------
//---------------------------------------------------

/**
 * Opens a project and display's it in a window
 * @param {string} projectName The name of the project to open
 */
projectPanel.openProject = function(projectName) {
    //Return if the projects panel isn't open
    if (projectPanel.projectOpen || typeof windowDisplay === 'undefined') {
        return;
    }

    //Return if no projects have been loaded yet
    if (projectPanel.currentProjectsState != projectPanel.ProjectsState.Loaded) {
        return;
    }

    //Return if there is no panel loaded or if we aren't on the projects panel or the panel isn't loaded yet
    if (core.selectedPanel == null || core.selectedPanel.name != "projects" || core.currentPanelState != core.PanelState.Idle) {
        return;
    }

    //Prepare the project. Used for changing the UI colors
    projectPanel.prepareProject(projectName);

    projectPanel.openedProject = projectName;
    projectPanel.projectOpen = true;

    //Notify that the colors have changed
    projectPanel.triggerColorChangeEvent();

    windowDisplay.show();
}

/**
 * Prepares the project for being displayed in a window. Also used for updating the UI colors
 * @param {string} projectName The name of the project to prepare
 */
projectPanel.prepareProject = function(projectName) {
    if (typeof windowDisplay === 'undefined')
    {
        return;
    }

    if (projectName == null) {
        projectPanel.preparedProject = null;
        return;
    } else if (projectPanel.preparedProject == projectName) {
        return;
    } else {
        projectPanel.preparedProject = projectName;
    }

    var project = projectPanel.projects[projectName];

    //Update the project window title
    windowDisplay.setWindowTitle(project.name,project.titleWidth);

    //Set the title color
    windowDisplay.setTitleColor(project.titleColor ? project.titleColor : project.textColor);

    //Update the background image and text color
    windowDisplay.setBackgroundImage("url(" + (core.AVIFSupported ? project.imageAVIF : project.image) + ")");
    windowDisplay.setTextColor(project.textColor);

    //Update the top and bottom colors
    windowDisplay.setForegroundColor(project.color);
    windowDisplay.setBackgroundColor(project.backgroundColor);

    windowDisplay.setVertical(false);

    var date = "<h3>" + project.date + "</h3>";

    var rightContent = "";

    for (var i = 0; i < project.description.length; i++) {
        rightContent += "</br>" + project.description[i] + ".</br>";
    }

    //Set the date and description
    rightContent = date + rightContent;

    //Setup the skills section
    if (project.skills != undefined) {
        var skills = "</br><h3>Skills:</h3>";

        for (var i = 0; i < project.skills.length; i++) {
            skills += " - " + project.skills[i] + "</br>";
        }

        rightContent += skills;
    }

    //Setup the credits section
    if (project.credits != undefined) {
        var credits = "</br><h3>Credits:</h3>";

        for (var i = 0; i < project.credits.length; i++) {
            var credit = project.credits[i];
            if (credit.link) {
                credits += " - " + credit.name + ": <a href=\"" + credit.link + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + credit.label + "</a></br>";
            }
            else {
                credits += " - " + credit.name + ": " + credit.label + "</br>";
            }
            
        }

        rightContent += credits;
    }

    //Setup the project button links
    rightContent += projectPanel.GenerateLinksElement(project.links);

    windowDisplay.resetWindowWidth();
    windowDisplay.resetWindowHeight();
    windowDisplay.setRightContent(rightContent);
    windowDisplay.clearLeftContent();
    windowDisplay.setVideo(project.video);
    windowDisplay.clearTags();
    windowDisplay.addTags(project.tags);
}

/**
 * Generates button elements for each URL link
 * @param {Array.<{link: string, name: string}>} links The links to display as buttons
 * @returns {string} The outerHTML needed to display the links as buttons
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

/** Called when the project window closes */
projectPanel.onCloseProject = function() {
    if (typeof windowDisplay === 'undefined' || core.selectedPanel == null || core.selectedPanel.name != "projects" || !projectPanel.projectOpen) {
        return;
    }
    projectPanel.projectOpen = false;
    projectPanel.openedProject = null;

    projectPanel.triggerColorChangeEvent();

}

projectPanel.onWindowClose = function() {
    projectPanel.onCloseProject();
    projectPanel.projectOpen = false;
    projectPanel.openedProject = null;
}

/** Opens a project whenever ready */
projectPanel.openWhenReady = function(projectName) {
    //If the projects array has been loaded
    if (typeof windowDisplay !== 'undefined' && projectPanel.currentProjectsState == projectPanel.ProjectsState.Loaded) {
        projectPanel.openProject(projectName);
        //If the project panel isn't loaded yet, then set it as the startup project so it can be loaded later
    } else {
        projectPanel.startupProject = projectName;
    }
}

/** Loads all the possible projects that can be displayed */
projectPanel.loadProjects = function() {
    //Set the current state to loading
    projectPanel.currentProjectsState == projectPanel.ProjectsState.Loading;
    //Fetch all the projects
    fetch("projects.json").then(response => {
        return response.json();
    }).then(value => {
        //If successful, then set the projects array to the loaded projects
        projectPanel.projects = value["projects"];
        projectPanel.currentProjectsState = projectPanel.ProjectsState.Loaded;
        //If a startup project has been set

        //Wait until the windowDisplay script has loaded
        core.waitUntil(() => typeof windowDisplay !== 'undefined', () => {
            if (projectPanel.startupProject) {
                //Display it in a window
                projectPanel.openProject(projectPanel.startupProject);
            }
            core.addToEvent(windowDisplay.events.onWindowClose, projectPanel.onWindowClose);
        });
    });
}

/** Clears all colors */
projectPanel.clearColors = function() {
    projectPanel.hoveredButtons.length = 0;
    projectPanel.triggerColorChangeEvent();
}

//Called when a panel is unloading
core.addToEvent(core.events.onPanelLeaveEvent, panel => {
    //If the projects panel is unloading, then close the project window if it's displayed
    if (panel.name == "projects") {
        projectPanel.onWindowClose();
        projectPanel.clearColors();
    }
})

//Called when a panel is loaded
core.addToEvent(core.events.onEnterPanelEvent, panel => {
    if (panel.name != "projects") {
        return;
    }

    var projectAreas = document.getElementsByClassName("content-area");

    //Loop over all the project containers in the UI
    for (var i = 0; i < projectAreas.length; i++) {
        var projectsArea = projectAreas.item(i);

        //Get all divs within a project container
        var divs = projectsArea.getElementsByTagName("div");

        //Loop over all the divs within a project container and hook into their click, mouseover, and mouseout events
        for (var i = 0; i < divs.length; i++) {
            registerProjectEvent(divs[i], 'click', source => {
                //Open the container's project when clicked
                projectPanel.openWhenReady(source.id);
            });
            registerProjectEvent(divs[i], 'mouseover', source => {

                if (projectPanel.projects !== null) {
                    //Prepare the project for display.
                    projectPanel.prepareProject(source.id);
                    //Add the button to the hovered list to change colors on mouse over
                    projectPanel.addHoveredButton(source.id);
                    //If we are on mobile, then open the project up
                    if (core.usingTouchDevice() && window.innerWidth < (59.375 * core.fontSize)) {
                        projectPanel.openWhenReady(source.id);
                    }
                }
            });
            registerProjectEvent(divs[i], 'mouseout', source => {
                //Remove the button from the hovered list to change colors on mouse out
                projectPanel.removeHoveredButton(source.id);
            });
        }
    }
});

//Called when the project panel changes colors
core.addToEvent(projectPanel.events.projectColorChangeEvent, project => {
    //If no project is being hovered over, then revert to original colors
    if (project == null) {
        revertInterpolation();
    } else {
        //Interpolate between the old color and the new project colors
        interpolateToColor(project.color, project.backgroundColor);
    }
});

/**
 * Adds a button to the hovered list. When a button is hovered over, this triggers the UI to change colors
 * @param {string} id The id of the button hovered over
 */
projectPanel.addHoveredButton = function(id) {
    if (projectPanel.hoveredButtons.length > 0 && projectPanel.hoveredButtons[0] != id) {
        projectPanel.hoveredButtons.length = 0;
    }
    projectPanel.hoveredButtons.push(id);
    projectPanel.triggerColorChangeEvent();
}

/**
 * Removes a button from the hovered list. When the list is empty, this triggers the UI to revert the colors
 * @param {string} id The id of the button no longer hovered over
 */
projectPanel.removeHoveredButton = function(id) {
    var index = projectPanel.hoveredButtons.findIndex(v => v == id);
    if (index > -1) {
        projectPanel.hoveredButtons.splice(index, 1);
        projectPanel.triggerColorChangeEvent();
    }
}

/**
 * Triggers the color change event
 */
projectPanel.triggerColorChangeEvent = function() {
    //If no project is selected or we aren't in the project panel, then trigger the event with a null project
    if (core.selectedPanel == null || core.selectedPanel.name != "projects") {
        core.callEvent(projectPanel.events.projectColorChangeEvent, null);
        return;
    }
    //if a project is opened, then pass the info of the opened project to the event
    if (projectPanel.projectOpen) {
        core.callEvent(projectPanel.events.projectColorChangeEvent, projectPanel.projects[projectPanel.openedProject]);
        //If we are hovering over a project, then pass the info of the hovered project to the event
    } else if (projectPanel.hoveredButtons.length > 0) {
        core.callEvent(projectPanel.events.projectColorChangeEvent, projectPanel.projects[projectPanel.hoveredButtons[0]]);
    } else {
        core.callEvent(projectPanel.events.projectColorChangeEvent, null);
    }
}

/**
 * Used for adding an event to a content-area element and it's children
 * @param {HTMLDivElement} element The child element to hook the event to
 * @param {string} evtName The name of the event
 * @param {(source: Element) => void} func The function called when the event is triggered
 */
function registerProjectEvent(element, evtName, func) {
    element.addEventListener(evtName, source => {
        /** @type {Node} */
        var currentElement = source.target;
        while (currentElement != null && currentElement.parentNode != null && !currentElement.parentNode.classList.contains("content-area")) {
            currentElement = currentElement.parentNode;
        }
        func(currentElement);
    });
}

/** The interpolation factor. This starts at 0 and slowly increments to 1 to interpolate between colors */
var colorInterpolationValue = 0.0;
/** The current color interpolation state */
var colorInterpolationState = projectPanel.ColorInterpolationState.Idle;

/** The top color to start from */
var startTopColor = projectPanel.originalTopColor.slice();
/** The bottom color to start from */
var startBottomColor = projectPanel.originalBottomColor.slice();

/** The top color to end to */
var endTopColor = projectPanel.originalTopColor.slice();
/** The bottom color to end to */
var endBottomColor = projectPanel.originalBottomColor.slice();

/**
 * Interpolates the UI to a new color
 * @param {string} topColor The top color to interpolate to
 * @param {string} bottomColor The bottom color to interpolate to
 */
function interpolateToColor(topColor, bottomColor) {
    //If on mobile, then immediately set the UI to the new color
    if (core.onMobile) {
        rootStyle.style.setProperty("--main-top-color", topColor);
        rootStyle.style.setProperty("--main-bottom-color", bottomColor);
        return;
    }
    core.removeFromEvent(core.events.updateEvent, projectPanel.revert_color_update);
    core.removeFromEvent(core.events.updateEvent, projectPanel.interpolation_color_update);

    startTopColor = core.lerpArray(startTopColor, endTopColor, colorInterpolationValue);
    startBottomColor = core.lerpArray(startBottomColor, endBottomColor, colorInterpolationValue);

    colorInterpolationValue = 0.0;

    endTopColor = core.cssToColor(topColor);
    endBottomColor = core.cssToColor(bottomColor);

    colorInterpolationState = projectPanel.ColorInterpolationState.Interpolating;

    core.addToEvent(core.events.updateEvent, projectPanel.interpolation_color_update);
}

/** Reverts a color interpolation back to it's original color */
function revertInterpolation() {
    //If on mobile, then immediately set the UI to the original color
    if (core.onMobile) {
        rootStyle.style.setProperty("--main-top-color", core.colorToCSS(projectPanel.originalTopColor));
        rootStyle.style.setProperty("--main-bottom-color", core.colorToCSS(projectPanel.originalBottomColor));
        return;
    }

    core.removeFromEvent(core.events.updateEvent, projectPanel.interpolation_color_update);
    core.removeFromEvent(core.events.updateEvent, projectPanel.revert_color_update);

    endTopColor = core.lerpArray(startTopColor, endTopColor, colorInterpolationValue);
    endBottomColor = core.lerpArray(startBottomColor, endBottomColor, colorInterpolationValue);

    startTopColor = projectPanel.originalTopColor.slice();
    startBottomColor = projectPanel.originalBottomColor.slice();

    colorInterpolationValue = 1.0;

    colorInterpolationState == projectPanel.ColorInterpolationState.Reverting;

    core.addToEvent(core.events.updateEvent, projectPanel.revert_color_update);
}

/**
 * Called every frame to interpolate to a new color
 * @param {number} dt The amount of time since the last update
 */
projectPanel.interpolation_color_update = function(dt) {
    colorInterpolationValue += dt * projectPanel.interpolationSpeed;
    if (colorInterpolationValue >= 1) {
        colorInterpolationValue = 1;
        colorInterpolationState = projectPanel.ColorInterpolationState.Full;
        core.removeFromEvent(core.events.updateEvent, projectPanel.interpolation_color_update);
    }

    projectPanel.calculate_colors();
}

var rootStyle = document.documentElement;

/** Calculates the new colors for the UI based on the interpolated colors */
projectPanel.calculate_colors = function() {
    rootStyle.style.setProperty("--main-top-color", core.colorToCSS(core.lerpArray(startTopColor, endTopColor, colorInterpolationValue)));
    rootStyle.style.setProperty("--main-bottom-color", core.colorToCSS(core.lerpArray(startBottomColor, endBottomColor, colorInterpolationValue)));
}

/**
 * Called every frame to interpolate to the original color
 * @param {number} dt The amount of time since the last update
 */
projectPanel.revert_color_update = function(dt) {
    colorInterpolationValue -= dt * projectPanel.interpolationSpeed;
    if (colorInterpolationValue <= 0) {
        colorInterpolationValue = 0;
        colorInterpolationState = projectPanel.ColorInterpolationState.Idle;
        core.removeFromEvent(core.events.updateEvent, projectPanel.revert_color_update);
    }

    projectPanel.calculate_colors();
}





//---------------------------------------------------
//------------------Initialization-------------------
//---------------------------------------------------

//Load all the possible projects
projectPanel.loadProjects();

console.log("Project Panel Loaded");