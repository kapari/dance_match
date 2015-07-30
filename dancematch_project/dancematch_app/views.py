from django.shortcuts import render, get_object_or_404, get_list_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User


from .models import Dancer, Dance, Day, Time, Location, DancePrefs, SkillLevel, Goals, Activity, DanceRole

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
                return HttpResponseRedirect("/profile_ajax/")

    return render(request, 'login.html', {})


def register_view(request):
    if request.POST:
        user = User()
        user.username = request.POST['username']
        user.email = request.POST['username']
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


def edit_profile(request, dancer_id):
    dancer = get_object_or_404(Dancer, pk=dancer_id)
    dance_prefs = DancePrefs.objects.filter(dancer=dancer)
    if request.POST:
        print(request.POST)
        dancer.name = request.POST["name"]
        dancer.email = request.POST["email"]
        dancer.bio = request.POST["bio"]
        dancer.active_member = request.POST.get("active_member", False)
        dancer.save()
        return HttpResponseRedirect("/profile/" + str(dancer.id) + "/")

    return render(request, 'edit.html', {'dancer': dancer,
                                         'dance_prefs': dance_prefs,
                                         })


def edit_dance(request, user_id, dance_pref_id):
    user = get_object_or_404(User, pk=user_id)
    print(user.id)
    dancer = get_object_or_404(Dancer, pk=user.id)
    print("dancer id: " + str(dancer.id))
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
        if skill_level_id:
            skill_level = SkillLevel.objects.filter(pk=skill_level_id)[0]
            dance_pref.skill_level = skill_level

        activity_id = request.POST.get("activity")
        if activity_id:
            activity = Activity.objects.filter(pk=activity_id)[0]
            dance_pref.activity = activity

        goal_id = request.POST.get("goal")
        if goal_id:
            goal = Goals.objects.filter(pk=goal_id)[0]
            dance_pref.goal = goal

        dance_pref.notes = request.POST["notes"]

        dance_pref.dancer = dancer
        dance_pref.save()

        return HttpResponseRedirect("/profile/" + str(dancer.user.id) + "/")

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
        prefdata["dancer_id"] = pref.dancer.user.id
        prefdata["dancer"] = pref.dancer.user.username
        prefdata["dance_id"] = pref.dance.id
        prefdata["dance"] = pref.dance.name
        prefdata["role_id"] = pref.role.id
        prefdata["role"] = pref.role.name
        if pref.skill_level:
            prefdata["skill_level_id"] = pref.skill_level.id
            prefdata["skill_level"] = pref.skill_level.name
        if pref.activity:
            prefdata["activity_id"] = pref.activity.id
            prefdata["activity"] = pref.activity.name
        if pref.goal:
            prefdata["goal_id"] = pref.goal.id
            prefdata["goal"] = pref.goal.name
        prefdata["notes"] = pref.notes
        output.append(prefdata)
    json_data = json.dumps(output, indent=4)
    return HttpResponse(json_data, content_type='application/json')

#
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
    return HttpResponse(json.dumps(output), content_type='application/json')


def api_role_list(request):
    roles = DanceRole.objects.order_by("name")
    output = []
    for role in roles:
        output.append({"name": role.name, "id": role.id})
    return HttpResponse(json.dumps(output), content_type='application/json')


def api_activity_list(request):
    activities = Activity.objects.order_by("name")
    output = []
    for activity in activities:
        output.append({"name": activity.name, "id": activity.id})
    return HttpResponse(json.dumps(output), content_type='application/json')


def api_skill_level_list(request):
    skill_levels = SkillLevel.objects.all()
    output = []
    for level in skill_levels:
        output.append({"name": level.name, "id": level.id})
    return HttpResponse(json.dumps(output), content_type='application/json')


def api_goal_list(request):
    goals = Goals.objects.all()
    output = []
    for goal in goals:
        output.append({"name": goal.name, "id": goal.id})
    return HttpResponse(json.dumps(output), content_type='application/json')

@login_required(login_url='/login/')
def profile_ajax(request):
    print(request.user.id)
    template = loader.get_template('profile_ajax.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))

@csrf_exempt
def update_pref(request):
    if request.POST:
        print(request.POST)
        pref_id = int(request.POST.get("pref_id"))
        dance_pref_list = DancePrefs.objects.filter(id=pref_id)
        if len(dance_pref_list) > 0:
            dance_pref = dance_pref_list[0]
        else:
            dance_pref = DancePrefs()

        if "role" in request.POST:
            role_id = int(request.POST.get("role"))
            role = get_object_or_404(DanceRole, pk=role_id)
            dance_pref.role = role

        if "dance" in request.POST:
            dance_id = int(request.POST.get("dance"))
            dance = get_object_or_404(Dance, pk=dance_id)
            dance_pref.dance = dance

        if "skill_level" in request.POST:
            skill_level_id = request.POST.get("skill_level")
            if skill_level_id:
                skill_level = SkillLevel.objects.filter(pk=skill_level_id)[0]
                dance_pref.skill_level = skill_level

        if "activity" in request.POST:
            activity_id = request.POST.get("activity")
            if activity_id:
                activity = Activity.objects.filter(pk=activity_id)[0]
                dance_pref.activity = activity

        if "goal" in request.POST:
            goal_id = request.POST.get("goal")
            if goal_id:
                goal = Goals.objects.filter(pk=goal_id)[0]
                dance_pref.goal = goal

        if "notes" in request.POST:
            dance_pref.notes = request.POST["notes"]

        # dance_pref.dancer = dancer
        dance_pref.save()

        return HttpResponseRedirect("/profile_ajax/")
