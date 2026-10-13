from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from .models import Project
from .serializers import ProjectSerializer


class PublishedProjectListView(ListAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = ProjectSerializer
    pagination_class = None
    queryset = Project.objects.filter(is_published=True)
