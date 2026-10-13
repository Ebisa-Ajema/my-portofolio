from django.test import TestCase
from rest_framework.test import APIClient

from .models import Project


class PublishedProjectApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Project.objects.create(
            title="Published example",
            slug="published-example",
            short_description="Public project",
            description="A project visible to visitors.",
            technologies=["Django"],
            is_published=True,
        )
        Project.objects.create(
            title="Draft example",
            slug="draft-example",
            short_description="Private draft",
            description="This must stay private until published.",
            is_published=False,
        )

    def test_api_only_returns_published_projects(self):
        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.data]
        self.assertIn("published-example", slugs)
        self.assertIn("student-management-system", slugs)
        self.assertNotIn("draft-example", slugs)
        self.assertIn("technologies", response.data[0])
        self.assertIsNone(response.data[0]["image"])

    def test_admin_is_required_to_manage_projects(self):
        response = self.client.post("/api/projects/", {"title": "Attempt"})
        self.assertEqual(response.status_code, 405)
