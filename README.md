# MyCMDB
## 简介
该项目主要是运维人员对服务器的管理工具，目前主要功能有书签、资产管理（主机管理和账号管理）、webssh、集成zabbix，集成邮件接收（只支持IMAP协议），功能有待完善...<br/>
项目为前后端分离模式，前端采用LayUI2.X框架，后端基于Django (2.1.4)构建
## 运行环境
- linux系统
- python3.6+
- nginx
- redis
- mysql5.6
## 效果截图
![登录页](http://py0u41dsf.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20190918175300.png)
![主页](http://py0u41dsf.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20190918180131.png)
## 部署
将python/mycmdb.sql导入数据库，修改python/mycmdb/settings.py中的mysql配置信息和redis配置信息
### 安装依赖模块
```bash
cd python
pip3 install -r requriment.txt
```
### 运行webssh
```bash
nohup wssh --address=127.0.0.1 --port=8888 >>wssh.nohup &
```
### 运行python代码
nohup python3 manage.py runserver >>cmdb.nohup &
### 修改api地址
将html/login.html中的`layui.data('api', {key: 'url',value: "http://192.168.1.80:8000/api/"});`的value改为服务器或域名
### 配置nginx
```bash
server {
    listen       80;
    server_name  localhost; #域名

    #charset utf8;  
    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root  /opt/mycmdbweb;   #html代码路径
        index  index.html index.htm;
    }
    location /api/ {
        proxy_pass  http://127.0.0.1:8000;
    }
    location /ssh/ {
        proxy_pass http://127.0.0.1:8888/;
        proxy_http_version 1.1;
        proxy_read_timeout 300;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Real-PORT $remote_port;
    }
}
```
