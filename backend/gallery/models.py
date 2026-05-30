from django.db import models

class GalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('ambiance', 'Ambiance'),
        ('events', 'Events'),
        ('catering', 'Catering'),
        ('behind_the_scenes', 'Behind the Scenes'),
    ]

    title = models.CharField(max_length=120, blank=True)
    image_url = models.URLField()
    alt_text = models.CharField(max_length=255, blank=True)
    caption = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='food')
    is_featured = models.BooleanField(default=False)
    storage_path = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title or self.caption or self.category
