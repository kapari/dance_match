from django.shortcuts import render, get_object_or_404, get_list_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse

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


def edit_dance(request, dancer_id, dance_pref_id):
    dancer = get_object_or_404(Dancer, pk=dancer_id)
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

        return HttpResponseRedirect("/profile/" + str(dancer.id) + "/")

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
    context = RequestContext(request, {'all_prefs': all_prefs,})
    return HttpResponse(template.render(context))

def api_dance_prefs(request):
    dance_pref_list = DancePrefs.objects.all()
    output = []
    for pref in dance_pref_list:
        prefdata = {}
        prefdata["id"] = pref.id
        prefdata["dancer"] = pref.dancer
        prefdata["dance"] = pref.dance
        output.append(prefdata)
    json_data = json.dumps(output, indent=4)
    return HttpResponse