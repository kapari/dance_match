// ===== MAIN =========================================
// ====================================================


// ===== CREATE NAMESPACE =============================

// var models = {};

var DM = {
    user_id: 0,
    // api_counter: 0,
    api_loaded: false,
    model_list: ["dance", "role", "skill_level", "activity", "goal"],
    model_list_list: ["dance_list", "role_list", "skill_level_list", "activity_list", "goal_list"],
    // profile_data: [],
    // all_dance_prefs: [],
    // suburb_data: []
};

document.write("test for user ID: " + DM.user_id);


// ===== HANDLE MODEL APIS ============================

//function waitForData(function_name) {
//    if (!DM.api_loaded) {
//        setTimeout(function_name, 50);
//        console.log("loading...");
//        if (DM.user_id != 0) {
//            DM.api_loaded = true;
//        }
//    }
//}

// REST API call to get JSON data
// currently for profile_data, all_dance_prefs and suburb_data
//function ApiCall(url, function_name, save_name) {
//    var request = new XMLHttpRequest();
//    request.open("GET", url);
//
//    //For pre html5 browsers use onstatuschanged
//    request.onloadend = function (e) {
//        var json_string = e.currentTarget.responseText;
//        var data = JSON.parse(json_string);
//        DM[save_name] = data;
//        function_name(data, DM.user_id);
//    };
//    request.send();
//}

//// TODO: wrap all api calls together
//function modelApi(object_type) {
//    // get list of e.g. dances for dropdown
//    var url = "/api_" + object_type + "/";
//    var request = new XMLHttpRequest();
//    request.open("GET", url);
//    // console.log(request);
//
//    //For pre html5 browsers use onstatuschanged
//    request.onloadend = function (e) {
//        var json_string = e.currentTarget.responseText;
//        var data = JSON.parse(json_string);
//        window.models[object_type] = data;
//        DM[object_type] = data;
//        DM.api_counter++;
//        // console.log(object_type + ": " + api_counter);
//        // console.log(model_list.length);
//        if (DM.api_counter == model_list.length) {
//            DM.api_loaded = true;
//        }
//    };
//    request.send();
//}
//
//// TODO wrap in init function
//var model_list = DM.model_list_list;
//for (var i = 0; i < model_list.length; i++) {
//    modelApi(model_list[i]);
//}


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

//document.addEventListener("DOMContentLoaded", function(e) {
//    // API call for profile first, to get user_id
//    var request = new XMLHttpRequest();
//    request.open("GET", "/api_profile/");
//
//    //For pre html5 browsers use onstatuschanged
//    request.onloadend = function (e) {
//        var json_string = e.currentTarget.responseText;
//        var data = JSON.parse(json_string);
//        DM.profile_data = data;
//        drawProfile(data);
//    };
//    request.send();
//});