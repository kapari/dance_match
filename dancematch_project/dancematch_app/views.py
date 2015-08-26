from django.shortcuts import render, get_object_or_404, get_list_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
# from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User


from .models import Dancer, Dance, Day, Time, Venue, PreferredVenue, PreferredSuburb, MajorCity, Suburb, DancePrefs, SkillLevel, Goals, Activity, DanceRole

import json


def index(request):
    all_dancers = Dancer.objects.all()
    all_prefs = DancePrefs.objects.all()
    template = loader.get_template('index.html')
    context = RequestContext(request, {
                             'all_dancers': all_dancers,
                             'all_prefs': all_prefs,
                             })
    return HttpResponse(template.render(context))


def login_view(request):
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect("/main/")

    return render(request, 'login.html', {})


def register_view(request):
    if request.POST:
        user = User()
        user.username = request.POST['username']
        user.email = request.POST['username']
        user.first_name = request.POST['first_name']
        user.last_name = request.POST['last_name']
        user.set_password(request.POST['password'])
        user.save()

        dancer = Dancer()
        dancer.user = user
        dancer.save()

        return HttpResponseRedirect("/login/")

    return render(request, 'register.html', {})


def profile(request, dancer_id):
    # Kevin's preferred method: less reliant on builtin functions; two steps
    # filtered_dancer_list = Question.objects.filter(id=dancer_id)
    # dancer = filtered_dancer_list[0]
    dancer = get_object_or_404(Dancer, pk=dancer_id)
    # dance_prefs = get_list_or_404(DancePrefs, dancer=dancer)
    dance_prefs = DancePrefs.objects.filter(dancer=dancer)
    return render(request, 'profile.html', {'dancer': dancer,
                                            'dance_prefs': dance_prefs,
                                            })

def dances(request):
    all_dances = Dance.objects.all()
    template = loader.get_template('dances.html')
    context = RequestContext(request, {
        'all_dances': all_dances,
    })
    return HttpResponse(template.render(context))

# Not in use?
def edit_profile(request, dancer_id):
    dancer = get_object_or_404(Dancer, pk=dancer_id)
    dance_prefs = DancePrefs.objects.filter(dancer=dancer)
    if request.POST:
        print(request.POST)
        dancer.name = request.POST["name"]
        dancer.email = request.POST["email"]
        dancer.bio = request.POST["bio"]
        dancer.save()
        return HttpResponseRedirect("/profile/" + str(dancer.id) + "/")

    return render(request, 'edit.html', {'dancer': dancer,
                                         'dance_prefs': dance_prefs,
                                         })


def edit_dance(request, user_id, dance_pref_id):
    user = get_object_or_404(User, pk=user_id)
    dancer = get_object_or_404(Dancer, user=user)
    dance_pref_list = DancePrefs.objects.filter(id=dance_pref_id)
    if len(dance_pref_list) > 0:
        dance_pref = dance_pref_list[0]
    else:
        dance_pref = DancePrefs()

    dances = Dance.objects.order_by("name")
    roles = DanceRole.objects.all()
    activities = Activity.objects.all()
    goals = Goals.objects.all()
    skill_levels = SkillLevel.objects.all()
    if request.POST:
        print(request.POST)
        dance_id = request.POST.get("dance")
        dance = get_object_or_404(Dance, pk=dance_id)
        dance_pref.dance = dance

        role_id = request.POST.get("role")
        role = get_object_or_404(DanceRole, pk=role_id)
        dance_pref.role = role

        skill_level_id = request.POST.get("skill_level")
        skill_level = SkillLevel.objects.filter(pk=skill_level_id)[0]
        dance_pref.skill_level = skill_level

        activity_id = request.POST.get("activity")
        activity = Activity.objects.filter(pk=activity_id)[0]
        dance_pref.activity = activity

        goal_id = request.POST.get("goal")
        goal = Goals.objects.filter(pk=goal_id)[0]
        dance_pref.goal = goal

        dance_pref.notes = request.POST["notes"]

        dance_pref.dancer = dancer
        dance_pref.save()

        return HttpResponseRedirect("/main/")

    return render(request, 'edit_dance.html', {'dancer': dancer,
                                               'dance_pref': dance_pref,
                                               'dances': dances,
                                               'roles': roles,
                                               'activities': activities,
                                               'goals': goals,
                                               'skill_levels': skill_levels,
                                               })


def results(request):
    all_prefs = DancePrefs.objects.all()
    template = loader.get_template('results.html')
    context = RequestContext(request, {'all_prefs': all_prefs, })
    return HttpResponse(template.render(context))


def api_dance_prefs(request):
    dance_pref_list = DancePrefs.objects.all()
    output = []
    for pref in dance_pref_list:
        prefdata = {}
        prefdata["id"] = pref.id
        prefdata["user_id"] = pref.dancer.user.id
        prefdata["user"] = pref.dancer.user.username
        prefdata["first_name"] = pref.dancer.user.first_name
        prefdata["last_name"] = pref.dancer.user.last_name
        prefdata["dance_id"] = pref.dance.id
        prefdata["dance"] = pref.dance.name
        prefdata["role_id"] = pref.role.id
        prefdata["role"] = pref.role.name
        prefdata["skill_level_id"] = pref.skill_level.id
        prefdata["skill_level"] = pref.skill_level.name
        prefdata["activity_id"] = pref.activity.id
        prefdata["activity"] = pref.activity.name
        prefdata["goal_id"] = pref.goal.id
        prefdata["goal"] = pref.goal.name
        prefdata["notes"] = pref.notes
        prefdata["img_path"] = pref.dancer.img_path
        prefdata["suburbs"] = []

        dancer = get_object_or_404(Dancer, pk=pref.dancer.id)
        user_suburbs = PreferredSuburb.objects.filter(dancer=dancer)
        for pref_suburb in user_suburbs:
            subdata = {}
            subdata["id"] = pref_suburb.id
            subdata["sub_id"] = pref_suburb.suburb.id
            subdata["sub_name"] = pref_suburb.suburb.name
            subdata["hub_id"] = pref_suburb.suburb.hub.id
            subdata["hub"] = pref_suburb.suburb.hub.name
            prefdata["suburbs"].append(subdata)

        output.append(prefdata)
    json_data = json.dumps(output, indent=4)
    return HttpResponse(json_data, content_type='application/json')

def api_profile(request):
    user = request.user
    dancer = user.dancer
    output = []
    profile_data = {}
    profile_data["id"] = user.id
    profile_data["dancer_id"] = user.dancer.id
    profile_data["username"] = user.username
    profile_data["first_name"] = user.first_name
    profile_data["last_name"] = user.last_name
    profile_data["bio"] = dancer.bio
    profile_data["profile_img"] = dancer.img_path
    output.append(profile_data)
    json_data = json.dumps(output, indent=4)
    return HttpResponse(json_data, content_type='application/json')


def api_suburb_prefs(request):
    preferred_suburbs = PreferredSuburb.objects.all()
    output = []
    for pref_suburb in preferred_suburbs:
        subdata = {}
        subdata["user_id"] = pref_suburb.dancer.user.id
        subdata["id"] = pref_suburb.id
        subdata["sub_id"] = pref_suburb.suburb.id
        subdata["sub_name"] = pref_suburb.suburb.name
        subdata["hub_id"] = pref_suburb.suburb.hub.id
        subdata["hub_name"] = pref_suburb.suburb.hub.name
        output.append(subdata)
    json_data = json.dumps(output, indent=4)
    return HttpResponse(json_data, content_type='application/json')


# def api_pref_models(request):
#     dances = Dance.objects.order_by("name")
#     roles = DanceRole.objects.order_by("name")
#     activities = Activity.objects.order_by("name")
#     skill_levels = SkillLevel.objects.all()
#     goals = Goals.objects.all()


def api_dance_list(request):
    dances = Dance.objects.order_by("name")
    output = []
    for dance in dances:
        output.append({"name": dance.name, "id": dance.id})
    return HttpResponse(json.dumps(output, indent=4), content_type='application/json')

def api_role_list(request):
    roles = DanceRole.objects.order_by("name")
    output = []
    for role in roles:
        output.append({"name": role.name, "id": role.id})
    return HttpResponse(json.dumps(output, indent=4), content_type='application/json')

def api_activity_list(request):
    activities = Activity.objects.order_by("name")
    output = []
    for activity in activities:
        output.append({"name": activity.name, "id": activity.id})
    return HttpResponse(json.dumps(output, indent=4), content_type='application/json')

def api_skill_level_list(request):
    skill_levels = SkillLevel.objects.all()
    output = []
    for level in skill_levels:
        output.append({"name": level.name, "id": level.id})
    return HttpResponse(json.dumps(output, indent=4), content_type='application/json')

def api_goal_list(request):
    goals = Goals.objects.all()
    output = []
    for goal in goals:
        output.append({"name": goal.name, "id": goal.id})
    return HttpResponse(json.dumps(output, indent=4), content_type='application/json')

def api_suburbs(request):
    suburbs = Suburb.objects.all()
    output = []
    for suburb in suburbs:
        output.append({"name": suburb.name,
                       "id": suburb.id,
                       "hub_name": suburb.hub.name})
    return HttpResponse(json.dumps(output, indent=4), content_type='application/json')

def api_app_status(request):
    app_status = {}
    user = request.user
    dancer = user.dancer
    # dropdowns: dances, roles, skill levels, activity, goals, suburbs, cities
    # profiles/results: dancers, dance prefs, suburb prefs (not user)
    # user: dancer, dance prefs, suburb prefs
    # TODO: Other user profiles, venues, preferred venues

    # SIMPLE dropdown models:
    dances = Dance.objects.order_by("name")
    roles = DanceRole.objects.order_by("name")
    activities = Activity.objects.order_by("name")
    skill_levels = SkillLevel.objects.order_by("id")
    goals = Goals.objects.order_by("name")
    cities = MajorCity.objects.order_by("name")

    names = ["dances", "roles", "activities", "skill_levels", "goals", "cities"]
    all_object_lists = [dances, roles, activities, skill_levels, goals, cities]

    index = 0
    for object_list in all_object_lists:
        output = []
        for object in object_list:
            output.append({"name": object.name, "id": object.id})
        print("index: " + str(index))
        print(names[index])

        app_status[names[index]] = output
        index += 1

    # Suburb dropdown
    suburbs = Suburb.objects.order_by("name")
    user_suburb_prefs = PreferredSuburb.objects.filter(dancer=dancer)
    suburb_output = []
    for suburb in suburbs:
        selected = False
        for pref in user_suburb_prefs:
            if suburb.id == pref.suburb.id:
                selected = True
        suburb_output.append({"sub_name": suburb.name,
                   "sub_id": suburb.id,
                   "hub_name": suburb.hub.name,
                   "hub_id": suburb.hub.id,
                   "selected": selected
                   })
    app_status["suburbs"] = suburb_output

    # User Profile Data
    profile_output = []
    profile_data = {}
    profile_data["id"] = user.id
    profile_data["dancer_id"] = user.dancer.id
    profile_data["username"] = user.username
    profile_data["first_name"] = user.first_name
    profile_data["last_name"] = user.last_name
    profile_data["bio"] = dancer.bio
    profile_data["profile_img"] = dancer.img_path
    profile_output.append(profile_data)
    app_status["user_profile"] = profile_output

    # User Suburb Prefs NO LONGER NEEDED?
    suburb_prefs = PreferredSuburb.objects.filter(dancer=dancer)
    sub_pref_output = []
    for suburb_pref in suburb_prefs:
        subdata = {}
        subdata["id"] = suburb_pref.id
        subdata["sub_id"] = suburb_pref.suburb.id
        subdata["sub_name"] = suburb_pref.suburb.name
        subdata["hub_id"] = suburb_pref.suburb.hub.id
        subdata["hub_name"] = suburb_pref.suburb.hub.name
        sub_pref_output.append(subdata)
    app_status["user_suburbs"] = sub_pref_output

    # User Dance Prefs
    user_dance_prefs = DancePrefs.objects.filter(dancer=user.dancer)
    user_pref_output = []
    for pref in user_dance_prefs:
        prefdata = {}
        prefdata["id"] = pref.id
        prefdata["dance_id"] = pref.dance.id
        prefdata["dance"] = pref.dance.name
        prefdata["role_id"] = pref.role.id
        prefdata["role"] = pref.role.name
        prefdata["skill_level_id"] = pref.skill_level.id
        prefdata["skill_level"] = pref.skill_level.name
        prefdata["activity_id"] = pref.activity.id
        prefdata["activity"] = pref.activity.name
        prefdata["goal_id"] = pref.goal.id
        prefdata["goal"] = pref.goal.name
        prefdata["notes"] = pref.notes
        user_pref_output.append(prefdata)
    app_status["user_dances"] = user_pref_output


    # All Other Dance Prefs
    all_dance_prefs = DancePrefs.objects.all()
    pref_output = []
    for pref in all_dance_prefs:
        if pref.dancer.user != user:
            prefdata = {}
            prefdata["id"] = pref.id
            prefdata["user_id"] = pref.dancer.user.id
            prefdata["user"] = pref.dancer.user.username
            prefdata["first_name"] = pref.dancer.user.first_name
            prefdata["last_name"] = pref.dancer.user.last_name
            prefdata["email"] = pref.dancer.user.email
            prefdata["dance_id"] = pref.dance.id
            prefdata["dance"] = pref.dance.name
            prefdata["role_id"] = pref.role.id
            prefdata["role"] = pref.role.name
            prefdata["skill_level_id"] = pref.skill_level.id
            prefdata["skill_level"] = pref.skill_level.name
            prefdata["activity_id"] = pref.activity.id
            prefdata["activity"] = pref.activity.name
            prefdata["goal_id"] = pref.goal.id
            prefdata["goal"] = pref.goal.name
            prefdata["notes"] = pref.notes
            prefdata["img_path"] = pref.dancer.img_path
            prefdata["suburbs"] = []

            dancer = get_object_or_404(Dancer, pk=pref.dancer.id)
            user_suburbs = PreferredSuburb.objects.filter(dancer=dancer)
            for pref_suburb in user_suburbs:
                subdata = {}
                subdata["id"] = pref_suburb.id
                subdata["sub_id"] = pref_suburb.suburb.id
                subdata["sub_name"] = pref_suburb.suburb.name
                subdata["hub_id"] = pref_suburb.suburb.hub.id
                subdata["hub"] = pref_suburb.suburb.hub.name
                prefdata["suburbs"].append(subdata)

            pref_output.append(prefdata)
    app_status["all_dance_prefs"] = pref_output

    json_data = json.dumps(app_status, indent=4)
    return HttpResponse(json_data, content_type='application/json')


@login_required(login_url='/login/')
def main(request):
    print(request.user.id)
    template = loader.get_template('profile_ajax.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))

@csrf_exempt
def update_profile(request):
    if request.POST:
        print(request.POST)
        user_id = int(request.POST.get("user_id"))
        user = get_object_or_404(User, id=user_id)
        dancer = user.dancer
        if "first_name" in request.POST:
            user.first_name = request.POST.get("first_name")
        if "last_name" in request.POST:
            user.last_name = request.POST.get("last_name")
        if "bio" in request.POST:
            dancer.bio = request.POST.get("bio")

        user.save()
        dancer.save()

        return HttpResponseRedirect("/main/")

@csrf_exempt
def update_pref(request):
    if request.POST:
        print(request.POST)
        pref_id = int(request.POST.get("pref_id"))
        user_id = int(request.POST.get("user_id"))
        dance_pref_list = DancePrefs.objects.filter(id=pref_id)
        user = get_object_or_404(User, id=user_id)
        print(user)

        if len(dance_pref_list) > 0:
            dance_pref = dance_pref_list[0]
        else:
            dance_pref = DancePrefs()
            dance_pref.user = user
            dance_pref.dancer = user.dancer

        if request.POST["action"] == "DELETE":
            dance_pref.delete()
        else:
            if "role" in request.POST:
                role_id = int(request.POST.get("role"))
                role = get_object_or_404(DanceRole, pk=role_id)
                dance_pref.role = role

            if "dance" in request.POST:
                dance_id = int(request.POST.get("dance"))
                dance = get_object_or_404(Dance, pk=dance_id)
                dance_pref.dance = dance

            if "skill_level" in request.POST:
                skill_level_id = int(request.POST.get("skill_level"))
                if skill_level_id:
                    skill_level = SkillLevel.objects.filter(pk=skill_level_id)[0]
                    dance_pref.skill_level = skill_level

            if "activity" in request.POST:
                activity_id = int(request.POST.get("activity"))
                if activity_id:
                    activity = Activity.objects.filter(pk=activity_id)[0]
                    dance_pref.activity = activity

            if "goal" in request.POST:
                goal_id = int(request.POST.get("goal"))
                if goal_id:
                    goal = Goals.objects.filter(pk=goal_id)[0]
                    dance_pref.goal = goal

            if "notes" in request.POST:
                dance_pref.notes = request.POST["notes"]

            dance_pref.save()

        return HttpResponseRedirect("/main/")

@csrf_exempt
def update_suburb(request):
    if request.POST:
        user_id = int(request.POST.get("user_id"))
        user = get_object_or_404(User, id=user_id)
        dancer = user.dancer
        suburb_id = int(request.POST.get("sub_id"))
        suburb = Suburb.objects.filter(id=suburb_id)[0]
        filtered_pref_list = PreferredSuburb.objects.filter(dancer=dancer)
        chosen_pref = None

        for pref in filtered_pref_list:
            if pref.suburb.id == suburb_id:
                chosen_pref = pref
                break

        if request.POST["action"] == "DELETE":
            chosen_pref.delete()
        else:
            chosen_pref = PreferredSuburb()
            chosen_pref.dancer = dancer
            chosen_pref.suburb = suburb
            chosen_pref.save()
        return HttpResponseRedirect("/main/")

def img_upload(request):
    if request.POST:
        print(request.FILES)
        user_id = request.user.id
        user = get_object_or_404(User, id=user_id)
        dancer = user.dancer
        image = request.FILES['file']
        path = '/static/uploads/'+ str(user_id) + "_" + image.name
        with open("dancematch_app" + path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
            print(destination)
        dancer.img_path = path
        dancer.save()

        return HttpResponseRedirect("/main/")

    template = loader.get_template('upload.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))
