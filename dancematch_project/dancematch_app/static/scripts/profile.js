// ===== PROFILE VIEW ================================
// ===================================================


// ===== DRAW USER PROFILE INFO =======================

function drawProfile() {
    var profile_data = DM.user_profile[0];
    var profile = document.getElementById("profile");
    // only one dict in list
    var header = document.getElementById("dancer_name");
    header.innerHTML = profile_data["first_name"] + " " + profile_data["last_name"];

    profile.getElementsByClassName("username")[0].innerText = profile_data["username"];
    //profile.getElementsByClassName("first_name")[0].innerText = profile_data["first_name"];
    //profile.getElementsByClassName("last_name")[0].innerText = profile_data["last_name"];
    profile.getElementsByClassName("bio")[0].innerText = profile_data["bio"];
    profile.getElementsByClassName("profile_img")[0].setAttribute('src', profile_data["profile_img"]);

    // fill & hide edit fields
    var edit_div = profile.getElementsByClassName("edit")[0];
    edit_div.classList.add("hide");
    profile.getElementsByClassName('edit_field')[0].value = profile_data["first_name"];
    profile.getElementsByClassName('edit_field')[1].value = profile_data["last_name"];
    profile.getElementsByClassName('edit_field')[2].value = profile_data["bio"];

    addProfileListeners();

    var toggle_button = profile.getElementsByClassName("edit_toggle")[0];
    addToggleListener(toggle_button);
}


// ===== DRAW USER LOCATION INFO ======================

// TODO refactor
function drawUserSuburbs() {
    var data = DM.suburb_list;
    var suburb_div = document.getElementById("suburb_list");
    var hubs = suburb_div.getElementsByTagName("ul");
    // dict[1] = ul with data-id 1
    var hub_ids = getHubIDs(hubs);
    //console.log("hub_ids: " + hub_ids);
    //console.log("drawSuburb data: " + data);

    for (var i = 0; i < data.length; i++) {
        var current_suburb = data[i];

        // check if ul for each city hub
        var current_hub_id = current_suburb["hub_id"];
        if (!(current_hub_id in hub_ids)) {
            var hub_ul = document.createElement("ul");
            hub_ul.setAttribute("data-id", current_hub_id);
            hub_ul.innerHTML = current_suburb["hub_name"] + " Area";
            hub_ids[current_hub_id] = hub_ul;
            suburb_div.appendChild(hub_ul);
        }

        // populate ul with corresponding suburb li
        var suburb = document.createElement("li");
        suburb.setAttribute('data-id', current_suburb["sub_id"]);

        // Create labels and checkboxes
        var label = document.createElement("label");
        label.setAttribute("for", current_suburb.sub_id);
        label.innerText = current_suburb["sub_name"];
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", current_suburb.sub_id);

        // Check box if user selected
        if (current_suburb.selected) {
            checkbox.setAttribute("checked", "true");
            suburb.classList.add("checked");
        } else {
            suburb.classList.add("hide");
        }

        suburb.appendChild(checkbox);
        suburb.appendChild(label);

        var current_hub = hub_ids[current_hub_id];
        current_hub.appendChild(suburb);
    }
    addSuburbToggleListener();
    addSuburbUpdateListeners(suburb_div);
}

function getHubIDs(hubs) {
    var hub_ids = {};
    for (var i = 0; i < hubs.length; i++) {
        var hub_id = hubs[i].getAttribute("data-id");
        hub_ids[hub_id] = hubs[i];
    }
    return hub_ids
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

function toggleEditSuburbs() {
    var location_div = document.getElementById("suburbs");
    var toggle_button = location_div.getElementsByClassName("suburb_toggle")[0];
    toggle_button.classList.toggle("edit_view");
    toggle_button.classList.toggle("save");


    if (toggle_button.classList.contains("edit_view")) {
        toggle_button.innerText = "Save Locations";
    } else {
        toggle_button.innerText = "Edit Locations";
    }

    var sub_list = document.getElementById("suburb_list");
    sub_list.classList.toggle("read");

    var all_suburbs = sub_list.getElementsByTagName("li");
    for (var i = 0; i < all_suburbs.length; i++) {
        if (!(all_suburbs[i].classList.contains("checked"))) {
            all_suburbs[i].classList.toggle("hide");
        }
    }
}

function addSuburbToggleListener() {
    var location_div = document.getElementById("suburbs");
    var toggle_button = location_div.getElementsByClassName("suburb_toggle")[0];
    toggle_button.addEventListener("click", toggleEditSuburbs);
}

function onSuburbUpdate(e) {
    var suburb_id = e.target.name;
    var suburb_li = e.target.parentElement;
    var action = "NONE";

    suburb_li.classList.toggle("checked");
    if (suburb_li.classList.contains("checked")) {
        action = "SAVE";
    } else {
        action = "DELETE";
    }
    var update = {"user_id": DM.user_id,
                  "sub_id": suburb_id,
                  "action": action};
    console.log(update);
    sendPost(update, "/update_suburb/");
}

function addSuburbUpdateListeners(parent) {
    var suburb_checkboxes = parent.getElementsByTagName("input");
    for (var i = 0; i < suburb_checkboxes.length; i++) {
        var current_checkbox = suburb_checkboxes[i];
        current_checkbox.addEventListener("change", onSuburbUpdate);
    }
}

// ===== DRAW USER DANCE PREFS ========================

// (also used on search page)
function drawDropdown(select, data, selected) {
    for (var i = 0; i < data.length; i++) {
        var option = document.createElement('option');
        option.innerHTML = data[i]["name"];
        option.setAttribute("value", data[i]["id"]);
        if (data[i]["name"] == selected) {
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
        var current_select = parent.getElementsByClassName(model_lists[i])[0];
        var model_data = DM[model_lists[i]];
        drawDropdown(current_select, model_data, current_pref[models[i]]);
    }
    parent.getElementsByClassName("notes_textarea")[0].innerHTML = current_pref.notes;
}

function drawUserPrefs() {
    var pl = document.getElementById("pref_list");
    var ul = pl.getElementsByTagName("ul")[0];
    var template = pl.getElementsByClassName("template")[0];
    var sorted_data = DM.user_dances.sort(sortResults("dance"));

    for (var i = 0; i < sorted_data.length; i++) {
        var current_pref = sorted_data[i];
        var clone = template.cloneNode(true);
        clone.classList.remove("template");
        clone.setAttribute("data-id", current_pref.id);

        // Read-only div
        drawPrefRead(clone, current_pref);

        // Edit div
        var edit_div = clone.getElementsByClassName("edit")[0];
        edit_div.classList.add("hide");
        drawPrefEdit(clone, current_pref);

        var toggle_button = clone.getElementsByClassName("edit_toggle")[0];
        addToggleListener(toggle_button);

        var delete_button = clone.getElementsByClassName("delete")[0];
        addDeletePrefListener(delete_button);

        ul.appendChild(clone);
    }
    addPrefListeners("pref_list");
}


// ===== ADD LISTENERS: DANCE PREF EDIT & OPTIMISTIC UPDATE

function addPrefListeners(parent_id) {
    var pref_list = document.getElementById(parent_id);
    var edit_fields = pref_list.getElementsByClassName("edit_field");
    for (var i = 0; i < edit_fields.length; i++) {
        var current_field = edit_fields[i];
        current_field.addEventListener("change", onPrefUpdate);
    }
}

function addDeletePrefListener(button) {
    button.addEventListener("click", onPrefDelete);
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
    button.classList.toggle("save");

    if (button.classList.contains("show_edit")) {
        button.innerText = "Save";
    } else {
        button.innerText = "Edit";
    }
}

function updateReadOnly(value, model) {
    var option_list = DM[model];
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


// ===== CREATE/UPDATE PREF ===========================

function onPrefUpdate(e) {
    var group_div = e.target.parentElement;
    var pref_id_div = group_div.parentElement;
    var pref_id = pref_id_div.getAttribute("data-id");

    var update = {"user_id": DM.user_id,
                  "pref_id": pref_id,
                  "action": "SAVE"};
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

// TODO: run on button click; break into smaller functions
function newPref() {
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
}


// ===== DELETE PREF ==================================

function onPrefDelete(e) {
    var group_div = e.target.parentElement;
    var pref_id_div = group_div.parentElement;
    var pref_id = pref_id_div.getAttribute("data-id");

    var delete_pref = {"user_id": DM.user_id,
                  "pref_id": pref_id,
                  "action": "DELETE"};
    console.log("delete_pref: " + delete_pref);
    hideDeleted(pref_id_div);
    sendPost(delete_pref, "/update_pref/");
}

function hideDeleted(pref_li) {
    pref_li.classList.add("hide");
}