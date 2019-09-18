# coding:utf-8
from django.shortcuts import render, render_to_response, HttpResponse
from cmdb.models.zabbixmodels import Zabbixcfg
from cmdb.models.emailmodels import Emailcfg
from pyzabbix import ZabbixAPI
from cmdb.recmail import MAIL
from django.utils.safestring import mark_safe
from imapclient import IMAPClient
import ssl
import json
from django_redis import get_redis_connection
# Create your views here.


def settingPage(requests):

    if requests.method == "POST":
        if requests.POST['setting'] == "zabbix":
            url = requests.POST['url']
            user = requests.POST['username']
            passwd = requests.POST['password']
            if requests.POST['bttype'] == "test":
                try:
                    zapi = ZabbixAPI(url=url, user=user, password=passwd)
                    v = zapi.api_version()
                    data = {'code': 0,
                            'msg': '连接zabbix成功！版本:%s。请保存...' % v}

                except Exception as e:
                    data = {'code': 1,
                            'msg': 'zabbix测试连接失败！请检查...'}
                finally:
                    return HttpResponse(json.dumps(data))

            elif requests.POST['bttype'] == "save":
                if len(Zabbixcfg.objects.all()) == 0:
                    Zabbixcfg.objects.get_or_create(url=url, user=user, passwd=passwd)

                else:
                    zx_cfg = Zabbixcfg.objects.all()[0]
                    zx_cfg.url = url
                    zx_cfg.user = user
                    zx_cfg.passwd = passwd
                    zx_cfg.save()
                return HttpResponse('zabbix连接信息已成功保存！')
        elif requests.POST['setting'] == "email":
            imap_url = requests.POST['imap_url']
            imap_port = requests.POST['imap_port']
            if len(requests.POST.getlist('imap_ssl')) == 0:
                imap_ssl = False
            else:
                imap_ssl = True
            eamil_add = requests.POST['email']
            empasswd = requests.POST['emailpwd']
            # if requests.POST['emfolder'] == "":
            #     emfolder = ""
            # else:
            #     emfolder = requests.POST['emfolder']

            if requests.POST['bttype'] == "test":
                try:
                    if imap_ssl:
                        context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
                        server = IMAPClient(imap_url, port=imap_port,
                                            use_uid=True, ssl=True, ssl_context=context)
                    else:
                        server = IMAPClient(imap_url, port=imap_port, use_uid=True, ssl=False)

                    server.login(eamil_add, empasswd)
                    folders = server.list_folders()
                    all_folders = list()
                    server.logout()
                    for f in folders:
                        if f[-1] not in ['已发送', '草稿', '已删除邮件']:
                            all_folders.append({"name": f[-1], "value": f[-1]})
                    redis_con = get_redis_connection("default")
                    redis_con.set("emailfolders", json.dumps(all_folders))
                    data = {'code': 0,
                            'msg': '连接email接收服务器成功！请选择文件夹...',
                            'folders': all_folders}
                    # return HttpResponse('email连接测试成功！请保存...')
                except Exception as e:
                    data = {'code': 1,
                            'msg': '连接email接收服务器失败！',
                            }
                finally:

                    return HttpResponse(json.dumps(data))
            elif requests.POST['bttype'] == "save":
                redis_con = get_redis_connection("default")
                allemfolder = redis_con.get("emailfolders")
                if len(Emailcfg.objects.all()) == 0:
                    Emailcfg.objects.get_or_create(imap_url=imap_url, imap_port=imap_port,
                                                   imap_ssl=imap_ssl, email=eamil_add, empasswd=empasswd, emfolder=json.dumps(
                                                       requests.POST.getlist("em_folder")[0].split(",")))
                else:
                    em_cfg = Emailcfg.objects.all()[0]
                    em_cfg.imap_url = imap_url
                    em_cfg.imap_port = imap_port
                    em_cfg.imap_ssl = imap_ssl
                    em_cfg.email = eamil_add
                    em_cfg.empasswd = empasswd
                    em_cfg.allemfolder = bytes.decode(allemfolder)
                    em_cfg.emfolder = json.dumps(requests.POST.getlist("em_folder")[0].split(","))
                    em_cfg.save()
                return HttpResponse('email收件信息保存成功!')
    elif requests.method == "GET":
        try:
            zbs = Zabbixcfg.objects.all()
            if len(zbs) != 0:
                zbcfg = {
                    'url': zbs[0].url,
                    'username': zbs[0].user,
                    'passwd': zbs[0].passwd
                }
            else:
                zbcfg = {
                    'url': "",
                    'username': "",
                    'passwd': ""
                }

            emails = Emailcfg.objects.all()
            if len(emails) != 0:
                emcfg = {
                    'imap_url': emails[0].imap_url,
                    'imap_port': emails[0].imap_port,
                    'imap_ssl': emails[0].imap_ssl,
                    'email': emails[0].email,
                    'empasswd': emails[0].empasswd,
                    'emfolder': emails[0].emfolder,
                    'allemfolder': emails[0].allemfolder
                }
            else:
                emcfg = {
                    'imap_url': "",
                    'imap_port': "",
                    'imap_ssl': "",
                    'email': "",
                    'empasswd': "",
                    'emfolder': ""
                }
            return HttpResponse(json.dumps({"zbcfg": zbcfg, "emcfg": emcfg}))
        except Exception as e:
            return HttpResponse(json.dumps("error"))
