from django.urls import path

from .views import PublishedProjectListView

urlpatterns = [path("projects/", PublishedProjectListView.as_view(), name="project-list")]
