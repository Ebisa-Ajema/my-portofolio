from django.contrib import admin

from config.admin_site import admin_site

from .models import Project


@admin.register(Project, site=admin_site)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "is_featured", "is_published", "updated_at")
    list_filter = ("is_published", "is_featured")
    list_editable = ("is_featured", "is_published")
    search_fields = ("title", "short_description", "description", "slug")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
