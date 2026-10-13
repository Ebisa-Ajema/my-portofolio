from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .authentication import PortfolioAdminTokenAuthentication


class AdminLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "admin_login"

    def post(self, request):
        identifier = request.data.get("username", "")
        password = request.data.get("password", "")
        if not isinstance(identifier, str) or not isinstance(password, str):
            return Response({"detail": "Enter a valid username and password."}, status=status.HTTP_400_BAD_REQUEST)
        identifier = identifier.strip()
        User = get_user_model()
        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier, is_staff=True).first()
            username = user.get_username() if user else identifier
        else:
            username = identifier
        user = authenticate(request, username=username, password=password)
        if not user or not user.is_active or not user.is_staff:
            return Response({"detail": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        return Response({"token": token.key, "username": user.get_username(), "email": user.email})


class AdminLogoutView(APIView):
    authentication_classes = [PortfolioAdminTokenAuthentication]
    permission_classes = [IsAdminUser]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminMeView(APIView):
    authentication_classes = [PortfolioAdminTokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"username": request.user.get_username(), "email": request.user.email})


class AdminSummaryView(APIView):
    authentication_classes = [PortfolioAdminTokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.contact.models import ContactMessage
        from apps.content.models import Resume
        from apps.projects.models import Project

        messages = ContactMessage.objects.order_by("-created_at")[:5]
        projects = Project.objects.order_by("-updated_at")[:5]
        resume = Resume.objects.first()
        return Response({
            "projects_total": Project.objects.count(),
            "projects_published": Project.objects.filter(is_published=True).count(),
            "projects_draft": Project.objects.filter(is_published=False).count(),
            "messages_total": ContactMessage.objects.count(),
            "messages_unread": ContactMessage.objects.filter(status=ContactMessage.Status.UNREAD).count(),
            "resume_available": bool(resume and resume.file),
            "resume_updated_at": resume.updated_at if resume and resume.file else None,
            "recent_messages": [{"id": m.pk, "name": m.name, "subject": m.subject, "status": m.status, "created_at": m.created_at} for m in messages],
            "recent_projects": [{"id": p.pk, "title": p.title, "is_published": p.is_published, "updated_at": p.updated_at} for p in projects],
        })
