from django.shortcuts import render, HttpResponse, render_to_response
from pyzabbix import ZabbixAPI
from cmdb.models.zabbixmodels import Zabbixcfg
import json
import datetime
import time
from cmdb.host import Host


def monitorPage(requests):
    if requests.method == "POST":
        try:
            zx_cfg = Zabbixcfg.objects.all()[0]
            zapi = ZabbixAPI(url=zx_cfg.url, user=zx_cfg.user, password=zx_cfg.passwd)
            hostgroups = zapi.do_request('hostgroup.get', {'real_hosts': 0})
            treedata = []
            total = 0
            for group in hostgroups['result']:
                hosts = zapi.do_request('host.get',
                                        {
                                            'groupids': group['groupid']
                                        })
                n = len(hosts['result'])
                total = total + n
                treedata.append({"id": group['groupid'], "title": group['name'],
                                 "checkArr": "0", "parentId": "1", "childrennum": n})
                for host in hosts['result']:
                    treedata.append({"id": host['hostid'], "title": host['host'],
                                     "checkArr": "0", "parentId": group['groupid']})
            treedata.insert(0, {"id": 1, "title": "所有主机", "checkArr": "0", "parentId": "0", "childrennum": total})
            return HttpResponse(json.dumps({"status": {"code": 200, "message": "操作成功"}, "data": treedata}))
        except Exception as e:
            return HttpResponse(json.dumps([]))

    elif requests.method == "GET":
        try:
            zx_cfg = Zabbixcfg.objects.all()[0]
            data = {"code": 0}
        except Exception as e:
            data = {"code": 1, "msg": "Zabbix未配置，请在设置中配置Zabbix相关信息..."}
        return HttpResponse(json.dumps(data))


def host_historyGet(requests):
    if requests.method == "GET":
        start_time = requests.GET.get("start_time")
        end_time = requests.GET.get("end_time")
        date = (datetime.datetime.now() + datetime.timedelta(hours=-2))
        date = int(time.mktime(date.timetuple()))
        keys = ['vfs.fs', 'vm.memory', 'system.cpu']
        hostid = requests.GET.get('id')
        item = requests.GET.get('item')
        ht = Host(hostid)
        if end_time == "" and start_time == "":
            if item == 'memory':
                data = ht.historyGet(item, "vm.memory", date)
            elif item == 'cpu':
                data = ht.historyGet(item, "system.cpu", date)
            elif item == 'disk':
                date = (datetime.datetime.now() + datetime.timedelta(minutes=-2))
                date = int(time.mktime(date.timetuple()))
                data = ht.historyGet(item, "vfs.fs.size", date)
            elif item == 'network':
                data = ht.historyGet(item, "net.if", date)
        else:
            end_time = int(end_time) / 1000
            start_time = int(start_time) / 1000
            if item == 'memory':
                data = ht.historyGet(item, "vm.memory", end_time, start_time, "%m/%d %H:%M")
            elif item == 'cpu':
                data = ht.historyGet(item, "system.cpu", end_time, start_time, "%m/%d %H:%M")
            elif item == 'disk':
                #date = (datetime.datetime.now() + datetime.timedelta(minutes=-2))
                #date = int(time.mktime(date.timetuple()))
                data = ht.historyGet(item, "vfs.fs.size", end_time, start_time, "%m/%d %H:%M")
            elif item == 'network':
                data = ht.historyGet(item, "net.if", end_time, start_time, "%m/%d %H:%M")

        if data == 'null':
            return HttpResponse(data)

        return HttpResponse(json.dumps(data))
