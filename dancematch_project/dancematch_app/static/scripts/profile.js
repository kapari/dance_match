// ===== PROFILE VIEW =================================
// ====================================================


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
