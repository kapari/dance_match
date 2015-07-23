from django.db import models


class Dancer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    bio = models.TextField()
    date_joined = models.DateField('date joined')
    active_member = models.BooleanField()
    # photo = ImageField() https://docs.djangoproject.com/en/1.8/ref/models/fields/

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class Dance(models.Model):
    name = models.CharField(default='', max_length=200)
    description = models.TextField(blank=True)
    dance_community = models.ManyToManyField(
        Dancer,
        through='DancePrefs',
        through_fields=('dance', 'dancer')
    )

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
