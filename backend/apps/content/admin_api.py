from django.core.exceptions import ValidationError
from django.http import FileResponse
from django.urls import reverse
from rest_framework import serializers
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from config.authentication import PortfolioAdminTokenAuthentication
from .models import PortfolioContent, Resume


class PortfolioContentSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(child=serializers.CharField(max_length=60), required=False)
    technologies = serializers.ListField(child=serializers.CharField(max_length=60), required=False)

    class Meta:
        model = PortfolioContent
        fields = ("headline", "introduction", "about", "skills", "technologies", "contact_email", "github_url", "linkedin_url", "updated_at")
        read_only_fields = ("updated_at",)


class PortfolioContentView(APIView):
    authentication_classes = [PortfolioAdminTokenAuthentication]

    def get_permissions(self):
        return [AllowAny() if self.request.method == "GET" else IsAdminUser()]

    def get(self, request):
        content = PortfolioContent.objects.first()
        if not content:
            content = PortfolioContent()
        return Response(PortfolioContentSerializer(content).data)

    def patch(self, request):
        content = PortfolioContent.objects.first() or PortfolioContent()
        serializer = PortfolioContentSerializer(content, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ResumeView(APIView):
    authentication_classes = [PortfolioAdminTokenAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        return [AllowAny() if self.request.method == "GET" else IsAdminUser()]

    def get(self, request):
        resume = Resume.objects.first()
        if not resume or not resume.file:
            return Response({"available": False, "filename": "", "url": None, "updated_at": None})
        url = resume.file.url
        if request:
            url = request.build_absolute_uri(url)
        download_url = request.build_absolute_uri(reverse("public-resume-download"))
        return Response({"available": True, "filename": resume.file.name.rsplit("/", 1)[-1], "url": url, "download_url": download_url, "updated_at": resume.updated_at})

    def put(self, request):
        uploaded = request.FILES.get("file")
        if not uploaded:
            raise serializers.ValidationError({"file": "Choose a PDF file to upload."})
        if uploaded.size > 10 * 1024 * 1024:
            raise serializers.ValidationError({"file": "Resume PDFs must be 10 MB or smaller."})
        if not uploaded.name.lower().endswith(".pdf") or uploaded.read(5) != b"%PDF-":
            raise serializers.ValidationError({"file": "The uploaded file must be a valid PDF."})
        uploaded.seek(0)
        resume = Resume.objects.first() or Resume()
        old_file = resume.file if resume.pk else None
        resume.file = uploaded
        try:
            resume.full_clean()
        except ValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        resume.save()
        if old_file and old_file.name != resume.file.name:
            old_file.delete(save=False)
        return self.get(request)

    def delete(self, request):
        resume = Resume.objects.first()
        if resume and resume.file:
            resume.file.delete(save=False)
            resume.file = ""
            resume.save(update_fields=["file", "updated_at"])
        return Response({"available": False, "filename": "", "url": None, "updated_at": None})


class ResumeDownloadView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        resume = Resume.objects.first()
        if not resume or not resume.file:
            return Response({"detail": "No resume is currently available."}, status=404)
        return FileResponse(resume.file.open("rb"), as_attachment=True, filename="Ebisa-Ajema-CV.pdf", content_type="application/pdf")
