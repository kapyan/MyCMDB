from django.db import models


class User(models.Model):
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    avatar = models.CharField(max_length=255, blank=True, null=True)
    desc = models.CharField(max_length=255, blank=True, null=True)
    create_datetime = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user'
