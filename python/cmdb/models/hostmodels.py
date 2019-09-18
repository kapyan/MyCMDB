# -*- coding: utf-8 -*-


from django.db import models


class Host(models.Model):
    hostname = models.CharField(max_length=255, blank=True, null=True)
    ip = models.CharField(max_length=255, blank=True, null=True)
    system = models.CharField(max_length=255, blank=True, null=True)
    cpu = models.CharField(max_length=255, blank=True, null=True)
    memory = models.CharField(max_length=255, blank=True, null=True)
    disk = models.CharField(max_length=255, blank=True, null=True)
    network = models.CharField(max_length=255, blank=True, null=True)
    machineroom = models.CharField(max_length=255, blank=True, null=True)
    group = models.IntegerField(blank=True, null=True)
    rundate = models.DateTimeField()
    remark = models.TextField()

    class Meta:
        managed = False
        db_table = 'host'
