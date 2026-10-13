from django.contrib import admin
from django.utils import timezone


class PortfolioAdminSite(admin.AdminSite):
    site_header = "Ebisa Ajema | Portfolio Admin"
    site_title = "Portfolio Admin"
    index_title = "Portfolio dashboard"

    def index(self, request, extra_context=None):
        from apps.contact.models import ContactMessage
        from apps.projects.models import Project

        context = {
            "project_count": Project.objects.count(),
            "published_project_count": Project.objects.filter(is_published=True).count(),
            "unread_message_count": ContactMessage.objects.filter(status=ContactMessage.Status.UNREAD).count(),
            "recent_messages": ContactMessage.objects.order_by("-created_at")[:5],
            "recent_projects": Project.objects.order_by("-updated_at")[:5],
            "dashboard_updated": timezone.now(),
        }
        if extra_context:
            context.update(extra_context)
        return super().index(request, extra_context=context)


admin_site = PortfolioAdminSite(name="admin")
