from PIL import Image, UnidentifiedImageError
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAdminUser

from config.authentication import PortfolioAdminTokenAuthentication
from .models import Project


class AdminProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_image(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Project images must be 5 MB or smaller.")
        if image:
            try:
                checked_image = Image.open(image)
                if checked_image.format not in {"JPEG", "PNG", "WEBP"}:
                    raise serializers.ValidationError("Upload a JPG, PNG, or WebP image.")
                checked_image.verify()
            except (UnidentifiedImageError, Image.DecompressionBombError, OSError) as exc:
                raise serializers.ValidationError("The uploaded file is not a valid image.") from exc
            finally:
                image.seek(0)
        return image


class AdminProjectViewSet(viewsets.ModelViewSet):
    authentication_classes = [PortfolioAdminTokenAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminProjectSerializer
    queryset = Project.objects.all().order_by("-updated_at")

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        featured = self.request.query_params.get("featured")
        search = self.request.query_params.get("search")
        if status_filter == "published":
            queryset = queryset.filter(is_published=True)
        elif status_filter == "draft":
            queryset = queryset.filter(is_published=False)
        if featured in {"true", "false"}:
            queryset = queryset.filter(is_featured=(featured == "true"))
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset
