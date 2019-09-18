# coding:utf-8

from django.shortcuts import render, HttpResponse, render_to_response
from cmdb.recmail import MAIL
import json
from cmdb.models.emailmodels import Emailcfg


def emailIsConf(requests):
    if requests.method == "GET":
        emcfg = Emailcfg.objects.all()
        if len(emcfg) == 1:
            data = "true"
        else:
            data = "false"
    else:
        data = "error"
    return HttpResponse(data)


def emailfoldersGet(requests):
    mail = MAIL()
    return HttpResponse(mail.emfolder)


def emailGet(requests):
    page = requests.GET.get('page')
    folder = requests.GET.get('folder')
    limit = requests.GET.get('limit')
    mail = MAIL()
    if folder == "unread":
        data = mail.emailUnseen()
    else:
        data = mail.emailReceive(folder, int(page), int(limit))
    return HttpResponse(json.dumps({
        "code": 0,
        "msg": "",
        "count": data["total"],
        "data": data["emails"][::-1]}))


def emailSet(requests):
    em_id = requests.GET.get('em_id')
    em_folder = requests.GET.get('em_folder')
    mail = MAIL()
    re = mail.emailSetSeen(em_id, em_folder)
    return HttpResponse(re)
