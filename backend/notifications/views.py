from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListCreateAPIView(ListCreateAPIView):
    serializer_class = NotificationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', '') != 'admin':
            raise PermissionError('Only admin users may send notifications.')
        serializer.save()

    def create(self, request, *args, **kwargs):
        if getattr(request.user, 'role', '') != 'admin':
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
