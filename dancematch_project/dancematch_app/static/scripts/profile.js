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

    // TODO pull these out?
    drawPrefItems(DM.user_dances);
    drawSuburbs(DM.user_suburbs);
}


// ===== DRAW USER LOCATION INFO ======================

// TODO finish
function drawSuburbChooser() {
    var suburb_div = document.getElementById("suburbs");
    var suburb_list = DM.suburb_list;
    for (var i = 0; i < suburb_list.length; i++) {
        // check if ul for hub
        if (suburb_list[i].hub_id) {

        }

        var label = document.createElement("label");
        label.setAttribute("for", suburb_list[i].id);
        var checkbox = document.createElement("checkbox");
        checkbox.setAttribute("name", suburb_list[i].id);
        suburb_div.appendChild(label);
        suburb_div.appendChild(checkbox);
    }
}

function drawSuburbs(data) {
    var suburb_div = document.getElementById("suburb_list");
    var hubs = suburb_div.getElementsByTagName("ul");
    // dict[1] = ul with data-id 1
    var hub_ids = getHubIDs(hubs);
    console.log("hub_ids: " + hub_ids);
    console.log("drawSuburb data: " + data);

    for (var i = 0; i < data.length; i++) {
        var pref_suburb = data[i];
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
    drawSuburbChooser();
    // addSuburbListener();
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

// TODO fix event listener
function addSuburbListener() {
    var location_div = document.getElementById("location");
    var show_button = location_div.getElementsByClassName("edit_location")[0];
    show_button.addEventListener("click", function(e) {
        location_div.getElementById("choose_suburbs").classList.toggle("hide");
    });
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
        // console.log("DM[models[i]: " + DM[models[i]]);
        //drawDropdown(parent.getElementsByClassName(model_lists[i])[0],
        //        window.models[model_lists[i]], "name", "id", current_pref[models[i]]);
        drawDropdown(parent.getElementsByClassName(model_lists[i])[0],
            DM[model_lists[i]], "name", "id", current_pref[models[i]]);

    }
    parent.getElementsByClassName("notes_textarea")[0].innerHTML = current_pref.notes;
}

function drawPrefList(parent, template, data) {
    var sorted_data = DM.user_dances.sort(sortResults("dance"));

    for (var i = 0; i < sorted_data.length; i++) {
        var current_pref = sorted_data[i];

        // Draw pref only if user id matches current user
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

        var toggle_button = clone.getElementsByClassName("edit_toggle")[0];
        addToggleListener(toggle_button);

        var delete_button = clone.getElementsByClassName("delete")[0];
        addDeletePrefListener(delete_button);

        parent.appendChild(clone);

    }
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