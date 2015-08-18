// ===== MAIN =========================================
// ====================================================


// ===== CREATE NAMESPACE =============================

var models = {};

var DM = {
    user_id: 0,
    api_counter: 0,
    api_loaded: false,
    model_list: ["dance", "role", "skill_level", "activity", "goal"],
    model_list_list: ["dance_list", "role_list", "skill_level_list", "activity_list", "goal_list"],
    profile_data: [],
    pref_data: [],
    suburb_data: []
    // TODO: combine profile, pref, and model data into dict
//        model: {
//            items: []
//        }
};

document.write("test for user ID: " + DM.user_id);


// ===== HANDLE MODEL APIS ============================

function waitForData(function_name) {
    if (!DM.api_loaded) {
        setTimeout(function_name, 50);
        console.log("loading...");
    }
}

// REST API call to get JSON data
function ApiCall(url, function_name, save_name) {
    var request = new XMLHttpRequest();
    request.open("GET", url);

    //For pre html5 browsers use onstatuschanged
    request.onloadend = function (e) {
        var json_string = e.currentTarget.responseText;
        var data = JSON.parse(json_string);
        DM[save_name] = data;
        function_name(data, DM.user_id);
    };
    request.send();
}

// TODO: wrap all api calls together
function modelApi(object_type) {
    // get list of e.g. dances for dropdown
    var url = "/api_" + object_type + "/";
    var request = new XMLHttpRequest();
    request.open("GET", url);
    // console.log(request);

    //For pre html5 browsers use onstatuschanged
    request.onloadend = function (e) {
        var json_string = e.currentTarget.responseText;
        var data = JSON.parse(json_string);
        window.models[object_type] = data;
        DM.api_counter++;
        // console.log(object_type + ": " + api_counter);
        // console.log(model_list.length);
        if (DM.api_counter == model_list.length) {
            DM.api_loaded = true;
        }
    };
    request.send();
}

// TODO wrap in init function
var model_list = DM.model_list_list;
for (var i = 0; i < model_list.length; i++) {
    modelApi(model_list[i]);
}


// ===== AJAX POST ====================================

function onPrefUpdate(e) {
    var group_div = e.target.parentElement;
    var pref_id_div = group_div.parentElement;
    var pref_id = pref_id_div.getAttribute("data-id");

    var update = {"user_id": DM.user_id,
                  "pref_id": pref_id};
    var value = e.target.value;
    var text = '';

    // Build update dict & Change values in read-only
    // TODO: loop
//                var models = DM.model_list;
//                var model_lists = DM.model_list_list;
//                for (i = 0; i < models.length; i++) {
//                    if (e.target.classList.contains(model_lists[i])) {
//                        update[models[i]] = value;
//                        text = updateReadOnly(value, model_lists[i]);
//                        pref_id_div.getElementsByClassName(models[i])[0].innerText = text;
//                }

    if (e.target.classList.contains("dance_list")) {
        update["dance"] = value;
        text = updateReadOnly(value, "dance_list");
        pref_id_div.getElementsByClassName("dance")[0].innerText = text;
    } else if (e.target.classList.contains("role_list")){
        update["role"] = value;
        text = updateReadOnly(value, "role_list");
        pref_id_div.getElementsByClassName("role")[0].innerText = text;
    } else if (e.target.classList.contains("skill_level_list")){
        update["skill_level"] = value;
        text = updateReadOnly(value, "skill_level_list");
        pref_id_div.getElementsByClassName("skill_level")[0].innerText = text;
    } else if (e.target.classList.contains("activity_list")){
        update["activity"] = value;
        text = updateReadOnly(value, "activity_list");
        pref_id_div.getElementsByClassName("activity")[0].innerText = text;
    } else if (e.target.classList.contains("goal_list")){
        update["goal"] = value;
        text = updateReadOnly(value, "goal_list");
        pref_id_div.getElementsByClassName("goal")[0].innerText = text;
    } else if (e.target.classList.contains("notes_textarea")){
        update["notes"] = value;
        pref_id_div.getElementsByClassName("notes")[0].innerText = value;
    }

    sendPost(update, "/update_pref/");
}

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

// TODO: Create Init: gather data, draw things, add listeners

// TODO refactor; move to init
function drawPrefItems(data) {
    var user_id = DM.user_id;
    var pl = document.getElementById("pref_list");
    var template = pl.getElementsByClassName("template")[0];

    drawPrefList(pl, template, data, user_id);
    addPrefListeners("pref_list");
    drawResultView();

}

document.addEventListener("DOMContentLoaded", function(e) {
    // API call for profile first, to get user_id
    var request = new XMLHttpRequest();
    request.open("GET", "/api_profile/");

    //For pre html5 browsers use onstatuschanged
    request.onloadend = function (e) {
        var json_string = e.currentTarget.responseText;
        var data = JSON.parse(json_string);
        DM.profile_data = data;
        drawProfile(data);
    };
    request.send();
});

