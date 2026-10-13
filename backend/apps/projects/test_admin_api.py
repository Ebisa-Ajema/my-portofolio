from datetime import timedelta
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from apps.contact.models import ContactMessage
from apps.projects.models import Project


class AdminApiTests(APITestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user("portfolio-admin", password="A-secure-test-password-482", is_staff=True)
        self.regular = get_user_model().objects.create_user("regular-user", password="A-secure-test-password-482")
        self.project = Project.objects.create(
            title="Private Draft", slug="private-draft", short_description="A draft project", description="Draft details",
        )
        self.message = ContactMessage.objects.create(name="Visitor", email="visitor@example.com", subject="Hello", message="A private note")

    def authenticate(self):
        token = Token.objects.create(user=self.staff)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_admin_endpoints_require_staff_authentication(self):
        for url in (
            "/api/admin/summary/",
            "/api/admin/projects/",
            "/api/admin/messages/",
        ):
            response = self.client.get(url)
            self.assertIn(response.status_code, (401, 403), url)
        self.assertIn(self.client.put("/api/admin/resume/", {}).status_code, (401, 403))
        self.assertEqual(self.client.get("/api/resume/").status_code, 200)

    def test_login_rejects_regular_users_and_authenticates_staff(self):
        denied = self.client.post("/api/admin/login/", {"username": "regular-user", "password": "A-secure-test-password-482"}, format="json")
        self.assertEqual(denied.status_code, 400)
        response = self.client.post("/api/admin/login/", {"username": "portfolio-admin", "password": "A-secure-test-password-482"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["token"])
        self.assertEqual(response.data["username"], "portfolio-admin")

    def test_regular_user_token_cannot_manage_private_data(self):
        token = Token.objects.create(user=self.regular)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        self.assertEqual(self.client.get("/api/admin/messages/").status_code, 403)
        self.assertEqual(self.client.patch(f"/api/admin/projects/{self.project.pk}/", {"is_published": True}, format="json").status_code, 403)

    def test_admin_tokens_expire_after_twelve_hours(self):
        token = Token.objects.create(user=self.staff)
        Token.objects.filter(pk=token.pk).update(created=timezone.now() - timedelta(hours=13))
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        self.assertEqual(self.client.get("/api/admin/projects/").status_code, 401)
        self.assertFalse(Token.objects.filter(pk=token.pk).exists())

    def test_staff_can_edit_projects_and_mark_messages_read(self):
        self.authenticate()
        updated_project = self.client.patch(f"/api/admin/projects/{self.project.pk}/", {"is_published": True}, format="json")
        self.assertEqual(updated_project.status_code, 200)
        self.project.refresh_from_db()
        self.assertTrue(self.project.is_published)

        updated_message = self.client.patch(f"/api/admin/messages/{self.message.pk}/", {"status": "read"}, format="json")
        self.assertEqual(updated_message.status_code, 200)
        self.message.refresh_from_db()
        self.assertEqual(self.message.status, ContactMessage.Status.READ)

    def test_staff_can_create_and_delete_projects_and_messages(self):
        self.authenticate()
        created = self.client.post("/api/admin/projects/", {
            "title": "New portfolio piece",
            "slug": "new-portfolio-piece",
            "short_description": "A concise project summary",
            "description": "Project details from the dashboard.",
            "technologies": ["Django", "PostgreSQL"],
            "is_published": False,
            "is_featured": False,
        }, format="json")
        self.assertEqual(created.status_code, 201)
        created_id = created.data["id"]
        self.assertEqual(self.client.delete(f"/api/admin/projects/{created_id}/").status_code, 204)
        self.assertEqual(self.client.delete(f"/api/admin/messages/{self.message.pk}/").status_code, 204)

    def test_resume_upload_requires_pdf_and_is_served_as_public_resume(self):
        self.authenticate()
        with TemporaryDirectory() as media_path, override_settings(MEDIA_ROOT=media_path):
            invalid = self.client.put("/api/admin/resume/", {"file": SimpleUploadedFile("notes.txt", b"not a pdf")}, format="multipart")
            self.assertEqual(invalid.status_code, 400)
            valid = self.client.put("/api/admin/resume/", {"file": SimpleUploadedFile("resume.pdf", b"%PDF-1.4\n%%EOF")}, format="multipart")
            self.assertEqual(valid.status_code, 200)
            self.assertTrue(valid.data["available"])
            public_resume = self.client.get("/api/resume/")
            self.assertTrue(public_resume.data["available"])
            downloaded = self.client.get("/api/resume/download/")
            self.assertEqual(downloaded.status_code, 200)
            self.assertIn("attachment", downloaded["Content-Disposition"])

    def test_public_contact_messages_remain_private(self):
        response = self.client.get("/api/contact/")
        self.assertEqual(response.status_code, 405)
        self.assertNotContains(response, "A private note", status_code=405)
