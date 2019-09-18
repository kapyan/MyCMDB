from django.db import models


class Emailcfg(models.Model):

    imap_url = models.CharField(max_length=255)
    imap_port = models.CharField(max_length=50)
    imap_ssl = models.CharField(max_length=50)
    email = models.CharField(max_length=255)
    empasswd = models.CharField(max_length=255)
    emfolder = models.CharField(max_length=255)
    allemfolder = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'emailcfg'
