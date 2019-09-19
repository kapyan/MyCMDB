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
### 安装依赖模块
```bash
cd python
pip3 install -r requriment.txt
```

