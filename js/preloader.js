function preloadImage(url) {
    var img = new Image();
    img.src = url;
    return img;
}

core.addToEvent(core.events.onWindowLoad, () => {
    if (core.selectedPanel == null || (core.selectedPanel.name == "aboutme" || core.selectedPanel.name == "home")) {
        var intervalID = null;
        intervalID = setInterval(() => {
            if (projectPanel && projectPanel.projects) {
                clearInterval(intervalID);
                core.checkAVIFSupport(avifSupported => {
                    for (var p in projectPanel.projects) {
                        if (projectPanel.projects.hasOwnProperty(p)) {
                            if (avifSupported) {
                                preloadImage(projectPanel.projects[p].imageAVIF);
                            }
                            else {
                                preloadImage(projectPanel.projects[p].image);
                            }
                        }
                    }
                });
            }
        }, 500);
    }
});