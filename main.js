var aboutButton = document.getElementById("about-button");
var homeButton = document.getElementById("home-button");
var projectButton = document.getElementById("project-button");
var mainScript = document.getElementById("main-script");
var backgroundLoaded = false;

var urlParams = new URLSearchParams(window.location.search);
var switching = false;

var onStateChange = [];
var onBackgroundLoaded = [];

const StateEnum = {
	Home : 0,
	About : 1,
	Projects : 2
}

var currentState = StateEnum.Home;
homeButton.classList.remove("selected-menu-item");

if (urlParams.get("about") !== null)
{
	currentState = StateEnum.About;
	aboutButton.classList.add("selected-menu-item");
}
else if (urlParams.get("projects") !== null)
{
	currentState = StateEnum.Projects;
	projectButton.classList.add("selected-menu-item");
}
else
{
	currentState = StateEnum.Home;
	homeButton.classList.add("selected-menu-item");
}

function LoadElements(state)
{
	if (state === StateEnum.Home) {
		fetch("sections/home.html").then(results =>
		{
			return results.text();
		}).then(str =>
		{
			var homeElement = document.createElement('div');
			mainScript.parentNode.insertBefore(homeElement,mainScript);
			//document.body.appendChild(homeElement);
			homeElement.outerHTML = str;
			for (var i = 0; i < onStateChange.length; i++) {
				onStateChange[i](state);
			}
		});
	}
	else if (state === StateEnum.About) {
		fetch("sections/about-me.html").then(results =>
		{
			return results.text();
		}).then(str =>
		{
			var aboutElement = document.createElement('div');
			mainScript.parentNode.insertBefore(aboutElement,mainScript);
			//document.body.appendChild(aboutElement);
			aboutElement.outerHTML = str;
			for (var i = 0; i < onStateChange.length; i++) {
				onStateChange[i](state);
			}
		});
	}
	else if (state === StateEnum.Projects) {
		//TODO
		fetch("sections/projects.html").then(results =>
		{
			return results.text();
		}).then(str =>
		{
			var projectElement = document.createElement('div');
			mainScript.parentNode.insertBefore(projectElement,mainScript);
			//document.body.appendChild(aboutElement);
			projectElement.outerHTML = str;
			for (var i = 0; i < onStateChange.length; i++) {
				onStateChange[i](state);
			}
		});
	}

}

var switchTimeout = null;

function SwitchToAbout(addToHistory = true)
{
	if (switchTimeout !== null) {
		clearTimeout(switchTimeout);
		switchTimeout = null;
		switching = false;
	}
	/*if (switching === true && addToHistory) {
		return;
	}*/
	switching = true;
	//aboutButton.classList.add("selected-menu-item");
	if (addToHistory) {
		window.history.pushState({},"Nickc01 Portfolio", GetURL() + "?about");
	}
	Reset();
	if (!aboutButton.classList.contains("selected-menu-item")) {
			aboutButton.classList.add("selected-menu-item");
	}
	currentState = StateEnum.About;
	switchTimeout = setTimeout(() =>
	{
		LoadElements(StateEnum.About);
		switching = false;
		switchTimeout = null;
	},801);
}

function SwitchToHome(addToHistory = true)
{
	if (switchTimeout !== null) {
		clearTimeout(switchTimeout);
		switchTimeout = null;
		switching = false;
	}
	/*if (switching === true && addToHistory) {
		return;
	}*/
	switching = true;
	if (addToHistory) {
		window.history.pushState({},"Nickc01 Portfolio", GetURL());
	}
	Reset();
	if (!homeButton.classList.contains("selected-menu-item")) {
		homeButton.classList.add("selected-menu-item");
	}
	currentState = StateEnum.Home;
	switchTimeout = setTimeout(() =>
	{
		LoadElements(StateEnum.Home);
		switching = false;
		switchTimeout = null;
	},801);
}

function SwitchToProjects(addToHistory = true)
{
	if (switchTimeout !== null) {
		clearTimeout(switchTimeout);
		switchTimeout = null;
		switching = false;
	}
	/*if (switching === true && addToHistory) {
		return;
	}*/
	switching = true;
	if (addToHistory) {
		window.history.pushState({},"Nickc01 Portfolio", GetURL() + "?projects");
	}
	Reset();
	if (!projectButton.classList.contains("selected-menu-item")) {
			projectButton.classList.add("selected-menu-item");
	}
	currentState = StateEnum.Projects;
	switchTimeout = setTimeout(() =>
	{
		LoadElements(StateEnum.Projects);
		switching = false;
		switchTimeout = null;
	},801);
}

window.addEventListener('popstate', (event) => {
  console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
  var urlParams = new URLSearchParams(document.location.search);
  console.log("Projects Result = " + urlParams.get("projects"));
  if (urlParams.get("about") !== null)
  {
  	//currentState = StateEnum.About;
  	//aboutButton.classList.add("selected-menu-item");
	console.log("Switching to About");
	SwitchToAbout(false);
  }
  else if (urlParams.get("projects") !== null)
  {
  	//currentState = StateEnum.Projects;
  	//projectButton.classList.add("selected-menu-item");
	SwitchToProjects(false);
	console.log("Switching to Projects");
  }
  else
  {
  	//currentState = StateEnum.Home;
  	//homeButton.classList.add("selected-menu-item");
	SwitchToHome(false);
	console.log("Switching to Home");
  }
});

function Reset()
{
	if (currentState === StateEnum.Home)
	{
		homeButton.classList.remove("selected-menu-item");
		var centerDiv = document.getElementById("center-div");
		if (centerDiv !== null && centerDiv !== undefined)
		{
			centerDiv.classList.add("doFadeOut");

			setTimeout(() =>
			{
				centerDiv.parentNode.removeChild(centerDiv);
			},800);
		}
	}
	else if (currentState === StateEnum.About) {
		aboutButton.classList.remove("selected-menu-item");
		var aboutSection = document.getElementById("about-section");
		if (aboutSection !== null && aboutSection !== undefined)
		{
			aboutSection.classList.add("doFadeOut");

			setTimeout(() =>
			{
				aboutSection.parentNode.removeChild(aboutSection);
			},800);
		}
	}
	else if (currentState === StateEnum.Projects) {
		//projectButton.classList.remove("selected-menu-item");
		projectButton.classList.remove("selected-menu-item");
		var projectsSection = document.getElementById("projects-container");
		if (projectsSection !== null && projectsSection !== undefined)
		{
			projectsSection.classList.remove("doFadeIn");
			projectsSection.classList.add("doFadeOut");

			setTimeout(() =>
			{
				projectsSection.parentNode.removeChild(projectsSection);
			},800);
		}
	}
	currentState = null;
}

function GetURL()
{
	var url = window.location.href;
	if (url.search("/?") !== -1) {
		return url.split("?")[0];
	}
	else {
		return url;
	}
}

LoadElements(currentState);
