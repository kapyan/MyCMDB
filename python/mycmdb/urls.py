"""mycmdb URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from cmdb.views.settingview import settingPage
from cmdb.views.zabbixview import monitorPage, host_historyGet
from cmdb.views.emailview import emailfoldersGet, emailGet, emailSet, emailIsConf
from cmdb.views.login import login, logout, userUpdate, avatarUpdate, loginCheck
from cmdb.views.indexview import bookmarkAdd, bookmarkDel, bookmarksGet
from cmdb.views.hostsview import groupsGet, groupUpdate, groupAdd, groupDel, hostsGet, hostsDel, hostsgroupUpdate, hostsSearch, hostAdd, hostUpdate, hostSsh
from cmdb.views.accountview import accountAdd, accountGet, accountDel, accountSearch
urlpatterns = [
    path('api/login', login),
    path('api/logout', logout),
    path('api/checklogin', loginCheck),
    path('api/updateuser', userUpdate),
    path('api/updateavatar', avatarUpdate),
    path('api/addbookmark', bookmarkAdd),
    path('api/delbookmark', bookmarkDel),
    path('api/getbookmarks', bookmarksGet),
    path('api/monitor', monitorPage),
    path('api/getemailfolders', emailfoldersGet),
    path('api/isemconf', emailIsConf),
    path('api/getemail', emailGet),
    path('api/setmailseen', emailSet),
    path('api/setting', settingPage),
    path('api/host_historyGet', host_historyGet),
    path('api/hostgroups', groupsGet),
    path('api/updategroup', groupUpdate),
    path('api/addgroup', groupAdd),
    path('api/delgroup', groupDel),
    path('api/gethosts', hostsGet),
    path('api/delhosts', hostsDel),
    path('api/movehostgroup', hostsgroupUpdate),
    path('api/searchhosts', hostsSearch),
    path('api/addhosts', hostAdd),
    path('api/updatehost', hostUpdate),
    path('api/hostssh', hostSsh),
    path('api/addaccount', accountAdd),
    path('api/getaccount', accountGet),
    path('api/delaccount', accountDel),
    path('api/searchaccount', accountSearch)
]
