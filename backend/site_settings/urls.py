from django.urls import path
from .views import RestaurantSettingsAPIView

urlpatterns = [
    path('settings/', RestaurantSettingsAPIView.as_view(), name='site-settings'),
]
