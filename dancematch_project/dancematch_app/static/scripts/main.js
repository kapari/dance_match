
//var user_id = {{ user.id }}
// var dancer_id = {{ user.dancer.id }}
var models = {};

// TODO: finish implementing namespace
var DM = {
    user_id: 0,
    model_list: ["dance", "role", "skill_level", "activity", "goal"],
    model_list_list: ["dance_list", "role_list", "skill_level_list", "activity_list", "goal_list"],
    profile_data: [],
    pref_data: [],
    suburb_data: [],
    sort_state: {"name_or_level": "up or down"}
//        model: {
//            items: []
//        }
};

document.write("test for user ID: " + DM.user_id);
// Draw Loaded Data


function drawDropdown(select, data, name_field, id_field, selected) {
    for (var i = 0; i < data.length; i++) {
        var option = document.createElement('option');
        option.innerHTML = data[i][name_field];
        option.setAttribute("value", data[i][id_field]);
        if (data[i][name_field] == selected) {
            option.setAttribute("selected", "selected");
        }
        select.appendChild(option);
    }
}


function drawPrefRead(parent, current_pref) {
    var models = DM.model_list;
    for (var i = 0; i < models.length; i++) {
        // console.log(models[i]);
        parent.getElementsByClassName(models[i])[0].innerHTML = current_pref[models[i]];
    }
    parent.getElementsByClassName("notes")[0].innerHTML = current_pref.notes;
}


function drawPrefEdit(parent, current_pref) {
    var models = DM.model_list;
    var model_lists = DM.model_list_list;
    for (var i = 0; i < models.length; i++) {
        drawDropdown(parent.getElementsByClassName(model_lists[i])[0],
                window.models[model_lists[i]], "name", "id", current_pref[models[i]]);
    }
    parent.getElementsByClassName("notes_textarea")[0].innerHTML = current_pref.notes;
}


function drawPrefList(parent, template, data, user_id) {
    var sorted_data = data.sort(sortResults("dance"));

    for (var i = 0; i < sorted_data.length; i++) {
        var current_pref = sorted_data[i];

        // Draw pref only if user id matches current user
        if (!user_id || current_pref.user_id == user_id) {
            // console.log("user_id " + user_id);
            var clone = template.cloneNode(true);
            clone.classList.remove("template");
            clone.setAttribute("data-id", current_pref.id);

            // Read-only div
            drawPrefRead(clone, current_pref);

            // Edit div
            var edit_div = clone.getElementsByClassName("edit")[0];
            edit_div.classList.add("hide");
            drawPrefEdit(clone, current_pref);

            toggle_button = clone.getElementsByClassName("edit_toggle")[0];
            addToggleListener(toggle_button);

            parent.appendChild(clone);
        }
    }
}


function drawPrefItems(data) {
    var user_id = DM.user_id;
    var pl = document.getElementById("pref_list");
    var template = pl.getElementsByClassName("template")[0];

    drawPrefList(pl, template, data, user_id);
    addPrefListeners("pref_list");
    drawResultView();

}


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

function addPrefListeners(parent_id) {
    var pref_list = document.getElementById(parent_id);
    var edit_fields = pref_list.getElementsByClassName("edit_field");
    for (var i = 0; i < edit_fields.length; i++) {
        var current_field = edit_fields[i];
        current_field.addEventListener("change", onPrefUpdate);
    }
}


function updateReadOnly(value, model) {
    var option_list = window.models[model];
    var option_count = option_list.length;
    var text = "NOPE";
    for (var i = 0; i < option_count; i++) {
        var option = option_list[i];
        if (option.id == value) {
            text = option.name;
            break;
        }
    }
    return text;
}

// Show/hide
function addToggleListener(button) {
    button.addEventListener("click", function(e) {
        var pref_li = button.parentElement.parentElement;
        var edit_div = pref_li.getElementsByClassName("edit")[0];
        var read_div = pref_li.getElementsByClassName("read")[0];
        var del_button = pref_li.getElementsByClassName("delete")[0];
        edit_div.classList.toggle("hide");
        read_div.classList.toggle("hide");
        del_button.classList.toggle("hide");
        button.classList.toggle("show_edit");
        if (button.classList.contains("show_edit")) {
            button.innerText = "Save";
        } else {
            button.innerText = "Edit";
        }
    });
}

function waitForData(function_name) {
    if (!api_loaded) {
        setTimeout(function_name, 100);
        console.log("loading...");
    }
}

// AJAX POST
function sendPost(item, url) {
    var form_data = new FormData();

    for (var key in item) {
        form_data.append(key, item[key]);
    }

    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.send(form_data);
}

// TODO: wrap all api calls together
var api_counter = 0;
var api_loaded = false;
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
        api_counter++;
        // console.log(object_type + ": " + api_counter);
        // console.log(model_list.length);
        if (api_counter == model_list.length) {
            api_loaded = true;
        }
    };
    request.send();
}


// TODO: run on button click; break into smaller functions
function newPref() {
    waitForData(newPref);

    var parent = document.getElementById("new_pref");
    var template = document.getElementsByClassName("template")[0];
    var clone = template.cloneNode(true);

    var btn_div = parent.getElementsByClassName("btn_div")[0];
    clone.classList.remove("template");
    parent.insertBefore(clone, btn_div);

    var new_pref_id = 0;
    var new_pref = {"pref_id": new_pref_id,
                    "dance": 1,
                    "role": 1,
                    "skill_level": 1,
                    "activity": 1,
                    "goal": 1,
                    "notes": ''
                    };

    drawPrefRead(parent, new_pref);
    drawPrefEdit(parent, new_pref);

    // TODO: fix buttons...
    var button = parent.getElementsByClassName("save_pref")[0];
    button.addEventListener("click", function(e) {
        sendPost(new_pref, "/update_pref/")
    });
    var cancel_btn = parent.getElementsByClassName("cancel_pref")[0];
    cancel_btn.addEventListener("click", function(e) {
        // div.classList.add("hide");
    });
}


// END RESULTS VIEW -------------------------


// BEGIN WEB REST API CALL TO GET JSON DATA
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


var model_list = DM.model_list_list;
for (var i = 0; i < model_list.length; i++) {
    modelApi(model_list[i]);
}


function viewListener() {

    //ApiCall("/api_profile/", drawProfile, "profile_data");
    //if (api_loaded) {
    //    newPref(user_id);
    //} else {
    //    setTimeout(function(){
    //        newPref(user_id)
    //    }, 5000);
    //}
    //while (!api_loaded) {
    //    console.log("waiting...");
    //}
    newPref();
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

// TODO: Init: create namespace, gather data, draw things, add listeners
