from django.urls import path
from .views import GalleryListAPIView, GalleryImageUploadAPIView, GalleryImageDestroyAPIView

urlpatterns = [
    path('gallery/', GalleryListAPIView.as_view(), name='gallery-list'),
    path('gallery/upload/', GalleryImageUploadAPIView.as_view(), name='gallery-upload'),
    path('gallery/<int:pk>/delete/', GalleryImageDestroyAPIView.as_view(), name='gallery-delete'),
]
