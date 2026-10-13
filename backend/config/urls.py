from django.shortcuts import redirect
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .admin_site import admin_site
from .admin_api import AdminLoginView, AdminLogoutView, AdminMeView, AdminSummaryView
from apps.contact.admin_api import AdminContactMessageViewSet
from apps.content.admin_api import ResumeDownloadView, ResumeView
from apps.projects.admin_api import AdminProjectViewSet

admin_api = DefaultRouter()
admin_api.register("projects", AdminProjectViewSet, basename="admin-project")
admin_api.register("messages", AdminContactMessageViewSet, basename="admin-message")

urlpatterns = [
    path("", lambda request: redirect("admin:index"), name="home"),
    path("admin/content/portfoliocontent/", lambda request: redirect("admin:index"), name="removed-portfolio-content"),
    path("admin/", admin_site.urls),
    path("api/admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("api/admin/logout/", AdminLogoutView.as_view(), name="admin-logout"),
    path("api/admin/me/", AdminMeView.as_view(), name="admin-me"),
    path("api/admin/summary/", AdminSummaryView.as_view(), name="admin-summary"),
    path("api/admin/", include(admin_api.urls)),
    path("api/admin/resume/", ResumeView.as_view(), name="admin-resume"),
    path("api/resume/", ResumeView.as_view(), name="public-resume"),
    path("api/resume/download/", ResumeDownloadView.as_view(), name="public-resume-download"),
    path("api/", include("apps.projects.urls")),
    path("api/", include("apps.contact.urls")),
]
