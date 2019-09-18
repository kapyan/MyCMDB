from pyzabbix import ZabbixAPI
from cmdb.models.zabbixmodels import Zabbixcfg
import time
import datetime


class Host(object):
    """docstring for Host"""

    def __init__(self, hostid):
        super(Host, self).__init__()
        self.hostid = hostid
        zx_cfg = Zabbixcfg.objects.all()[0]
        self.zapi = ZabbixAPI(url=zx_cfg.url, user=zx_cfg.user, password=zx_cfg.passwd)

    def historyGet(self, item_name, key, afterdate=None, befordate=None, dateformat="%H:%M"):
        items = self.zapi.do_request("item.get",
                                     {'hostids': self.hostid,
                                      'search': {"key_": key},
                                      }
                                     )
        history = list()

        for item in items['result']:
            if befordate is None:
                his_data = self.zapi.do_request('history.get',
                                                {
                                                    "history": item['value_type'],
                                                    "itemids": item['itemid'],
                                                    "sortfield": "clock",
                                                    "time_from": afterdate,
                                                    "limit": 1000

                                                })
            else:
                his_data = self.zapi.do_request('history.get',
                                                {
                                                    "history": item['value_type'],
                                                    "itemids": item['itemid'],
                                                    "sortfield": "clock",
                                                    "time_from": befordate,
                                                    "time_till": afterdate

                                                })
            dates = list()
            values = list()
            for his in his_data['result']:
                timeArray = time.localtime(int(his['clock']))
                t = time.strftime(dateformat, timeArray)
                dates.append(t)
                if item_name == 'memory':
                    values.append(int(his['value']))
                elif item_name == 'cpu':
                    values.append(float(his['value']))
                elif item_name == 'disk':
                    values.append(float(his['value']))
                values.append(float(his['value']))
            history.append({'item': item['name'], 'data': {'time': dates, 'value': values}})
        if len(history) == 0:
            return 'null'
        data = {'id': self.hostid, 'history': history}
        return data
