from django.urls import path
from .views import BookingListAPIView, BookingCreateAPIView, BookingUpdateAPIView

urlpatterns = [
    path('reservations/', BookingListAPIView.as_view(), name='reservation-list'),
    path('reservations/create/', BookingCreateAPIView.as_view(), name='reservation-create'),
    path('reservations/<int:pk>/update/', BookingUpdateAPIView.as_view(), name='reservation-update'),
]
