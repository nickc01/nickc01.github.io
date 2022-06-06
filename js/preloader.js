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

window.onload = function () {
    if (core.selectedPanel == null || (core.selectedPanel.name == "aboutme" || core.selectedPanel.name == "home")) {
        preloadImages([
            "screenshots/corrupted-kin.jpg",
            "screenshots/uatanks.jpg",
            "screenshots/dungeon-escape.png",
            "screenshots/ceo-project.png",
            "screenshots/nitro.jpg",
            "screenshots/badland-battles.jpg",
            "screenshots/inferno-king-grimm.jpg",
            "screenshots/weavercore.jpg",
            "screenshots/mega-muncher.png",
            "screenshots/hacktrons.png",
            "screenshots/ultimate-asteroid-tactical-control.jpg",
            "screenshots/smarttubes.png"
        ]);
    }
}