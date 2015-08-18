// ===== PROFILE VIEW ================================
// ===================================================


// ===== DRAW USER PROFILE INFO =======================

function drawProfile(data) {
    var profile = document.getElementById("profile");
    // only one dict in list
    var profile_data = data[0];
    DM.user_id = profile_data["id"];
    var header = document.getElementById("dancer_name");
    header.innerHTML = profile_data["first_name"] + " " + profile_data["last_name"];

    profile.getElementsByClassName("username")[0].innerText = profile_data["username"];
    profile.getElementsByClassName("first_name")[0].innerText = profile_data["first_name"];
    profile.getElementsByClassName("last_name")[0].innerText = profile_data["last_name"];
    profile.getElementsByClassName("bio")[0].innerText = profile_data["bio"];
    profile.getElementsByClassName("profile_img")[0].setAttribute('src', profile_data["profile_img"]);

    // fill & hide edit fields
    var edit_div = profile.getElementsByClassName("edit")[0];
    edit_div.classList.add("hide");
    profile.getElementsByClassName('edit_field')[0].value = profile_data["first_name"];
    profile.getElementsByClassName('edit_field')[1].value = profile_data["last_name"];
    profile.getElementsByClassName('edit_field')[2].value = profile_data["bio"];

    addProfileListeners();

    toggle_button = profile.getElementsByClassName("edit_toggle")[0];
    addToggleListener(toggle_button);

    // TODO pull these out; have them wait independently
    // Wait until have user_id before drawing others
    ApiCall("/api_dance_prefs/", drawPrefItems, "pref_data");
    ApiCall("/api_suburbs/", drawSuburbs, "suburb_data");
}


// ===== DRAW USER LOCATION INFO ======================

function drawSuburbs(data, user_id) {
    var suburb_div = document.getElementById("suburbs");
    var hubs = suburb_div.getElementsByTagName("ul");
    // dict[1] = ul with data-id 1
    var hub_ids = {};
    for (i = 0; i < hubs.length; i++) {
        var hub_id = hubs[i].getAttribute("data-id");
        hub_ids[hub_id] = hubs[i];
    }
    for (i = 0; i < data.length; i++) {
        var pref_suburb = data[i];
        if (pref_suburb["user_id"] == DM.user_id) {
            // check if ul for each city hub
            var current_hub_id = pref_suburb["hub_id"];
            if (!(current_hub_id in hub_ids)) {
                var hub_ul = document.createElement("ul");
                hub_ul.setAttribute("data-id", current_hub_id);
                hub_ul.innerHTML = pref_suburb["hub_name"] + " Area";
                hub_ids[current_hub_id] = hub_ul;
                suburb_div.appendChild(hub_ul);
            }
            // populate ul with corresponding suburb li
            var suburb = document.createElement("li");
            suburb.setAttribute('data-id', pref_suburb["id"]);
            suburb.innerHTML = pref_suburb["sub_name"];
            var current_hub = hub_ids[current_hub_id];
            current_hub.appendChild(suburb);
        }
    }
}


// ===== ADD LISTENERS ================================

function addProfileListeners() {
    var profile = document.getElementById("profile");
    var edit_fields = profile.getElementsByClassName('edit_field');
    var update = {"user_id": DM.user_id};

    for (i = 0; i < edit_fields.length; i++) {
        current_field = edit_fields[i];
        current_field.addEventListener("change", function(e) {
            var value = e.target.value;
            var field_name = e.target.name;
            update[field_name] = value;
            profile.getElementsByClassName(field_name)[0].innerText = value;

            sendPost(update, "/update_profile/")
        });
    }
}


// ===== DRAW USER DANCE PREFS ========================

// (also used on search page)
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


// ===== ADD LISTENERS: DANCE PREF EDIT & AUTO UPDATE =

function addPrefListeners(parent_id) {
    var pref_list = document.getElementById(parent_id);
    var edit_fields = pref_list.getElementsByClassName("edit_field");
    for (var i = 0; i < edit_fields.length; i++) {
        var current_field = edit_fields[i];
        current_field.addEventListener("change", onPrefUpdate);
    }
}

function addToggleListener(button) {
    button.addEventListener("click", function(e) {
        toggleReadEdit(button);
    });
}

function toggleReadEdit(button) {
    var pref_li = button.parentElement.parentElement;
    var edit_div = pref_li.getElementsByClassName("edit")[0];
    var read_div = pref_li.getElementsByClassName("read")[0];
    edit_div.classList.toggle("hide");
    read_div.classList.toggle("hide");

    var del_button = pref_li.getElementsByClassName("delete")[0];
    if (del_button) {
        del_button.classList.toggle("hide");
    }

    button.classList.toggle("show_edit");
    if (button.classList.contains("show_edit")) {
        button.innerText = "Save";
    } else {
        button.innerText = "Edit";
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


// ===== CREATE NEW PREF ==============================

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


// ===== DELETE PREF ==================================

// TODO delete pref
