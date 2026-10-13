import apps.content.models
from django.core.validators import FileExtensionValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="PortfolioContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("headline", models.CharField(blank=True, max_length=180)),
                ("introduction", models.TextField(blank=True, max_length=1200)),
                ("about", models.TextField(blank=True, max_length=4000)),
                ("skills", models.JSONField(blank=True, default=list)),
                ("technologies", models.JSONField(blank=True, default=list)),
                ("contact_email", models.EmailField(blank=True, max_length=254)),
                ("github_url", models.URLField(blank=True)),
                ("linkedin_url", models.URLField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "portfolio content", "verbose_name_plural": "portfolio content"},
        ),
        migrations.CreateModel(
            name="Resume",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(blank=True, upload_to=apps.content.models.resume_upload_path, validators=[FileExtensionValidator(["pdf"])])),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "resume", "verbose_name_plural": "resume"},
        ),
    ]
