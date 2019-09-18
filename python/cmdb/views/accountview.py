# -*- coding: utf-8 -*-

from django.shortcuts import render, HttpResponse
from cmdb.models.hostgroupmodels import Hostgroup
from cmdb.models.hostmodels import Host
from cmdb.models.acountmodels import Account, Accountinhost, Role, Servertype, Accountingroup
import json


def accountAdd(requests):
    if requests.method == "POST":
        servertype = requests.POST["servertype"]
        role = requests.POST["role"]
        username = requests.POST["username"]
        password = requests.POST["password"]
        ingroup = requests.POST["ingroup"]
        inhost = requests.POST["inhost"]
        inport = requests.POST["inport"]
        account = Account.objects.create(servertype=servertype, role=role, username=username,
                                         password=password, port=inport)
        if ingroup != "":
            groups = ingroup.split(',')
            for g in groups:
                Accountingroup.objects.get_or_create(accountid=account.id, hostgroupid=int(g))
                hosts = Host.objects.filter(group=g)
                for h in hosts:
                    Accountinhost.objects.create(accountid=account.id, address=h.ip)
        if inhost != "":
            hosts = inhost.split(',')
            for h in hosts:
                Accountinhost.objects.create(accountid=account.id, address=h)
        return HttpResponse("ok")


def accountGet(requests):
    if requests.method == "GET":
        page = int(requests.GET.get("page"))
        limit = int(requests.GET.get("limit"))
        cout = len(Accountinhost.objects.values_list("id"))
        ainhs = Accountinhost.objects.all()[(page - 1) * limit:page * limit]
        data = []
        if len(ainhs) != 0:
            for a in ainhs:
                data.append(accountList(a))
        return HttpResponse(json.dumps({
            "code": 0,
            "msg": "",
            "count": cout,
            "data": data}))


def accountDel(requests):
    if requests.method == "POST":
        ih_ids = requests.POST['ih_id']
        opt = requests.POST["opt"]
        if opt == "1":
            Accountinhost.objects.filter(id__in=json.loads(ih_ids)).delete()
        elif opt == "2":
            for id in json.loads(ih_ids):
                try:
                    ih = Accountinhost.objects.get(id=id)
                    ah_id = ih.accountid
                    Accountingroup.objects.filter(accountid=ah_id).delete()
                    Account.objects.filter(id=ah_id).delete()
                    Accountinhost.objects.filter(accountid=ah_id).delete()

                except Exception as e:
                    pass
                continue
        return HttpResponse("ok")


def accountSearch(requests):
    if requests.method == "GET":
        field = requests.GET.get("field")
        text = requests.GET.get("text")
        aihs = Accountinhost.objects.filter(address__icontains=text)
        data = []
        if len(aihs) != 0:
            for a in aihs:
                data.append(accountList(a))
        return HttpResponse(json.dumps(data))


def accountList(ainh):
    act = Account.objects.get(id=ainh.accountid)
    username = act.username
    role = Role.objects.get(value=act.role).rolename
    servertype = Servertype.objects.get(value=act.servertype).servername
    data = {"id": ainh.id, "username": username, "role": role,
            "servertype": servertype, "address": ainh.address, "port": act.port}

    return data
