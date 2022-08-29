function preloadImage(url) {
    var img = new Image();
    img.src = url;
    return img;
}

/*function preloadImages(images, useAvif, extension) {
    for (var i = 0; i < images.length; i++) {
        if (useAvif) {
            images[i] = preloadImage("screenshots/avif/" + images[i] + ".avif");
        }
        else {
            images[i] = preloadImage("screenshots/" + images[i] + "." + extension);
        }
        //images[i] = preloadImage(images[i]);
    }
    return images;
}*/

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