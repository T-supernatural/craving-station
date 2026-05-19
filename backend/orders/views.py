from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer


class OrderListAPIView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Order.objects.all().order_by('-created_at')
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()

        if getattr(user, 'role', '') == 'admin':
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset

        return queryset.filter(user=user)


class OrderCreateAPIView(CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(response.data, status=status.HTTP_201_CREATED)


class OrderUpdateAPIView(UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderUpdateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    http_method_names = ['patch', 'put']

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        if getattr(user, 'role', '') == 'admin':
            return super().patch(request, *args, **kwargs)

        if order.user and order.user != user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        provided_reference = request.data.get('payment_reference') or request.query_params.get('payment_reference')
        if order.user is None and provided_reference and provided_reference == order.payment_reference:
            return super().patch(request, *args, **kwargs)

        if order.user != user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return super().patch(request, *args, **kwargs)


class OrderDestroyAPIView(DestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def delete(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user

        if getattr(user, 'role', '') == 'admin':
            order.delete()
            return Response({'detail': 'Order deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        if order.user and order.user != user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        payment_reference = request.query_params.get('payment_reference')
        if order.user is None and payment_reference and payment_reference == order.payment_reference:
            order.delete()
            return Response({'detail': 'Order deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        if order.user == user:
            order.delete()
            return Response({'detail': 'Order deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
