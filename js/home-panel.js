var homePanel = {};




homePanel.downArrowClick = function () {
    var bottom = document.getElementById("bottom-side");

    var rect = bottom.getBoundingClientRect();

    window.scrollTo({
        top: window.scrollY + rect.bottom,
        behavior: "smooth"
    });
}


