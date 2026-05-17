from django.urls import path
from .views import EmailTokenObtainPairView, RegisterAPIView, ProfileAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='auth_register'),
    path('auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileAPIView.as_view(), name='auth_profile'),
]
