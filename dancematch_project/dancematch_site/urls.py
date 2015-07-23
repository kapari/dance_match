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
    url(r'^edit/(?P<dancer_id>[0-9]+)/$', views.edit_profile, name='edit_profile'),
    # ex. /edit/5/13
    url(r'^edit/(?P<dancer_id>[0-9]+)/(?P<dance_pref_id>[0-9]+)/$', views.edit_dance, name='edit_dance'),
    # ex. /dances/
    url(r'^dances/', views.dances, name='dances'),
]
