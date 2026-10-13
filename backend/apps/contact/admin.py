from django.contrib import admin

from config.admin_site import admin_site

from .models import ContactMessage


@admin.register(ContactMessage, site=admin_site)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "status", "created_at")
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "subject", "message", "created_at")
    fields = ("name", "email", "subject", "message", "status", "created_at")
    date_hierarchy = "created_at"
