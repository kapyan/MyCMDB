layui.config({ //此处路径请自行处理, 可以使用绝对路径
}).extend({
	formSelects: '/static/lib/formSelects-v4/formSelects-v4'
});
layui.use(['element', 'form', 'upload', 'jquery', 'formSelects'], function() {
	var api = layui.data('api').url;
	var element = layui.element;
	var form = layui.form;
	var $ = layui.$;
	var formSelects = layui.formSelects;
	var upload = layui.upload;
	setcfg = () => {
		$.ajax({
				url: api + 'setting',
				type: 'GET',
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				//zabbix表单赋值
				form.val('zabbix', {
					"url": data.zbcfg.url,
					"username": data.zbcfg.username // "name": "value"
						,
					"password": data.zbcfg.passwd
				});
				if (data.emcfg.imap_ssl == "True") {
					data.emcfg.imap_ssl = true
				} else {
					data.emcfg.imap_ssl = false
				}
				form.val('email', {
					"imap_url": data.emcfg.imap_url,
					"imap_port": data.emcfg.imap_port,
					"imap_ssl": data.emcfg.imap_ssl,
					"email": data.emcfg.email,
					"emailpwd": data.emcfg.empasswd
				})
				formSelects.data('selectfolder', 'local', {
					arr: JSON.parse(data.emcfg.allemfolder)
				});
				formSelects.value('selectfolder', JSON.parse(data.emcfg.emfolder), true);
				if (data.emcfg.imap_url != "") {
					$('#em_save').attr({
						class: 'layui-btn',
						disabled: false
					});
				}
			})
	}
	setcfg();
	//用户表单赋值
	form.val('user', {
		"oldusername": layui.data("user").userinfo.username,
		"username": layui.data("user").userinfo.username // "name": "value"
			,
		"desc": layui.data("user").userinfo.desc
	})
	$("#user-avatar").attr('src', layui.data("user").userinfo.avatar).css({
		width: '50px',
		height: '50px'
	});
	$("#user-avatar").attr('onerror', "this.src='../upload/defaulavatar.jpg'");
	//头像上传
	var uploadInst = upload.render({
		elem: '#upload-avatar',
		url: api + 'updateavatar',
		headers: {
			'token': layui.data("user").userinfo.token
		},
		data: {
			'username': layui.data("user").userinfo.username,
			'path': 'E:\\mycmdbweb\\upload\\'
		},
		size: 200,
		field: "useravatar",
		before: function(obj) {
			//预读本地文件示例，不支持ie8
			obj.preview(function(index, file, result) {
				$('#user-avatar').attr('src', result); //图片链接（base64）
			});
		},
		done: function(res) {
			//如果上传失败
			if (res.code > 0) {
				return layer.msg('头像上传失败！', {
					offset: 't',
				});
			}
			//上传成功
			layer.msg("头像上传成功！", {
				offset: 't',
			})
		},
		error: function(index, upload) {
			layer.closeAll('loading'); //关闭loading
		}
	});
	//用户信息表单提交
	form.on('submit(userupdate)', function(data) {
		$.ajax({
				url: api + 'updateuser',
				type: 'POST',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				layer.msg(data, {
					offset: 't',
				});
			})
		return false;
	});

	//显示密码表单
	form.on('switch(is_updatepw)', function(data) {
		if (this.checked) {
			$(".password").html('<label class="layui-form-label">密码：</label><div class="layui-input-block"><input type="password" name="password" autocomplete="off" placeholder="请输入密码" class="layui-input" id="pwd" required  lay-verType="tips" lay-verify="required|password" lay-reqText="请填写密码"></div>')
			$(".repassword").html('<label class="layui-form-label">密码：</label><div class="layui-input-block"><input type="password" name="repassword" autocomplete="off" placeholder="请输入密码" class="layui-input" required  lay-verType="tips" lay-verify="required|password|repassword" lay-reqText="请再次填写密码"></div>')
			form.render(null, 'userupdate');
		} else {
			$(".password").empty()
			$(".repassword").empty()
		}
	});
	//自定义表单验证规则
	form.verify({
		username: function(value, item) { //value：表单的值、item：表单的DOM对象
				if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
					return '用户名不能有特殊字符';
				}
				if (/(^\_)|(\__)|(\_+$)/.test(value)) {
					return '用户名首尾不能出现下划线\'_\'';
				}
				if (/^\d+\d+\d$/.test(value)) {
					return '用户名不能全为数字';
				}
			}

			//数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
			,
		password: [
			/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'
		],
		repassword: function(value) {
			var pwd = $("#pwd").val();
			if (!new RegExp(pwd).test(value)) {
				return '两次输入的密码不一致';
			}
		}
	});

	//zabbix配置
	form.on('submit(zabbix_test)', function(data) {
		data.field.bttype = "test";
		$.ajax({
				url: api + 'setting',
				type: 'POST',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				if (data.code == 0) {

					$('#zb_save').attr({
						class: 'layui-btn',
						disabled: false
					});
				} else {
					$('#zb_save').attr({
						class: 'layui-btn layui-disabled ',
						disabled: 'disabled'
					});
				}
				layer.msg(data.msg, {
					offset: 't',
				});
			})
		return false;
	});
	form.on('submit(zabbix_save)', function(data) {
		data.field.bttype = "save";
		$.ajax({
				url: api + 'setting',
				type: 'POST',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				layer.msg(data, {
					offset: 't',
				});
			})
		return false;
	});

	//监听ssl选择
	form.on('checkbox(is_ssl)', function(data) {
		if (data.elem.checked) {
			$('#imapport').val("993");
		} else {
			$('#imapport').val("143");
		}
	});
	form.on('submit(email_test)', function(data) {
		data.field.bttype = "test";
		$.ajax({
				url: api + 'setting',
				type: 'POST',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				if (data.code == 0) {
					$('#em_save').attr({
						class: 'layui-btn',
						disabled: false
					});
					formSelects.data('selectfolder', 'local', {
						arr: data.folders
					});
				} else {
					$('#em_save').attr({
						class: 'layui-btn layui-disabled ',
						disabled: 'disabled'
					});
				}
				layer.msg(data.msg, {
					offset: 't',
				});
			})
		return false;
	});
	form.on('submit(email_save)', function(data) {
		data.field.bttype = "save";
		$.ajax({
				url: api + 'setting',
				type: 'POST',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				layer.msg(data, {
					offset: 't',
				});
			})
		return false;
	});

	$("#refresh").click(function() {
		self.location.reload();
	});
	//刷新
	$('body').on("mouseenter mouseleave", "#refresh", function(event) {　　
		if (event.type == "mouseenter") {　　　　
			index = layer.tips('刷新', $(this), {
				tips: 2,
				time: 0
			});　　
		} else if (event.type == "mouseleave") {　　　　
			layer.close(index);　　
		};
	})
});