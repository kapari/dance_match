from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Dancer(models.Model):
    user = models.OneToOneField(User)
    bio = models.TextField()
    img_path = models.CharField(max_length=200, default="/static/uploads/default.png")

    def __str__(self):
        return "User ID: " + str(self.user.id) + str(self.user.first_name) + " " + str(self.user.last_name)

    def __unicode__(self):
        return "User ID: " + str(self.user.id) + str(self.user.first_name) + " " + str(self.user.last_name)


class Dance(models.Model):
    name = models.CharField(default='', max_length=200)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]


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

    class Meta:
        verbose_name_plural = "activities"

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Goals(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "goals"

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


class Venue(models.Model):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    # image = models.CharField(max_length=200)
    # map = models.CharField(max_length=400)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class PreferredVenue(models.Model):
    dancer = models.ForeignKey(Dancer)
    venue = models.ForeignKey(Venue)

    def __str__(self):
        return self.dancer.name + " prefers " + self.name

    def __unicode__(self):
        return self.dancer.name + " prefers " + self.name


class MajorCity(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "major cities"

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Suburb(models.Model):
    name = models.CharField(max_length=200)
    hub = models.ForeignKey(MajorCity)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.hub.name + ": " + self.name

    def __unicode__(self):
        return self.hub.name + ": " + self.name


class PreferredSuburb(models.Model):
    dancer = models.ForeignKey(Dancer)
    suburb = models.ForeignKey(Suburb)

    class Meta:
        ordering = ["suburb"]

    def __str__(self):
        return self.dancer.user.username + " likes " + self.suburb.name

    def __unicode__(self):
        return self.dancer.user.username + " likes " + self.suburb.name

# class Messages(models.Model):
#     from_user = models.ForeignKey(User)
#     to_user = models.ForeignKey(User)
#     message = models.TextField(blank=True)


class DancePrefs(models.Model):
    dance = models.ForeignKey(Dance)
    dancer = models.ForeignKey(Dancer)
    role = models.ForeignKey(DanceRole)
    skill_level = models.ForeignKey(SkillLevel, default=1)
    activity = models.ForeignKey(Activity, default=1)
    goal = models.ForeignKey(Goals, default=1)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "dance prefs"

    def __str__(self):
        return str(self.dancer) + "'s " + str(self.dance) + ' prefs: ' + str(self.role)

    def __unicode__(self):
        return str(self.dancer) + "'s " + str(self.dance) + ' prefs' + str(self.role)

