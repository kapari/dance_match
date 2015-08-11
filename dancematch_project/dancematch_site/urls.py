"""dancematch_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from dancematch_app import views

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    # ex. /
    url(r'^$', views.index, name='index'),
    # ex. /profile/5/
    url(r'^profile/(?P<dancer_id>[0-9]+)/$', views.profile, name='profile'),
    # ex. /edit/5/
    url(r'^edit/(?P<user_id>[0-9]+)/$', views.edit_profile, name='edit_profile'),
    # ex. /edit/5/13
    url(r'^edit/(?P<user_id>[0-9]+)/(?P<dance_pref_id>[0-9]+)/$', views.edit_dance, name='edit_dance'),
    # ex. /dances/
    url(r'^dances/', views.dances, name='dances'),
    url(r'^results/', views.results, name='results'),
    url(r'^api_dance_prefs/', views.api_dance_prefs, name='api_dance_prefs'),
    url(r'^api_dance_list/', views.api_dance_list, name='api_dance_list'),
    url(r'^api_role_list/', views.api_role_list, name='api_role_list'),
    url(r'^api_skill_level_list/', views.api_skill_level_list, name='api_skill_level_list'),
    url(r'^api_activity_list/', views.api_activity_list, name='api_activity_list'),
    url(r'^api_goal_list/', views.api_goal_list, name='api_goal_list'),
    url(r'^api_profile/', views.api_profile, name='api_profile'),
    url(r'^api_suburbs/', views.api_suburbs, name='api_suburbs'),

    # ex. /profile_ajax/
    url(r'^profile_ajax/$', views.profile_ajax, name='profile_ajax'),
    url(r'^update_pref/$', views.update_pref, name='update_pref'),
    url(r'^update_profile/$', views.update_profile, name='update_profile'),
    # Login
    url(r'^login/$', views.login_view, name='login'),
    url(r'^register/$', views.register_view, name='register'),
    url(r'^img_upload/$', views.img_upload, name='img_upload')
]
