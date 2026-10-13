from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id", "title", "slug", "short_description", "description",
            "technologies", "image", "github_url", "live_demo_url",
            "is_featured", "created_at", "updated_at",
        )

    def get_image(self, project):
        if not project.image:
            return None
        request = self.context.get("request")
        url = project.image.url
        return request.build_absolute_uri(url) if request else url
