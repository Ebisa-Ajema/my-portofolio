from uuid import uuid4

from django.core.validators import FileExtensionValidator
from django.db import models


def resume_upload_path(instance, filename):
    return f"portfolio/resume-{uuid4().hex}.pdf"


class PortfolioContent(models.Model):
    headline = models.CharField(max_length=180, blank=True)
    introduction = models.TextField(max_length=1200, blank=True)
    about = models.TextField(max_length=4000, blank=True)
    skills = models.JSONField(default=list, blank=True)
    technologies = models.JSONField(default=list, blank=True)
    contact_email = models.EmailField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "portfolio content"
        verbose_name_plural = "portfolio content"

    def __str__(self):
        return "Portfolio content"


class Resume(models.Model):
    file = models.FileField(
        upload_to=resume_upload_path,
        validators=[FileExtensionValidator(["pdf"])],
        blank=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "resume"
        verbose_name_plural = "resume"

    def __str__(self):
        return "Portfolio resume"

    def clean(self):
        super().clean()
        if self.file:
            from django.core.exceptions import ValidationError

            if self.file.size > 10 * 1024 * 1024:
                raise ValidationError({"file": "Resume PDFs must be 10 MB or smaller."})
            current_position = self.file.tell()
            self.file.seek(0)
            is_pdf = self.file.read(5) == b"%PDF-"
            self.file.seek(current_position)
            if not is_pdf:
                raise ValidationError({"file": "Upload a valid PDF document."})
