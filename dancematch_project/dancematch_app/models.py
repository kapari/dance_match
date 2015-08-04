from django.db import models
from django.contrib.auth.models import User


class Dancer(models.Model):
    user = models.OneToOneField(User)
    bio = models.TextField()
    img_path = models.CharField(max_length=200)

    def __str__(self):
        return "User ID: " + str(self.user.id) + str(self.user.first_name) + " " + str(self.user.last_name)

    def __unicode__(self):
        return "User ID: " + str(self.user.id) + str(self.user.first_name) + " " + str(self.user.last_name)


class Dance(models.Model):
    name = models.CharField(default='', max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class DanceRole(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class SkillLevel(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Activity(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Goals(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Day(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Time(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=200)
    # zip_code = models.IntegerField(min_value=00000, max_value=99999)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


# class Messages(models.Model):
#     from_user = models.ForeignKey(User)
#     to_user = models.ForeignKey(User)
#     message = models.TextField(blank=True)


class DancePrefs(models.Model):
    dance = models.ForeignKey(Dance)
    dancer = models.ForeignKey(Dancer)
    role = models.ForeignKey(DanceRole)
    skill_level = models.ForeignKey(SkillLevel, null=True)
    activity = models.ForeignKey(Activity, null=True)
    goal = models.ForeignKey(Goals, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return str(self.dancer) + "'s " + str(self.dance) + ' prefs: ' + str(self.role)

    def __unicode__(self):
        return str(self.dancer) + "'s " + str(self.dance) + ' prefs' + str(self.role)

