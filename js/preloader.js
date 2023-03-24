//Script used for preloading images

/**
 * Preloads an online image by attaching it to an image element
 * @param {string} url The url the image comes from
 * @returns Returns an image element with the src url set
 */
function preloadImage(url) {
    var img = new Image();
    img.src = url;
    return img;
}

//Called when the window is loaded
core.addToEvent(core.events.onWindowLoad, () => {
    //If a panel is loaded and we are not on the "Projects" panel
    if (core.selectedPanel == null || core.selectedPanel.name != "projects") {
        //Wait until projects-panel.js has loaded
        core.waitUntil(() => projectPanel && projectPanel.projects, () => {
            //Check if avif is supported
            core.checkAVIFSupport(avifSupported => {
                //Loop over all the loaded projects
                for (var p in projectPanel.projects) {
                    if (projectPanel.projects.hasOwnProperty(p)) {
                        //If avif is supported, load the avif image, if not, load the alternative image
                        if (avifSupported) {
                            preloadImage(projectPanel.projects[p].imageAVIF);
                        } else {
                            preloadImage(projectPanel.projects[p].image);
                        }
                    }
                }
            });
        });
    }
});