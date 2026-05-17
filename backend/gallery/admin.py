from django.contrib import admin
from .models import GalleryImage

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('caption', 'category', 'uploaded_at')
    list_filter = ('category', 'uploaded_at')
    search_fields = ('caption',)
