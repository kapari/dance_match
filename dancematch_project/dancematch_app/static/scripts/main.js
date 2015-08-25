// ===== MAIN =========================================
// ====================================================


// ===== CREATE NAMESPACE =============================

var DM = {
    user_id: 0,
    api_loaded: false,
    model_list: ["dance", "role", "skill_level", "activity", "goal"],
    model_list_list: ["dance_list", "role_list", "skill_level_list", "activity_list", "goal_list"],
};

// document.write("test for user ID: " + DM.user_id);


// ===== AJAX POST ====================================

function sendPost(item, url) {
    var form_data = new FormData();

    for (var key in item) {
        form_data.append(key, item[key]);
    }

    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.send(form_data);
}


// ===== INIT =========================================

function getAppStatus() {
    // API call for profile first, to get user_id
    var request = new XMLHttpRequest();
    request.open("GET", "/api_app_status/");

    //For pre html5 browsers use onstatuschanged
    request.onloadend = function (e) {
        var json_string = e.currentTarget.responseText;
        var data = JSON.parse(json_string);
        loadNamespace(data);
    };
    request.send();
}

function loadNamespace(data) {
    DM.user_profile = data["user_profile"];
    DM.user_suburbs = data["user_suburbs"];
    DM.user_dances = data["user_dances"];

    DM.user_id = DM.user_profile[0]["id"];

    DM.dance_list = data["dances"];
    DM.role_list = data["roles"];
    DM.skill_level_list = data["skill_levels"];
    DM.activity_list = data["activities"];
    DM.goal_list = data["goals"];
    DM.city_list = data["cities"];
    DM.suburb_list = data["suburbs"];

    DM.all_dance_prefs = data["all_dance_prefs"];

    DM.api_loaded = true;
}

function drawApp() {
    if (!DM.api_loaded) {
        setTimeout(drawApp, 10)
    } else {
        drawProfile();
        drawUserPrefs();
        drawUserSuburbs();
        drawFilter();
        addSortListeners();
    }
}

function init() {
    getAppStatus();
    drawApp();
}

document.addEventListener("DOMContentLoaded", init);
