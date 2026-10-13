from rest_framework import mixins, serializers, viewsets
from rest_framework.permissions import IsAdminUser

from config.authentication import PortfolioAdminTokenAuthentication
from .models import ContactMessage


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ("id", "name", "email", "subject", "message", "created_at")


class AdminContactMessageViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    authentication_classes = [PortfolioAdminTokenAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminContactMessageSerializer
    queryset = ContactMessage.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        if status_filter in {"read", "unread"}:
            queryset = queryset.filter(status=status_filter)
        if search:
            from django.db.models import Q

            queryset = queryset.filter(Q(name__icontains=search) | Q(email__icontains=search) | Q(subject__icontains=search) | Q(message__icontains=search))
        return queryset
