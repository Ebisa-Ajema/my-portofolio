from django.contrib import admin

from config.admin_site import admin_site
from .models import Resume


@admin.register(Resume, site=admin_site)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("file", "updated_at")
    readonly_fields = ("updated_at",)
    fields = ("file", "updated_at")
