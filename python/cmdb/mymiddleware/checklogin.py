# !/usr/bin/env python
# -*- coding: utf-8 -*-
from django.shortcuts import HttpResponse
from cmdb.tools.token import certify_token
from django_redis import get_redis_connection
import json

try:
    from django.utils.deprecation import MiddlewareMixin  # Django 1.10.x
except ImportError:
    MiddlewareMixin = object  # Django 1.4.x - Django 1.9.x

'''非法请求拦截中间件
    如果token验证失败，则拦截请求
'''


class checkloginMiddleware(MiddlewareMixin):
    def process_request(self, requests):
        if requests.path != '/api/login':
            try:
                token = requests.META.get("HTTP_TOKEN")
                redis_con = get_redis_connection("default")
                user = str(redis_con.get(token), encoding="utf-8")
                if certify_token(user, token):
                    pass
                else:
                    return HttpResponse(json.dumps({"status": "Authentication failure"}))
            except Exception as e:
                return HttpResponse(json.dumps({"status": "Authentication failure"}))
