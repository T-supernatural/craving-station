from django.db import models

class GalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('ambiance', 'Ambiance'),
        ('events', 'Events'),
        ('bakery', 'Bakery'),
    ]

    image_url = models.URLField()
    caption = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='food')
    storage_path = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.caption or self.category
