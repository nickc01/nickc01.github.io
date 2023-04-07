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

/** The different states used for interpolating colors */
/*objectivesPanel.ColorInterpolationState = {
    Idle: 0,
    Interpolating: 1,
    Full: 2,
    Reverting: 3
}*/




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
 objectivesPanel.openObjective = function(objectiveIndex) {
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
        core.currentPanelState != core.PanelState.Idle) 
    {
        return;
    }

    if (objectiveIndex == null) {
        return;
    }

    //var root = document.documentElement;

    var objectiveElement = document.getElementById("objectives-content").getElementsByTagName("p")[objectiveIndex];

    console.log("ELEMENT = " + objectiveElement);

    objectivesPanel.openedObjective = objectiveIndex;
    objectivesPanel.objectiveOpen = true;

    var objective = objectivesPanel.objectives[objectiveIndex];

    //var closeButton = document.getElementById("close-button-svg");

    /*for (var i = 0; i < closeButton.childElementCount; i++) {
        var child = closeButton.children[i];
        child.setAttribute("width", 3.5 * core.fontSize);
        child.setAttribute("height", 0.5 * core.fontSize);
    }*/

    windowDisplay.clearTags();
    windowDisplay.setVideo(null);
    windowDisplay.setWindowTitle(objective.title);
    windowDisplay.setVertical(true);

    var objectiveText = objectiveElement.outerHTML;//.replace("<p","<h2");

    if (objectiveText.substring(4,6) == ". ") {
        objectiveText = objectiveText.substring(0,3) + objectiveText.substring(6);
    }

    windowDisplay.setLeftContent(objectiveText.replace("<p","<h2"));

    var rightContent = "<h1>Projects</h1>";
    if (objective.projects)
    {
        for (const project of objective.projects) {
            rightContent += objectivesPanel.createProjectUI(project);
        }
    }

    windowDisplay.setRightContent(rightContent);


    //Update the project window title
    /*var projectTitle = document.getElementById("selected-project-title");
    projectTitle.textContent = objective.name;

    //Update the title dimensions
    if (objective.titleWidth != undefined) {
        projectTitle.parentElement.setAttribute("viewBox", "0 " + (-(core.fontSize - 16)) + " " + (objective.titleWidth * core.fontSize / 16) + " " + (25 * core.fontSize / 16));
    }*/

    var textColor = objective.textColor != undefined ? objective.textColor : DEFAULT_TEXT_COLOR;
    var titleColor = objective.titleColor != undefined ? objective.titleColor : DEFAULT_TITLE_COLOR;
    var foreColor = objective.foregroundColor != undefined ? objective.foregroundColor : DEFAULT_FOREGROUND_COLOR;
    var backColor = objective.backgroundColor != undefined ? objective.backgroundColor : DEFAULT_BACKGROUND_COLOR;

    windowDisplay.setBackgroundImage(null);
    windowDisplay.setTitleColor(titleColor);
    windowDisplay.setTextColor(textColor);
    windowDisplay.setForegroundColor(foreColor);
    windowDisplay.setBackgroundColor(backColor);
    
    //Set the title color
    //root.style.setProperty('--title-text-color', titleColor);

    /*if (objective.titleColor != undefined) {
        root.style.setProperty('--title-text-color', objective.titleColor);
    } else {
        root.style.setProperty('--title-text-color', objective.textColor);
    }*/

    //Update the background image and text color
    /*root.style.setProperty('--project-background-image', "none");
    root.style.setProperty('--project-text-color', textColor);

    var bottomColor = core.cssToColor(backColor);
    var topColor = core.cssToColor(foreColor);

    //Update the top and bottom colors
    root.style.setProperty('--main-bottom-color-solid', "rgb(" + bottomColor[0] + ", " + bottomColor[1] + ", " + bottomColor[2] + ")");
    root.style.setProperty('--main-top-color-solid', "rgb(" + topColor[0] + ", " + topColor[1] + ", " + topColor[2] + ")");

    root.style.setProperty('--main-bottom-color', "rgb(" + bottomColor[0] + ", " + bottomColor[1] + ", " + bottomColor[2] + ")");
    root.style.setProperty('--main-top-color', "rgb(" + topColor[0] + ", " + topColor[1] + ", " + topColor[2] + ")");*/

    /*var descriptionElement = document.getElementById("description");
    var date = "<h3>" + objective.date + "</h3>";

    var description = "";

    for (var i = 0; i < objective.description.length; i++) {
        description += "</br>" + objective.description[i] + ".</br>";
    }

    //Set the date and description
    descriptionElement.innerHTML = date + description;

    //Setup the skills section
    if (objective.skills != undefined) {
        var skills = "</br><h3>Skills:</h3>";

        for (var i = 0; i < objective.skills.length; i++) {
            skills += " - " + objective.skills[i] + "</br>";
        }

        descriptionElement.innerHTML += skills;
    }

    //Setup the credits section
    if (objective.credits != undefined) {
        var credits = "</br><h3>Credits:</h3>";

        for (var i = 0; i < objective.credits.length; i++) {
            var credit = objective.credits[i];
            credits += " - " + credit.name + ": <a href=\"" + credit.link + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + credit.label + "</a></br>";
        }

        descriptionElement.innerHTML += credits;
    }

    //Setup the project button links
    descriptionElement.innerHTML += objectivesPanel.GenerateLinksElement(objective.links);

    //Setup the main video area
    var videoAreaElement = document.getElementById("video-area");
    var vs = videoAreaElement.getElementsByTagName("video");
    if (vs.length > 0) {
        var videoElement = vs[0];
        var sources = videoAreaElement.getElementsByTagName("source");
        var sourceElement = null;
        if (sources.length == 0) {
            sourceElement = document.createElement('source');
            videoElement.appendChild(sourceElement);
        } else {
            sourceElement = sources[0];
        }
        sourceElement.setAttribute('src', objective.video);
    }

    //Add project tags
    var tagsElement = document.getElementById("selected-project-tags");
    if (objective.tags != undefined) {
        var tags = "";
        for (var i = 0; i < objective.tags.length; i++) {
            tags += "<h1>" + objective.tags[i] + "</h1>";
        }

        tagsElement.innerHTML = tags;
    } else {
        tagsElement.innerHTML = "";
    }*/
    ////

    //Disable scrolling in the main document so the user can scroll within the project window
    //root.style.overflowY = "hidden";

    //var project = objectivesPanel.objectives[objectiveIndex];

    //var selectedProjectArea = document.getElementById("selected-project-area")

    //Fade in the project window
    /*selectedProjectArea.classList.remove("fade-out-proj-window");
    selectedProjectArea.classList.add("fade-in-proj-window");*/

    //Load the project video
    /*var videoAreaElement = document.getElementById("video-area");
    var vs = videoAreaElement.getElementsByTagName("video");
    if (vs.length > 0) {
        var videoElement = vs[0];
        videoElement.load();
    }*/
    windowDisplay.show();
}

objectivesPanel.createProjectUI = function(project) {

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

    var str = "<div class='double-flexbox'>";
    str += "<div style='background-color:" + backColor + "; color:" + foreColor + ";' class='left-side-content'>";
    str += "<h2><a style='color:" + titleColor + ";' href='?project=" + project.name + "' target='_blank' rel='noopener noreferrer'>" + project.title + "</a></h2>";
    str += "<p>" + project.info + "</p>"
    str += "</div>";
    //str += "<div class='grow-space'></div>";
    //str += "<img class='right-side-image' src='" + (core.AVIFSupported ? project.avifImage : project.image) +  "' />";
    str += "<div class='right-side-image' style=" + style + "></div>";

    str += "</div>";

    /*var str = "<img class='right-side-image' src='" + (core.AVIFSupported ? project.avifImage : project.image) +  "' />";
    str += "<h2><a style='color:" + project.color + ";' href='?project=" + project.name + "' target='_blank' rel='noopener noreferrer'>" + project.title + "</a></h2>";
    str += project.info;*/
    return str;
    //("url(" + (core.AVIFSupported ? project.imageAVIF : project.image) + ")");
}

/** Closes the project window */
objectivesPanel.closeObjective = function() {
    if (typeof windowDisplay === 'undefined' || !objectivesPanel.objectiveOpen) {
        return;
    }

    objectivesPanel.objectiveOpen = false;
    objectivesPanel.openedObjective = null;

    //Allow scrolling again in the main document
    /*document.documentElement.style.overflowY = "auto";

    //Fade the project window out
    var selectedProjectArea = document.getElementById("selected-project-area")
    selectedProjectArea.classList.remove("fade-in-proj-window");
    selectedProjectArea.classList.add("fade-out-proj-window");*/
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

objectivesPanel.loadObjectives();

/*core.waitUntil(() => objectivesPanel.objectivesLoaded, () => {
    objectivesPanel.addClickHandlers();
});*/

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