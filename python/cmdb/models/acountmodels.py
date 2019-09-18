from django.db import models


class Account(models.Model):
    servertype = models.IntegerField()
    role = models.IntegerField()
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    port = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'account'


class Role(models.Model):
    rolename = models.CharField(max_length=255)
    value = models.IntegerField(unique=True)

    class Meta:
        managed = False
        db_table = 'role'


class Servertype(models.Model):
    servername = models.CharField(max_length=255)
    value = models.IntegerField(unique=True)

    class Meta:
        managed = False
        db_table = 'servertype'


class Accountinhost(models.Model):
    accountid = models.IntegerField()
    address = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'accountinhost'


class Accountingroup(models.Model):
    id = models.IntegerField(primary_key=True)
    accountid = models.IntegerField()
    hostgroupid = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'accountingroup'
