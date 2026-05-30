from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Reservation
from .serializers import ReservationSerializer, ReservationStatusSerializer


class ReservationListCreateAPIView(ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'admin' or user.is_staff or user.is_superuser:
            status_filter = self.request.query_params.get('status')
            queryset = Reservation.objects.all().order_by('-created_at')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        return Reservation.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReservationUpdateAPIView(UpdateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationStatusSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'put']

    def patch(self, request, *args, **kwargs):
        reservation = self.get_object()
        user = request.user

        if not (getattr(user, 'role', '') == 'admin' or user.is_staff or user.is_superuser):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return super().patch(request, *args, **kwargs)
