console.log("Preloader!!!");

function preloadImage(url){
    const img = new Image();
    img.src = url;
    return img
  }
  
  function preloadImages(images) {
    for (var i = 0; i < images.length; i++) {
      images[i] = preloadImage(images[i])
    }
    return images
  }

if (currentState === StateEnum.Home || currentState === StateEnum.About)
{
    let arr = [
        "screenshots/nitro.jpg",
        "screenshots/corrupted-kin.jpg",
        "screenshots/badland-battles.jpg",
        "screenshots/inferno-king-grimm.jpg",
        "screenshots/mega-muncher.png",
        "screenshots/ultimate-asteroid-tactical-control.jpg",
        "screenshots/uatanks.jpg",
        "screenshots/hacktrons.png"
      ];
    preloadImages(arr);
}