function showView(view) {
    var sections = document.querySelectorAll("section.view");
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("show");
    }
    document.getElementById(view + "_content").classList.add("show");
}

function hashChanged(e) {
    var after_hash = 1;
    var hash = window.location.hash;
    hash = hash.split("#")[after_hash];
    showView(hash);
}

function init() {
    window.addEventListener("hashchange", hashChanged);
    showView("profile")
}

document.addEventListener("DOMContentLoaded", init);