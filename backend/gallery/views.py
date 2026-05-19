import os
import time
import uuid
from django.core.files.storage import default_storage
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import GalleryImage
from .serializers import GalleryImageSerializer


class GalleryListAPIView(ListAPIView):
    queryset = GalleryImage.objects.all().order_by('-uploaded_at')
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)
        return queryset


class GalleryImageUploadAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image = request.FILES.get('file')
        if not image:
            return Response({'detail': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            extension = os.path.splitext(image.name)[1] or '.jpg'
            file_name = f'gallery/{int(time.time())}-{uuid.uuid4().hex}{extension}'
            saved_path = default_storage.save(file_name, image)
            image_url = default_storage.url(saved_path)

            gallery_image = GalleryImage.objects.create(
                image_url=image_url,
                caption=request.data.get('caption', ''),
                category=request.data.get('category', 'food'),
                storage_path=saved_path,
            )

            serializer = GalleryImageSerializer(gallery_image)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response(
                {'detail': 'Image upload failed: ' + str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GalleryImageDestroyAPIView(DestroyAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        storage_path = instance.storage_path
        self.perform_destroy(instance)

        if storage_path:
            try:
                default_storage.delete(storage_path)
            except Exception:
                pass

        return Response({'detail': 'Gallery image deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
