from django.contrib import admin
from models import (Dancer, Dance, Day, Time, Venue, PreferredVenue, DancePrefs,
                    SkillLevel, Activity, Goals, DanceRole, MajorCity, Suburb, PreferredSuburb)

admin.site.register(Dancer)
admin.site.register(Dance)
admin.site.register(Day)
admin.site.register(Time)
admin.site.register(Venue)
admin.site.register(PreferredVenue)
admin.site.register(DancePrefs)
admin.site.register(SkillLevel)
admin.site.register(Activity)
admin.site.register(Goals)
admin.site.register(DanceRole)
admin.site.register(MajorCity)
admin.site.register(Suburb)
admin.site.register(PreferredSuburb)