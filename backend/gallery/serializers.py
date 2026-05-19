from rest_framework import serializers
from .models import GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'image_url',
            'caption',
            'category',
            'storage_path',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'image_url', 'storage_path', 'uploaded_at']


class GalleryImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'image_url', 'caption', 'category', 'storage_path']
        read_only_fields = ['id', 'image_url', 'storage_path']
