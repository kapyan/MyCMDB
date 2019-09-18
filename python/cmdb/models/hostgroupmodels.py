# -*- coding: utf-8 -*-

from django.db import models


class Hostgroup(models.Model):
    group_id = models.AutoField(primary_key=True)
    groupname = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'hostgroup'
