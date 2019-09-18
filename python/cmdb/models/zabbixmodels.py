from django.db import models

# Create your models here.


class Zabbixcfg(models.Model):
    url = models.CharField(max_length=255)
    user = models.CharField(max_length=255)
    passwd = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'zabbixcfg'