from django.urls import path
from .views import (
    ProductListAPIView,
    ProductDetailAPIView,
    ProductCreateAPIView,
    ProductUpdateAPIView,
    ProductDestroyAPIView,
    ProductImageUploadAPIView,
)

urlpatterns = [
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/create/', ProductCreateAPIView.as_view(), name='product-create'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('products/<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update'),
    path('products/<int:pk>/delete/', ProductDestroyAPIView.as_view(), name='product-delete'),
    path('products/upload-image/', ProductImageUploadAPIView.as_view(), name='product-upload-image'),
]
