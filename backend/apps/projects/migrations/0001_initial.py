import apps.projects.models
import django.core.validators
from django.db import migrations, models


def add_initial_projects(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    projects = [
        {
            "title": "Student Management System",
            "slug": "student-management-system",
            "short_description": "Built with Django and Django Templates.",
            "description": "A student management system built with Django and Django Templates.",
            "technologies": ["Django", "Django Templates"],
            "is_featured": True,
        },
        {
            "title": "Advanced Sales Profit Report",
            "slug": "advanced-sales-profit-report",
            "short_description": "A sales profit reporting project developed for Odoo 17.",
            "description": "A sales profit reporting project developed for Odoo 17.",
            "technologies": ["Odoo 17", "Python", "PostgreSQL"],
            "is_featured": False,
        },
        {
            "title": "Gojo City Administration Platform",
            "slug": "gojo-city-administration-platform",
            "short_description": "A city administration platform built with React, Tailwind CSS, Django, and PostgreSQL.",
            "description": "A city administration platform built with React, Tailwind CSS, Django, and PostgreSQL.",
            "technologies": ["React", "Tailwind CSS", "Django", "PostgreSQL"],
            "is_featured": False,
        },
    ]
    for project in projects:
        Project.objects.get_or_create(slug=project["slug"], defaults={**project, "is_published": True})


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=120)),
                ("slug", models.SlugField(max_length=140, unique=True)),
                ("short_description", models.CharField(max_length=240)),
                ("description", models.TextField()),
                ("technologies", models.JSONField(blank=True, default=list)),
                ("image", models.ImageField(blank=True, upload_to=apps.projects.models.project_image_path, validators=[django.core.validators.FileExtensionValidator(["jpg", "jpeg", "png", "webp"])])),
                ("github_url", models.URLField(blank=True)),
                ("live_demo_url", models.URLField(blank=True)),
                ("is_featured", models.BooleanField(default=False)),
                ("is_published", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-is_featured", "-created_at", "title"]},
        ),
        migrations.RunPython(add_initial_projects, migrations.RunPython.noop),
    ]
