# -*- coding: utf-8 -*-

from django.shortcuts import render, HttpResponse
from cmdb.models.hostgroupmodels import Hostgroup
from cmdb.models.hostmodels import Host
import json
from datetime import datetime
from cmdb.models.acountmodels import Account, Accountinhost, Role, Servertype, Accountingroup
import base64


def groupsGet(requests):
    if requests.method == "GET":
        groups = Hostgroup.objects.all()
        if requests.GET.get('t') is None:
            data = [{"id": 1, "title": "所有主机",
                     "checkArr": "0", "parentId": 0}]
            for g in groups:
                data.append({"id": g.group_id + 1, "title": g.groupname,
                             "checkArr": "0", "parentId": 1})
            data.append({"id": -1, "title": "未分组",
                         "checkArr": "0", "parentId": 1})
            return HttpResponse(json.dumps({"status": {"code": 200, "message": "操作成功"}, "data": data}))
        else:
            data = []
            for g in groups:
                data.append({"id": g.group_id, "groupname": g.groupname})
            return HttpResponse(json.dumps(data))


def groupUpdate(requests):
    if requests.method == "POST":
        if requests.POST["id"] not in ["-1", "1"]:
            group_id = int(requests.POST["id"]) - 1
            groupname = requests.POST["title"]
            try:
                group = Hostgroup.objects.get(group_id=group_id)
                group.groupname = groupname
                group.save()
                data = {"code": 0,
                        "msg": "修改成功！"}

            except Exception as e:
                data = {"code": 1,
                        "msg": "该主机组不存在"}
        else:
            data = {"code": 1,
                    "msg": "该分组不可被修改！"}
        return HttpResponse(json.dumps(data))


def groupAdd(requests):
    if requests.method == "POST":
        groupname = requests.POST["title"]
        try:
            Hostgroup.objects.get(groupname=groupname)
            data = "该主机组已存在！"

        except Exception as e:
            Hostgroup.objects.create(groupname=groupname)
            data = "主机组：" + groupname + " 已添加！"
        return HttpResponse(data)


def groupDel(requests):
    if requests.method == "POST":
        if requests.POST["id"] not in ["-1", "1"]:
            group_id = int(requests.POST["id"]) - 1
            try:
                group = Hostgroup.objects.get(group_id=group_id)
                title = group.groupname
                hosts = Host.objects.filter(group=group_id).update(group=0)
                group.delete()
                data = {"code": 0,
                        "msg": title + "已删除！"}

            except Exception as e:
                Hostgroup.objects.create(groupname=groupname)
                data = {"code": 1,
                        "msg": "该主机组不存在！"}
        else:
            data = {"code": 1,
                    "msg": "该组不可删除！"}
        return HttpResponse(json.dumps(data))


def hostsGet(requests):
    if requests.method == "GET":
        page = int(requests.GET.get("page"))
        limit = int(requests.GET.get("limit"))
        group_id = requests.GET.get("id")
        data = []
        if group_id == "all" or group_id == "1":
            hosts = Host.objects.all()[(page - 1) * limit:page * limit]
            for h in hosts:
                data.append(hostdictTo(h))

            total = len(Host.objects.values_list("id"))
        elif group_id == "-1":
            hosts = Host.objects.filter(group=0)
            total = len(hosts)
            if total != 0:
                for h in hosts[(page - 1) * limit:page * limit]:
                    data.append(hostdictTo(h))
        else:
            hosts = Host.objects.filter(group=int(group_id) - 1)
            total = len(hosts)
            if total != 0:
                for h in hosts[(page - 1) * limit:page * limit]:
                    data.append(hostdictTo(h))
        return HttpResponse(json.dumps({
            "code": 0,
            "msg": "",
            "count": total,
            "data": data}))


def hostsDel(requests):
    hostids = json.loads(requests.POST['hostsid'])
    hosts = Host.objects.filter(id__in=hostids)
    ips = []
    for h in hosts:
        ips.append(h.ip)
    hosts.delete()
    hostinAccount("del", ips)

    return HttpResponse("ok")


def hostsgroupUpdate(requests):
    if requests.method == "POST":
        hostsid = json.loads(requests.POST["hostsid"])
        groupid = json.loads(requests.POST["group"])
        hosts = Host.objects.filter(id__in=hostsid)
        hosts.update(group=groupid)
        ips = []
        for h in hosts:
            ips.append(h.ip)
        hostinAccount("del", ips)
        if groupid != 0:
            aigs = Accountingroup.objects.filter(hostgroupid=groupid)
            if len(aigs) != 0:
                for aig in aigs:
                    for ip in ips:
                        Accountinhost.objects.create(accountid=aig.accountid, address=ip)

        return HttpResponse("ok")


def hostsSearch(requests):
    if requests.method == "GET":
        field = requests.GET.get("field")
        text = requests.GET.get("text")
        if field == "hostname":
            hosts = Host.objects.filter(hostname__icontains=text)
        elif field == "ip":
            hosts = Host.objects.filter(ip__icontains=text)
        elif field == "system":
            hosts = Host.objects.filter(system__icontains=text)
        elif field == "machineroom":
            hosts = Host.objects.filter(machineroom__icontains=text)
        data = []
        if len(hosts) != 0:
            for h in hosts:
                data.append(hostdictTo(h))
        return HttpResponse(json.dumps(data))


def hostAdd(requests):
    if requests.method == "POST":
        if requests.POST['hostname'] is not None:
            hostname = requests.POST['hostname']
        else:
            hostname = ""
        if requests.POST['system'] is not None:
            system = requests.POST['system']
        else:
            system = ""
        if requests.POST['cpu'] is not None:
            cpu = requests.POST['cpu']
        else:
            cpu = ""
        if requests.POST['memory'] is not None:
            memory = requests.POST['memory']
        else:
            memory = ""
        if requests.POST['disk'] is not None:
            disk = requests.POST['disk']
        else:
            disk = ""
        if requests.POST['network'] is not None:
            network = requests.POST['network']
        else:
            network = ""
        if requests.POST['machineroom'] is not None:
            machineroom = requests.POST['machineroom']
        else:
            machineroom = ""
        if requests.POST['remark'] is not None:
            remark = requests.POST['remark']
        else:
            remark = ""
        rundate = datetime.strptime(requests.POST['rundate'], '%Y-%m-%d %H:%M:%S')
        group = requests.POST['group']
        ip_text = requests.POST['ip'].split('..')
        if len(ip_text) == 1:
            Host.objects.create(hostname=hostname, ip=requests.POST['ip'], system=system, cpu=cpu, memory=memory,
                                disk=disk, network=network, machineroom=machineroom, group=group, rundate=rundate, remark=remark)
            hostinAccount("add", requests.POST['ip'], group)
        elif len(ip_text) == 2:
            ips = ip_text[0].split(".")
            pre = ips[0] + "." + ips[1] + "." + ips[2]
            for i in range(int(ips[-1]), int(ip_text[1]) + 1):

                Host.objects.create(hostname=hostname, ip=pre + "." + str(i), system=system, cpu=cpu, memory=memory,
                                    disk=disk, network=network, machineroom=machineroom, group=group, rundate=rundate, remark=remark)
                hostinAccount("add", pre + "." + str(i), group)
        return HttpResponse("ok")


def hostUpdate(requests):
    if requests.method == "POST":
        fd = requests.POST["fd"]
        v = requests.POST["v"]
        host_id = requests.POST["id"]
        host = Host.objects.get(id=host_id)
        if fd == "hostname":
            host.hostname = v
        elif fd == "ip":
            host.ip = v
        elif fd == "system":
            host.system = v
        elif fd == "cpu":
            host.cpu = v
        elif fd == "memory":
            host.memory = v
        elif fd == "disk":
            host.disk = v
        elif fd == "network":
            host.network = v
        elif fd == "machineroom":
            host.machineroom = v
        elif fd == "remark":
            host.remark = v
        host.save()
        return HttpResponse("ok")


def hostSsh(requests):
    if requests.method == "GET":
        hostid = requests.GET.get("hostid")
        ip = Host.objects.get(id=hostid).ip
        accounts = Accountinhost.objects.filter(address=ip).values("accountid")

        if len(accounts) != 0:
            acs = []
            for aid in list(accounts):
                ac = Account.objects.get(id=aid["accountid"])
                if int(ac.servertype) == 0:
                    ah = {
                        "ip": ip,
                        "username": ac.username,
                        "passwd": base64.b64encode(ac.password.encode('utf-8')).decode("utf-8"),
                        "port": ac.port}
                    acs.append(ah)
            data = {"exist": 1, "data": acs}
        else:
            data = {"exist": 0, "data": {"ip": ip}
                    }
        return HttpResponse(json.dumps(data))


def hostdictTo(host):
    try:
        group = Hostgroup.objects.get(group_id=host.group).groupname
    except Exception as e:
        group = ""
    data = {"id": host.id,
            "hostname": host.hostname,
            "ip": host.ip,
            "system": host.system,
            "cpu": host.cpu,
            "memory": host.memory,
            "disk": host.disk,
            "network": host.network,
            "machineroom": host.machineroom,
            "group": group,
            "rundate": str(host.rundate).split("+")[0],
            "remark": host.remark}
    return data


def hostinAccount(opt, ip, groupid=None):

    if opt == "add":
        aig = Accountingroup.objects.filter(hostgroupid=groupid)
        if len(aig) != 0:
            for a in aig:
                aid = a.accountid
                Accountinhost.objects.get_or_create(accountid=aid, address=ip)
    elif opt == "del":
        Accountinhost.objects.filter(address__in=ip).delete()
