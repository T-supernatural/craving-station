from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer


class BookingListAPIView(ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Booking.objects.all().order_by('-event_date', '-created_at')
        user = self.request.user
        if getattr(user, 'role', '') == 'admin':
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset

        return queryset.filter(user=user)


class BookingCreateAPIView(CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(response.data, status=status.HTTP_201_CREATED)


class BookingUpdateAPIView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'put']

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()
        user = request.user
        if getattr(user, 'role', '') != 'admin' and booking.user != user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().patch(request, *args, **kwargs)
