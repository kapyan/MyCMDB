layui.use(['element', 'form', 'table'], function() {
	var $ = layui.$
	var element = layui.element;
	var api = layui.data('api').url;
	var user = layui.data("user");
	var form = layui.form;
	var table = layui.table;
	layui.data('unreademail', {
		key: 'emails',
		value: []
	});
	if (JSON.stringify(user) == "{}") {
		location.href = "login.html";
		return false;
	}
	$("#user-avatar").attr("src", user.userinfo.avatar);
	$("#user-name").text(user.userinfo.username);
	$("#logout").click(function(event) {
		//$.get('');
		layui.data("user", null);
		location.href = "login.html";
	});


	$("#userinfo").click(function() {
		$("#context").attr("src", "pages/setting.html");
	});
	//左边菜单栏内容点击展示
	$("#dashboard").click(function() {
		$("#context").attr("src", "pages/dashboard.html");
	});
	$("#hosts").click(function() {
		$("#context").attr("src", "pages/hosts.html");
	});
	$("#hostaccount").click(function() {
		$("#context").attr("src", "pages/hostaccount.html");
	});
	$("#monitor").click(function() {
		$("#context").attr("src", "pages/monitor.html");
	});
	$("#email").click(function() {
		$("#context").attr("src", "pages/email.html");
	});
	$("#setting").click(function() {
		$("#context").attr("src", "pages/setting.html");
	});
	checktoken();
	setInterval(function() {
		checktoken();
	}, 300000);

	function checktoken() {
		$.ajax({
				url: api + "checklogin",
				type: 'GET',
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				if (data.status == "Authentication failure") {
					layer.msg("登录超时,即将跳转至登录页...", {
						offset: 't',
					});
					setTimeout(function() {
						location.href = "login.html";
					}, 3000)
				}
			})
	}
	$.ajax({
			url: api + "isemconf",
			type: 'GET',
			headers: {
				'token': layui.data("user").userinfo.token,
			},
		})
		.done(function(data) {
			if (data == "true") {
				getunreademail();
				setInterval(function() {
					getunreademail();
				}, 5000)
			}
		})
	getunreademail = () => {
		$.ajax({
				url: api + "getemail",
				type: 'GET',
				headers: {
					'token': layui.data("user").userinfo.token,
				},

				data: {
					"folder": "unread"
				}
			})
			.done(function(data) {
				var data = JSON.parse(data);
				layui.data('unreademail', {
					key: 'emails',
					value: data.data
				});
				if (data.data.length != 0) {
					$(".unread").html('<span class="layui-badge-dot"></span>')
					$(".emailtip").remove();
					$(".unread").parent().parent().append('<dl class="layui-nav-child emailtip"><dd><a href="javascript:;">未读邮件(' + data.data.length + ')</a></dd><div style="width:230px;"><table class="layui-hide" id="unreademail" lay-filter="unreademail"></table></div></dl>');
					table.render({
						elem: '#unreademail',
						data: data.data,
						//page: true, //开启分页
						cols: [
							[ //表头
								{
									field: 'em_sub',
									width: '100%',
									title: "主题"

								}
							]
						],
						skin: "nob",
					});

				} else {
					$(".unread").empty();
					$(".emailtip").remove();
					$(".unread").parent().parent().append('<dl class="layui-nav-child emailtip"><dd><a href="javascript:;">未读邮件(暂无)</a></dd></dl>');

				}
			})
	}



	table.on('row(unreademail)', function(obj) {
		var tb = `<div class="layui-card-body"><table class="layui-table">
  <colgroup>
    <col width="50">
    <col width="300">
  </colgroup>
  <tbody>
    <tr>
      <td><b>发件人：</b></td>
      <td>${obj.data.em_from[1]}</td>
    </tr>
    <tr>
      <td><b>收件人：</b></td>
      <td>${obj.data.em_to[1]}</td>
    </tr>
    <tr>
      <td><b>时间：</b></td>
      <td>${obj.data.em_date}</td>
    </tr>
    <tr>
      <td colspan="2"><b>正文：</b><br/><br/><br/>
      ${obj.data.em_context}
      </td>
    </tr>
  </tbody>
</table>
</div>
`
		layer.open({
			type: 1,
			title: `未读邮件：<b>${obj.data.em_sub}</b>`,
			// content: obj.data.em_context,
			content: tb,
			area: ['50%', '65%'],
			offset: '10%',
			maxmin: true,
			btn: ['标记为已读'],
			yes: function(index, layero) {
				layer.msg("已标记为已读!"); //先给个提示
				$.ajax({
						url: api + "setmailseen",
						type: 'GET',
						headers: {
							'token': layui.data("user").userinfo.token,
						},

						data: {
							"em_id": obj.data.em_id,
							"em_folder": obj.data.em_folder
						}
					})
					.done(function(data) {
						if (data == "success") {
							//真的成功！
						}
					})
			}
		});
	});

});