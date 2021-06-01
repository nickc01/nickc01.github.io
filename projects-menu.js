//var selectedProjectArea = document.getElementById("selected-project-area");
//var projectsArea = document.getElementById("projects-area");
var projectOpen = false;

var projectDetails = null;

var colorInterpTime = 200.0 / 1000.0;

var colorSetter = null;

var originalTopColor = null;
var originalBottomColor = null;

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
  var result = "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
  if (color.length >= 4) {
	  result += componentToHex(color[3]);
  }
  return result;
}

function hexToRgb(hex) {
	hex = hex.replace(" ","");
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result)
  {
	  return [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16),parseInt(result[4], 16) ];
  }
  else {
  	result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (result)
	{
		return [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16),255 ];
	}
	return null;
  }
}

function OpenProjectWindow(sourceElement)
{
	if (projectOpen) {
		return;
	}
	projectOpen = true;
	DisableWindowScrolling();
	if (colorSetter === null) {
		clearTimeout(colorSetter);
		colorSetter = null;
	}
	if (sourceElement !== undefined) {
		var project = projectDetails[sourceElement.id];

		document.documentElement.style.setProperty('--project-window-top-color', project.color);
		document.documentElement.style.setProperty('--project-window-bottom-color', project.backgroundColor);
	}
	var selectedProjectArea = document.getElementById("selected-project-area")
	selectedProjectArea.classList.remove("fade-out-proj-window");
	selectedProjectArea.classList.add("fade-in-proj-window");
	onResize();

	var videoAreaElement = document.getElementById("video-area");
	var vs = videoAreaElement.getElementsByTagName("video");
	if (vs.length > 0) {
		var videoElement = vs[0];
		videoElement.load();
	}
	//videoElement.play();
}

function CloseButtonHover()
{
	if (window.innerWidth < 950 && is_touch_enabled()) {
		CloseProjectWindow();
	}
}

function CloseProjectWindow()
{
	if (!projectOpen) {
		return;
	}
	EnableWindowScrolling();
	var selectedProjectArea = document.getElementById("selected-project-area")
	selectedProjectArea.classList.remove("fade-in-proj-window");
	selectedProjectArea.classList.add("fade-out-proj-window");
	projectOpen = false;
	ResetColors();
	/*InterpolateToNewColor(defaultTopColor,defaultBottomColor,colorInterpTime);*/
}

var oldScrollPos = null;

function DisableWindowScrolling()
{
	oldScrollPos = [window.scrollX, window.scrollY];
	window.addEventListener('scroll',_noScrollCallback);
	//document.documentElement.style.overflow = "hidden hidden";
	document.documentElement.style.touchAction = "none";
	document.body.style.touchAction = "none";
}

function EnableWindowScrolling()
{
	window.removeEventListener('scroll',_noScrollCallback);
	//document.documentElement.style.overflow = "hidden auto";
	document.documentElement.style.touchAction = null;
	document.body.style.touchAction = null;
	document.documentElement.style.overflow = null;
}

function _noScrollCallback()
{
	if (window.innerWidth >= 950) {
		window.scrollTo(oldScrollPos[0],oldScrollPos[1]);
	}
}

function onResize()
{
	if (projectOpen) {
		if (window.innerWidth < 950) {
			document.documentElement.style.overflow = "hidden";
		}
		else {
			document.documentElement.style.overflow = null;
		}
	}
}

window.addEventListener('resize', onResize);

//OpenProjectWindow();

function ChangeColors(sourceElement)
{
	if (colorSetter === null) {
		clearTimeout(colorSetter);
		colorSetter = null;
	}
	var root = document.documentElement;

	var project = projectDetails[sourceElement.id];

	root.style.setProperty('--project-title-font-size', project.fontSize);
	root.style.setProperty('--project-background-image', "url(" + project.image + ")");
	root.style.setProperty('--project-text-color', project.textColor);

	var bottomColor = hexToRgb(project.backgroundColor);
	bottomColor[3] = 255;

	root.style.setProperty('--project-window-bottom-color-solid', rgbToHex(bottomColor));

	var titleElement = document.getElementById("contents-title");
	titleElement.innerHTML = project.name;

	var descriptionElement = document.getElementById("description");
	var date = "<h3>" + project.date + "</h3></br>";
	descriptionElement.innerHTML = date + project.description + CreateLinksElement(project.links);

	//TODO - DO VIDEO
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
		sourceElement.setAttribute('src',project.video);
		//videoElement.pause();
		//videoElement.load();
		//videoElement.play();
	}

	/*videoElement.pause();
	videoElement.innerHTML = "<source src=\"" + project.video + "\" type=\"video/mp4\">";
	videoElement.play();*/

	var perlinColor = null;
	var perlinBackgroundColor = null;

	if (project.hasOwnProperty("perlinColor")) {
		perlinColor = hexToRgb(project.perlinColor);
	}
	else {
		perlinColor = hexToRgb(project.color);
	}

	if (project.hasOwnProperty("perlinBackgroundColor")) {
		perlinBackgroundColor = hexToRgb(project.perlinBackgroundColor);
	}
	else {
		perlinBackgroundColor = hexToRgb(project.backgroundColor);
		perlinBackgroundColor[0] /= 4.0;
		perlinBackgroundColor[1] /= 4.0;
		perlinBackgroundColor[2] /= 4.0;

		perlinBackgroundColor = lerpColor(perlinColor,perlinBackgroundColor,0.8);
	}

	InterpolateToNewColor(perlinColor,perlinBackgroundColor,colorInterpTime);

	/*if (project.hasOwnProperty("perlinColor")) {
		var perlinColor = hexToRgb(project.perlinColor);
			InterpolateToNewColor(hexToRgb(project.color),perlinColor,colorInterpTime);
	}
	else {
		//bottomColor[0] /= 3.0;
		//bottomColor[1] /= 3.0;
		//bottomColor[2] /= 3.0;
		InterpolateToNewColor(hexToRgb(project.color),bottomColor,colorInterpTime);
	}*/


	colorSetter = setTimeout(() => {
		root.style.setProperty('--project-window-top-color', project.color);
		root.style.setProperty('--project-window-bottom-color', project.backgroundColor);
		colorSetter = null;
	},colorInterpTime * 500);
	//AddRoutine(interpolateCSSVars(project,colorInterpTime));
}

// could pass in an array of specific stylesheets for optimization
/*function getAllCSSVariableNames(styleSheets = document.styleSheets){
   var cssVars = [];
   // loop each stylesheet
   for(var i = 0; i < styleSheets.length; i++){
      // loop stylesheet's cssRules
      try{ // try/catch used because 'hasOwnProperty' doesn't work
         for( var j = 0; j < styleSheets[i].cssRules.length; j++){
            try{
               // loop stylesheet's cssRules' style (property names)
               for(var k = 0; k < styleSheets[i].cssRules[j].style.length; k++){
                  let name = styleSheets[i].cssRules[j].style[k];
                  // test name for css variable signiture and uniqueness
                  if(name.startsWith('--') && cssVars.indexOf(name) == -1){
                     cssVars.push(name);
                  }
               }
            } catch (error) {}
         }
      } catch (error) {}
   }
   return cssVars;
}

function getElementCSSVariables (allCSSVars, element = document.body, pseudo){
   var elStyles = window.getComputedStyle(element, pseudo);
   var cssVars = {};
   for(var i = 0; i < allCSSVars.length; i++){
      let key = allCSSVars[i];
	  console.log("Key = " + key);
      let value = elStyles.getPropertyValue(key)
	  console.log("Value = " + value);
      if(value){cssVars[key] = value;}
   }
   return cssVars;
}*/

function* interpolateCSSVars(project, time)
{
	//var cssVars = getAllCSSVariableNames();
	//console.log("CSS Vars = " + cssVars);
	//console.log(':root variables', getElementCSSVariables(cssVars, document.documentElement));

	//console.log("RUNNING INTERP");
	/*var root = document.documentElement;
	var rootStyle = window.getComputedStyle(root);
	console.log("Top BG Color = " + rootStyle.getPropertyValue('--project-window-top-color'));
	var oldTopColor = hexToRgb(rootStyle.getPropertyValue('--upper-bg-color'));
	var oldBottomColor = hexToRgb(rootStyle.getPropertyValue('--lower-bg-color'));

	var newTopColor = hexToRgb(project.color);
	var newBottomColor = hexToRgb(project.backgroundColor);*/
	//console.log("Old Top Color = " + oldTopColor);
	//console.log("Old Bottom Color = " + oldBottomColor);
	//console.log("New Top Color = " + newTopColor);
	//console.log("New Bottom Color = " + newBottomColor);

	/*for (var timer = 0.0; timer <= time; timer += ROUTINE_DT)
	{
		var tColor = lerpColor(oldTopColor,newTopColor,timer / time);
		var bColor = lerpColor(oldBottomColor,newBottomColor,timer / time);
		//console.log("New Top Color = " + rgbToHex(tColor));
		rootStyle.setProperty('--upper-bg-color', rgbToHex(tColor));
		rootStyle.setProperty('--lower-bg-color', rgbToHex(bColor));
		//console.log("INTERP = " + timer);
		yield null;
	}*/
	//console.log("Loop END");
	/*
	--top-bg-color: #6B9D3E;
	--bottom-bg-color: #2E383A;
	*/

}

function ResetColors()
{
	if (projectOpen) {
		return;
	}
	if (colorSetter === null) {
		clearTimeout(colorSetter);
		colorSetter = null;
	}
	if (originalTopColor !== undefined && originalTopColor !== null) {
		colorSetter = setTimeout(() => {
			document.documentElement.style.setProperty('--project-window-top-color', originalTopColor);
			document.documentElement.style.setProperty('--project-window-bottom-color', originalBottomColor);
			colorSetter = null;
		},colorInterpTime * 500);
	}
	if (defaultTopColor !== undefined && defaultTopColor !== null) {
		InterpolateToNewColor(defaultTopColor,defaultBottomColor,colorInterpTime);
	}
}

function OpenProject(sourceElement)
{
	if (projectDetails === null) {
		return;
	}

	OpenProjectWindow(sourceElement);
}

function FetchProjectDetails()
{
	fetch("projects.json").then(response =>
	{
		return response.json();
	}).then(value =>
	{
		projectDetails = value["projects"];
		console.log("Project Details = " + projectDetails["inferno-king-grimm"].name);
	});
}

function CreateLinksElement(links)
{
	if (links === undefined || links == null) {
		return "";
	}
	var outerHTML = "<div id=\"description-links\" class=\"unhighlightable\">";
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		outerHTML += "<a href=\"" + link.link + "\">" + link.name + "</a>";
	}
	outerHTML += "</div>";
	return outerHTML;
}

FetchProjectDetails();

function is_touch_enabled() {
    return ( 'ontouchstart' in window ) ||
           ( navigator.maxTouchPoints > 0 ) ||
           ( navigator.msMaxTouchPoints > 0 );
	   }

onStateChange.push(state =>
{
	if (state !== StateEnum.Projects) {
		ResetColors();
		return;
	}
	var projectsArea = document.getElementById("projects-area");
	var divs = projectsArea.getElementsByTagName("div");

	for (var i = 0; i < divs.length; i++) {
		registerProjectEvent(divs[i],'click',source =>
		{
			OpenProject(source);
		});
		registerProjectEvent(divs[i],'mouseover',source =>
		{
			ChangeColors(source);
			if (is_touch_enabled() && window.innerWidth < 950) {
				OpenProject(source);
			}
		});
		registerProjectEvent(divs[i],'mouseout',source => ResetColors());
	}

	var rootStyle = window.getComputedStyle(document.documentElement);
	originalTopColor = rootStyle.getPropertyValue("--project-window-top-color");
	originalBottomColor = rootStyle.getPropertyValue("--project-window-bottom-color-solid");
});

function registerProjectEvent(element,evtName,func)
{
	element.addEventListener(evtName,source => {
		var currentElement = source.target;
		while (currentElement != null && currentElement.parentNode != null && currentElement.parentNode.id != "projects-area") {
			currentElement = currentElement.parentNode;
		}
		func(currentElement);
	});
}
