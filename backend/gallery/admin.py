from django.contrib import admin
from .models import GalleryImage

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'caption', 'category', 'is_featured', 'uploaded_at')
    list_filter = ('category', 'is_featured', 'uploaded_at')
    search_fields = ('title', 'caption')
