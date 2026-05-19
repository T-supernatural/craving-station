from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user_id',
            'customer_email',
            'customer_name',
            'customer_phone',
            'delivery_address',
            'city',
            'landmark',
            'delivery_notes',
            'items',
            'subtotal',
            'delivery_fee',
            'total',
            'payment_reference',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class OrderCreateSerializer(OrderSerializer):
    class Meta(OrderSerializer.Meta):
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'payment_reference']
        read_only_fields = []
