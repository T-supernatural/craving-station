from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import RestaurantSettings
from .serializers import RestaurantSettingsSerializer


class RestaurantSettingsAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'PATCH':
            return [IsAuthenticated(), IsAdminUser()]
        return [AllowAny()]

    def get(self, request):
        settings_obj, _ = RestaurantSettings.objects.get_or_create(id=1)
        serializer = RestaurantSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def patch(self, request):
        settings_obj, _ = RestaurantSettings.objects.get_or_create(id=1)
        serializer = RestaurantSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
