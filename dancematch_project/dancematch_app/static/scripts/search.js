// SEARCH VIEW -----------------------------

// To support arr.filter() in older browsers
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }
    return res;
  };
}


function drawResultView(data, user_id) {

    waitForData(drawResultView);
    drawFilter();
    addSortListeners();
    // drawResultList(data);
}


function drawResultList(data) {

    // check if sorted?
    // var sorted_data = data.sort(sortResults("first_name"));

    var results_table = document.getElementById("pref_results");
    var template = results_table.getElementsByClassName("template")[0];
    // empty list first and reattach template
    while (results_table.firstChild) {
        results_table.removeChild(results_table.firstChild);
    }
    results_table.appendChild(template);

    for (var i = 0; i < data.length; i++) {
        var clone = template.cloneNode(true);
        var current_pref = data[i];

        if (current_pref.user_id != DM.user_id) {
            drawResultData(current_pref, clone);

            // TODO show only suburbs that match current user's prefs
            drawResultLocation(current_pref, clone);

            results_table.appendChild(clone);
        }
    }
}

// TODO sort by name and level
function sortResults(criteria) {
    if (criteria == "skill_level") {
        criteria += "_id";
    }
    console.log(criteria);
    return function(a, b) {
        if (a[criteria] > b[criteria]) {
            return 1;
        } else if (a[criteria] < b[criteria]) {
            return -1;
        } else {
            return 0;
        }
    };
}


function filterResults(criteria_list, value_list) {
    return function(pref) {
        var keep = true;
        for (var i = 0; i < criteria_list.length; i++) {
            if (pref[criteria_list[i]] != value_list[i]) {
                keep = false;
            }
        }
        return keep;
    }
}


function drawResultData(current_pref, clone) {
    clone.classList.remove("template");
//  clone.classList.add("hide");

    clone.setAttribute("data-id", current_pref.id);
    clone.getElementsByClassName("thumb")[0].setAttribute('src', current_pref.img_path);
    clone.getElementsByClassName("dancer")[0].innerHTML = current_pref.first_name;
    clone.getElementsByClassName("dance")[0].innerHTML = current_pref.dance;
    clone.getElementsByClassName("dance")[0].setAttribute('data-id', current_pref.dance_id);
    clone.getElementsByClassName("role")[0].innerHTML = current_pref.role;
    clone.getElementsByClassName("skill_level")[0].innerHTML = current_pref.skill_level;
    clone.getElementsByClassName("goal")[0].innerHTML = current_pref.goal;
    clone.getElementsByClassName("notes")[0].innerHTML = current_pref.notes;
}


function drawResultLocation(current_pref, clone) {
    var location_cell = clone.getElementsByClassName("suburbs")[0];
    var suburb_list = current_pref.suburbs;

    if (suburb_list.length > 0) {
        console.log("suburb_list: " + suburb_list);
        for (var i = 0; i < suburb_list.length; i++) {
            // console.log(suburb_list[j].sub_name);
            var name_span = document.createElement("span");
            name_span.innerHTML += suburb_list[i].sub_name;
            location_cell.appendChild(name_span);
        }
    } else {
        location_cell.innerHTML += '';
    }
}


function drawFilter() {
    var parent = document.getElementById("search_fields");
    var filter_lists = ["dance_list", "role_list", "goal_list"];
    var default_selection = 1;
    for (var i = 0; i < filter_lists.length; i++) {
        var current_select = parent.getElementsByClassName(filter_lists[i])[0];
        drawDropdown(current_select, window.models[filter_lists[i]], "name", "id", default_selection);
        var property = filter_lists[i].split("_")[0];
        console.log(property);
        // addFilterListener(current_select, property);
    }
    addSearchListener();
}

//function addFilterListener(select_element, property) {
//    select_element.addEventListener("change", function(e) {
//        var value = e.target.value;
//        var data = DM.pref_data;
//        console.log("value: " + value);
//        console.log("property: " + property);
//
//        var property_list = [];
//        var value_list = [];
//        var filtered_data = data.filter(filterResults(["dance_id", "role_id"], [6, 1]));
//
//        drawResultList(filtered_data);
//    })
//}

function addSearchListener() {
    var parent = document.getElementById("search_fields");
    var search_button = parent.getElementsByClassName("search")[0];
    search_button.addEventListener("click", checkFilter);
}


function checkFilter() {
    var parent = document.getElementById("search_fields");
    var filter_lists = ["dance_list", "role_list", "goal_list"];
    var data = DM.pref_data;
    var property_list = [];
    var value_list = [];
    for (var i = 0; i < filter_lists.length; i++) {
        var current_select = parent.getElementsByClassName(filter_lists[i])[0];
        var property = filter_lists[i].split("_")[0] + "_id";
        var value = current_select.value;
        // allows optional goal
        if ((property == "goal_id") && (value == 1)) {
            console.log("Include any goal");
        } else {
            property_list.push(property);
            value_list.push(value);
        }
    }
    var filtered_data = data.filter(filterResults(property_list, value_list));

    var header = document.getElementById("results_header");
    var sorted = header.getElementsByClassName("sorted")[0];
    var sort_criteria = sorted.getAttribute("id");
    console.log("sort_criteria " + sort_criteria);

    sortFilteredList(filtered_data, sort_criteria);
}


function addSortListeners() {
    var header = document.getElementById("results_header");
    var sortable = header.getElementsByClassName("sortable");
    for (var i = 0; i < sortable.length; i++) {
        sortable[i].addEventListener("click", function(e) {
            header.getElementsByClassName("sorted")[0].classList.remove("sorted");
            console.log("e.target: " + e.target);
            console.log("e parent: " + e.target.parent);
            e.target.parentElement.classList.add("sorted");

            var header_id = e.target.parentElement.getAttribute("id");
            console.log("header_id: " + header_id);

            checkFilter();
        })
    }
}

function sortFilteredList(filtered_data, sort_criteria) {
    if (sort_criteria == "skill_level")  {
        sort_criteria = "skill_level_id"
    } else {
        sort_criteria = "first_name"
    }
    var sorted_data = filtered_data.sort(sortResults(sort_criteria));
    console.log("sort event");
    console.log("sorted: " + sorted_data);
    drawResultList(sorted_data);
}
