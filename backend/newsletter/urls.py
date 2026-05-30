from django.urls import path
from .views import SubscriberCreateAPIView

urlpatterns = [
    path('subscribe/', SubscriberCreateAPIView.as_view(), name='newsletter_subscribe'),
]
