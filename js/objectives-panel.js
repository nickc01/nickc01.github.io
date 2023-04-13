// @ts-check

//This file contains the main logic for the objectives panel

//This file reuses the project display window for displaying objectives

var objectivesPanel = {};


/** A list of valid states the objectivesPanel.objectives array can be in */
objectivesPanel.ObjectiveState = {
    Unloaded: 0,
    Loading: 1,
    Loaded: 2
}



//---------------------------------------------------
//---------------------Variables---------------------
//---------------------------------------------------

/** Is a project currently being viewed in a window? */
objectivesPanel.objectiveOpen = false;

/** @type {number | null} The project that is currently being viewed in a window */
objectivesPanel.openedObjective = null;

/** Contains all possible objective that can be loaded into a window*/
objectivesPanel.objectives = [];

/** @type {boolean} Is true if the list of objectives has been fully loaded */
objectivesPanel.objectivesLoaded = false;

/** The current state of the project window */
objectivesPanel.currentObjectiveState = objectivesPanel.ObjectiveState.Unloaded;


const DEFAULT_TITLE_COLOR = "rgba(46, 56, 58)";
const DEFAULT_TEXT_COLOR = "#cccccc";
const DEFAULT_FOREGROUND_COLOR = "rgb(107, 157, 62)";
const DEFAULT_BACKGROUND_COLOR = "rgba(46, 56, 58, 0.75)";


//---------------------------------------------------
//---------------------Functions---------------------
//---------------------------------------------------
/**
 * Opens an objective and display's it in a window
 * @param {number} objectiveIndex The index of the objective to open
 */
objectivesPanel.openObjective = function (objectiveIndex) {
    //Return if the projects panel isn't open
    if (objectivesPanel.objectiveOpen) {
        return;
    }

    //Return if no projects have been loaded yet
    if (objectivesPanel.currentObjectiveState != objectivesPanel.ObjectiveState.Loaded) {
        return;
    }

    //Return if there is no panel loaded or if we aren't on the projects panel or the panel isn't loaded yet
    if (typeof windowDisplay === 'undefined' ||
        core.selectedPanel == null ||
        core.selectedPanel.name != "objectives" ||
        core.currentPanelState != core.PanelState.Idle) {
        return;
    }

    if (objectiveIndex == null) {
        return;
    }

    var objectiveElement = document.getElementById("objectives-content").getElementsByTagName("p")[objectiveIndex];

    console.log("ELEMENT = " + objectiveElement);

    objectivesPanel.openedObjective = objectiveIndex;
    objectivesPanel.objectiveOpen = true;

    var objective = objectivesPanel.objectives[objectiveIndex];

    windowDisplay.clearTags();
    windowDisplay.setVideo(null);
    windowDisplay.setWindowTitle(objective.title);
    windowDisplay.setVertical(true);

    var objectiveText = objectiveElement.outerHTML;

    if (objectiveText.substring(4, 6) == ". ") {
        objectiveText = objectiveText.substring(0, 3) + objectiveText.substring(6);
    }

    windowDisplay.setLeftContent(objectiveText.replace("<p", "<h2"));

    var rightContent = "<h1>Projects</h1>";
    if (objective.projects) {
        for (var i = 0; i < objective.projects.length; i++) {
            rightContent += objectivesPanel.createProjectUI(objective.projects[i], i);
        }
    }

    windowDisplay.setRightContent(rightContent);


    var textColor = objective.textColor != undefined ? objective.textColor : DEFAULT_TEXT_COLOR;
    var titleColor = objective.titleColor != undefined ? objective.titleColor : DEFAULT_TITLE_COLOR;
    var foreColor = objective.foregroundColor != undefined ? objective.foregroundColor : DEFAULT_FOREGROUND_COLOR;
    var backColor = objective.backgroundColor != undefined ? objective.backgroundColor : DEFAULT_BACKGROUND_COLOR;

    windowDisplay.setBackgroundImage(null);
    windowDisplay.setTitleColor(titleColor);
    windowDisplay.setTextColor(textColor);
    windowDisplay.setForegroundColor(foreColor);
    windowDisplay.setBackgroundColor(backColor);
    windowDisplay.setWindowWidth(85);
    windowDisplay.setWindowHeight(75);

    windowDisplay.show();
}

/**
 * Creates a project entry
 * @param {any} project
 * @param {number} index
 * @returns
 */
objectivesPanel.createProjectUI = function(project, index) {

    var image = "url(";
    if (core.AVIFSupported)
    {
        image += project.avifImage;
    }
    else
    {
        image += project.image;
    }
    image += ");";

    var style = "'background-image: " + image + "'";

    var foreColor = project.foreColor ? project.foreColor : "var(--project-text-color)";
    var backColor = project.backColor ? project.backColor : "rgb(28, 34, 36)";
    var titleColor = project.titleColor ? project.titleColor : foreColor;

    var info = project.info;

    var reverseRow = (index % 2 == 1) ? "style='flex-direction: row-reverse;'" : "";

    info = objectivesPanel.replaceMarkdownLinks(info, project.color);
    var str = "<div " + reverseRow + " class='double-flexbox'>"
    + "<div style='background-color:" + backColor + "; color:" + foreColor + ";' class='left-side-content'>"
    + "<h2><a style='color:" + titleColor + ";' href='?project=" + project.name + "' target='_blank' rel='noopener noreferrer'>" + project.title + "</a></h2>"
    + "<p>" + info + "</p>"
    + "<p style='text-align: right;' ><a style='color:" + project.color + ";' href='?project=" + project.name + "' target='_blank' rel='noopener noreferrer'>More Info</a></p>"
    + "</div>"
    + "<div class='right-side-image' style=" + style + "></div>";

    str += "</div>";
    return str;
}

/**
 * Replaces any markdown links with html 'a' links
 * @param {string} str
 * @param {string} color
 * @returns {string}
 */
objectivesPanel.replaceMarkdownLinks = function(str, color) {
    var output = '';
    var nameStart = -1;
    var nameEnd = -1;
    var urlStart = -1;
    var i = 0;
    while (i < str.length) {
        const char = str[i];
        if (char === '[') {
            nameStart = i + 1;
        } else if (char === ']' && nameStart !== -1) {
            nameEnd = i;
        } else if (char === '(' && nameEnd !== -1) {
            if (i > 0 && str[i - 1] == ']') {
                urlStart = i + 1;
            }
            else {
                nameStart = -1;
                nameEnd = -1;
                urlStart = -1;
            }
        } else if (char === ')' && urlStart !== -1) {
            const name = str.substring(nameStart, nameEnd);
            const url = str.substring(urlStart, i);
            output += "<a style='color:" + color + ";' href=" + url + " target='_blank'' rel='noopener noreferrer''>" + name + "</a>";
            nameStart = -1;
            nameEnd = -1;
            urlStart = -1;
        } else if (nameStart === -1) {
            output += char;
        }
        i++;
    }
    return output;
}

/** Closes the project window */
objectivesPanel.closeObjective = function() {
    if (typeof windowDisplay === 'undefined' || !objectivesPanel.objectiveOpen) {
        return;
    }

    objectivesPanel.objectiveOpen = false;
    objectivesPanel.openedObjective = null;
    windowDisplay.close();
}

objectivesPanel.loadObjectives = function() {
    //Set the current state to loading
    objectivesPanel.currentObjectiveState == objectivesPanel.ObjectiveState.Loading;
    //Fetch all the projects
    fetch("objectives.json").then(response => {
        return response.json();
    }).then(value => {
        console.log("LOADED OBJECTIVES = " + value);
        //If successful, then set the projects array to the loaded projects
        objectivesPanel.objectives = value["objectives"];
        objectivesPanel.currentObjectiveState = objectivesPanel.ObjectiveState.Loaded;
        objectivesPanel.objectivesLoaded = true;

        core.waitUntil(() => typeof windowDisplay !== 'undefined', () => {
            core.addToEvent(windowDisplay.events.onWindowClose,objectivesPanel.closeObjective);
        });
    });
}

/**
 * Adds click handlers to the 6 buttons on the main screen
 */
objectivesPanel.addClickHandlers = function() {
    var content = document.getElementById("objectives-content");
    var objectivePs = content.getElementsByTagName("p");

    for (let i = 0; i < objectivePs.length; i++) {
        var element = objectivePs[i];
        element.addEventListener('click',source => {
            for (let j = 0; j < objectivePs.length; j++) {
                if (objectivePs[j] == source.target)
                {
                    objectivesPanel.openObjective(j);
                }
            }
        });
    }
}

//Loads the objectives
objectivesPanel.loadObjectives();

//Called when the project panel changes colors
core.addToEvent(core.events.onEnterPanelEvent, panel => {
    if (panel.name == "objectives")
    {
        objectivesPanel.addClickHandlers();
    }
});

//Called when a panel is unloading
core.addToEvent(core.events.onPanelLeaveEvent, panel => {
    if (panel.name == "objectives") {
        objectivesPanel.closeObjective();
    }
})

console.log("Objectives Panel Loaded");