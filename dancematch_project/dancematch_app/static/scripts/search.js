// SEARCH VIEW -----------------------------

// TODO write filters: dance, role, goal
function filterBy(property, value) {
    return function(pref) {
        return pref[property + "_id"] == value;
    }
}

// TODO sort by name and level
function sortByName(a, b) {
    if (a.first_name > b.first_name) {
        return 1;
    } else if (a.first_name < b.first_name) {
        return -1;
    } else {
        return 0;
    }
}

function drawResults(data, user_id) {
    drawFilter();

    if (!api_loaded) {
        setTimeout(drawResults, 100);
        console.log("waiting for results...");
        return
    }

    var pl = document.getElementById("pref_results");
    var template = pl.getElementsByClassName("template")[0];

    data.sort(sortByName);

    for (var i = 0; i < data.length; i++) {
        var current_pref = data[i];

        if (current_pref.user_id != DM.user_id) {
            var clone = template.cloneNode(true);
            clone.classList.remove("template");
//                clone.classList.add("hide");

            clone.setAttribute("data-id", current_pref.id);

            clone.getElementsByClassName("thumb")[0].setAttribute('src', current_pref.img_path);
            clone.getElementsByClassName("dancer")[0].innerHTML = current_pref.first_name;
            clone.getElementsByClassName("dance")[0].innerHTML = current_pref.dance;
            clone.getElementsByClassName("dance")[0].setAttribute('data-id', current_pref.dance_id);
            clone.getElementsByClassName("role")[0].innerHTML = current_pref.role;
            clone.getElementsByClassName("skill_level")[0].innerHTML = current_pref.skill_level;
            clone.getElementsByClassName("goal")[0].innerHTML = current_pref.goal;
            clone.getElementsByClassName("notes")[0].innerHTML = current_pref.notes;

            // TODO show only suburbs that match current user's prefs
            var location_cell = clone.getElementsByClassName("suburbs")[0];
            var suburb_list = current_pref.suburbs;

            if (suburb_list.length > 0) {
                for (var j = 0; j < suburb_list.length; j++) {
                    // console.log(suburb_list[j].sub_name);
                    var name_span = document.createElement("span");
                    name_span.innerHTML += suburb_list[j].sub_name;
                    location_cell.appendChild(name_span);
                }
            } else {
                location_cell.innerHTML += '';
            }


            pl.appendChild(clone);
        }
    }
}

function drawFilter() {
    var parent = document.getElementById("search_fields");
    var filter_lists = ["dance_list", "role_list", "goal_list"];
    var default_selection = 1;
    for (i = 0; i < filter_lists.length; i++) {
        var current_select = parent.getElementsByClassName(filter_lists[i])[0];
        drawDropdown(current_select, window.models[filter_lists[i]], "name", "id", default_selection);
        var property = filter_lists[i].split("_")[0];
        console.log(property);
        addFilterListener(current_select, property);
    }
}

function addFilterListener(select_element, property) {
    select_element.addEventListener("change", function(e) {
        var value = e.target.value;
        console.log(value);
        console.log(property);
        // TODO: log filtering criteria
        redrawResults(property, value);
    })
}

// TODO: redraw results from filtered list
function redrawResults(property, value) {
    filterBy(property, value);
}