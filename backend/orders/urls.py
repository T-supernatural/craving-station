from django.urls import path
from .views import (
    OrderListAPIView,
    OrderCreateAPIView,
    OrderUpdateAPIView,
    OrderDestroyAPIView,
    AdminDashboardStatsAPIView,
)

urlpatterns = [
    path('orders/', OrderListAPIView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateAPIView.as_view(), name='order-create'),
    path('orders/<int:pk>/update/', OrderUpdateAPIView.as_view(), name='order-update'),
    path('orders/<int:pk>/delete/', OrderDestroyAPIView.as_view(), name='order-delete'),
    path('admin/stats/', AdminDashboardStatsAPIView.as_view(), name='admin_dashboard_stats'),
]
