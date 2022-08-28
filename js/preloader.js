function preloadImage(url) {
    var img = new Image();
    img.src = url;
    return img;
}

function preloadImages(images) {
    for (var i = 0; i < images.length; i++) {
        images[i] = preloadImage(images[i]);
    }
    return images;
}

core.addToEvent(core.events.onWindowLoad, () => {
    if (core.selectedPanel == null || (core.selectedPanel.name == "aboutme" || core.selectedPanel.name == "home")) {
        setTimeout(() => {
            preloadImages([
                "screenshots/inferno-king-grimm.jpg",
                "screenshots/corrupted-kin.jpg",
                "screenshots/badland-battles.jpg",
                "screenshots/nitro.jpg",
                "screenshots/mega-muncher.png",
                "screenshots/ultimate-asteroid-tactical-control.jpg",
                "screenshots/uatanks.jpg",
                "screenshots/hacktrons.png",
                "screenshots/dungeon-escape.png",
                "screenshots/smarttubes.png",
                "screenshots/ceo-project.png",
                "screenshots/weavercore.png",
                "screenshots/portfolio-purple.png"
            ]);
        }, 1000);
    }
});