#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.shortcuts import render, render_to_response, HttpResponse, HttpResponseRedirect
from cmdb.models.usermodels import User
import json
from datetime import datetime
from cmdb.tools.token import generate_token
from django_redis import get_redis_connection


def login(requests):
    if requests.method == "POST":
        username = requests.POST['username']
        password = requests.POST['password']
        try:
            # 获取用户成功
            user = User.objects.get(username=username)
            if password == user.password:
                # 密码认证成功，生成token
                token = generate_token(username)
                # token存入redis缓存
                redis_con = get_redis_connection("default")
                redis_con.set(token, username, 3600)
                data = {
                    'status': 'success',
                    'userinfo': {'username': user.username,
                                 'avatar': user.avatar, 'desc': user.desc, 'token': token}
                }
            else:
                # 密码认证失败
                data = {
                    'status': 'fail',
                    'msg': '密码错误'}
        # 获取用户失败
        except Exception as e:
            data = {
                'status': 'fail',
                'msg': '用户不存在'}
        finally:
            return HttpResponse(json.dumps(data))


def logout(requests):
    token = requests.META.get("token")
    redis_con = get_redis_connection("default")
    redis_con.delete(token)
    return HttpResponseRedirect('ok')


def userUpdate(requests):
    if requests.method == "POST":
        oldusername = requests.POST['oldusername']
        username = requests.POST['username']
        desc = requests.POST['desc']
        user = User.objects.get(username=oldusername)
        # 判断用户名是否相同
        if oldusername != username:
            user.username = username
        # 判断是否更改密码
        updatepw = requests.POST.getlist('isupdatepw')
        if len(updatepw) == 1:
            user.password = requests.POST['password']

        user.desc = desc
        # # 保存用户更新
        user.save()
        return HttpResponse("用户信息修改成功！")
    else:
        return HttpResponse("error")


def avatarUpdate(requests):
    file = requests.FILES.get("useravatar", None)
    username = requests.POST['username']

    if file is not None:
        user = User.objects.get(username=username)
        path = requests.POST['path']
        filename = datetime.now().strftime("%Y%m%d%H%M%S") + "_" + file.name
        with open(path + filename, 'w+b') as f:
            for chunk in file.chunks():
                f.write(chunk)
        user.avatar = "/upload/" + filename
        user.save()
        data = {
            "code": 0, "msg": "", "data": {
                "src": "/upload/" + filename
            }
        }
    return HttpResponse(json.dumps(data))


def loginCheck(requests):
    data = {"status": "ok"}
    return HttpResponse(json.dumps(data))
