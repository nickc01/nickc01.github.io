var aboutButton = document.getElementById("about-button");
var homeButton = document.getElementById("home-button");
var projectButton = document.getElementById("project-button");

var urlParams = new URLSearchParams(window.location.search);
var switching = false;

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
			document.body.appendChild(homeElement);
			homeElement.outerHTML = str;
		});
	}
	else if (state === StateEnum.About) {
		fetch("sections/about-me.html").then(results =>
		{
			return results.text();
		}).then(str =>
		{
			var aboutElement = document.createElement('div');
			document.body.appendChild(aboutElement);
			aboutElement.outerHTML = str;
		});
	}
	else if (state === StateEnum.Projects) {
		//TODO
	}
}

function SwitchToAbout()
{
	if (switching === true) {
		return;
	}
	switching = true;
	aboutButton.classList.add("selected-menu-item");
	window.history.pushState({},"Nickc01 Portfolio", GetURL() + "?about");
	Reset();
	setTimeout(() =>
	{
		LoadElements(StateEnum.About);
		currentState = StateEnum.About;
		switching = false;
	},801);
}

function SwitchToHome()
{
	if (switching === true) {
		return;
	}
	switching = true;
	homeButton.classList.add("selected-menu-item");
	window.history.pushState({},"Nickc01 Portfolio", GetURL());
	Reset();
	setTimeout(() =>
	{
		LoadElements(StateEnum.Home);
		currentState = StateEnum.Home;
		switching = false;
	},801);
}

function SwitchToProjects()
{
	if (switching === true) {
		return;
	}
	switching = true;
	projectButton.classList.add("selected-menu-item");
	window.history.pushState({},"Nickc01 Portfolio", GetURL() + "?projects");
	Reset();
	setTimeout(() =>
	{
		LoadElements(StateEnum.Projects);
		currentState = StateEnum.Projects;
		switching = false;
	},801);
}

function Reset()
{
	if (currentState === StateEnum.Home)
	{
		homeButton.classList.remove("selected-menu-item");
		var centerDiv = document.getElementById("center-div");
		centerDiv.classList.add("doFadeOut");

		setTimeout(() =>
		{
			centerDiv.parentNode.removeChild(centerDiv);
		},800);
	}
	else if (currentState === StateEnum.About) {
		aboutButton.classList.remove("selected-menu-item");
		var aboutSection = document.getElementById("about-section");
		aboutSection.classList.add("doFadeOut");

		setTimeout(() =>
		{
			aboutSection.parentNode.removeChild(aboutSection);
		},800);
	}
	else if (currentState === StateEnum.Projects) {
		projectButton.classList.remove("selected-menu-item");
	}
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
