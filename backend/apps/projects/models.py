import uuid

from django.core.validators import FileExtensionValidator
from django.db import models


def project_image_path(instance, filename):
    extension = filename.rsplit(".", 1)[-1].lower()
    return f"projects/{instance.slug}/{uuid.uuid4().hex}.{extension}"


class Project(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    short_description = models.CharField(max_length=240)
    description = models.TextField()
    technologies = models.JSONField(default=list, blank=True)
    image = models.ImageField(
        upload_to=project_image_path,
        blank=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
    )
    github_url = models.URLField(blank=True)
    live_demo_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at", "title"]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if self.technologies and (
            not isinstance(self.technologies, list)
            or any(not isinstance(value, str) or len(value) > 60 for value in self.technologies)
        ):
            from django.core.exceptions import ValidationError

            raise ValidationError({"technologies": "Enter a list of technology names (up to 60 characters each)."})
        if self.image and self.image.size > 5 * 1024 * 1024:
            from django.core.exceptions import ValidationError

            raise ValidationError({"image": "Project images must be 5 MB or smaller."})
