layui.config({ //此处路径请自行处理, 可以使用绝对路径
}).extend({
	dtree: '/static/lib/dtree/dtree'
});
layui.use(['element', 'form', 'jquery', 'table'], function() {
	var api = layui.data('api').url;
	var element = layui.element;
	var form = layui.form;
	var $ = layui.$;

	var table = layui.table;

	//收件夹
	getemailfolders = () => {
		$.ajax({
				url: api + 'getemailfolders',
				type: 'GET',
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				$.each(data, function(index, val) {
					$("#indox").append('<li class="layui-nav-item" style="line-height:2"><a class="folder" href="javascript:;"><i class="fa fa-folder" aria-hidden="true"> </i> ' + val + '</a></li>')
				});
			})
	}
	//未读邮件表格
	unreademaillist = (emails) => {
		table.render({
			elem: '#emails',
			data: emails,
			page: true, //开启分页
			toolbar: '#makremail',
			defaultToolbar: [],
			cols: [
				[ //表头
					{
						type: 'checkbox',
						fixed: 'left'
					}, {
						field: 'em_id',
						title: 'ID',
						width: 20,
						sort: true,
						hide: true
					}, {
						field: 'em_sub',
						title: '主题',
						width: "40%"
					}, {
						field: 'em_from',
						title: '发件人',
						width: "30%",
					}, {
						field: 'em_date',
						title: '时间',

						width: "15%"
					}, {
						fixed: 'right',
						align: 'center',
						toolbar: '#showcontext'

					}
				]
			],
			//toolbar: true,	//工具栏
			loading: true,
			title: "邮件",
			skin: "line ",
			even: true

		});

	}
	//标记已读按钮
	table.on('toolbar(emails)', function(obj) {
		console.log(obj);
		var checkStatus = table.checkStatus(obj.config.id);
		switch (obj.event) {
			case 'markread':
				var data = checkStatus.data;
				if (data.length != 0) {
					layer.msg("已将" + data.length + "封邮件标记为已读!", {
						offset: 't',
					});
					$.each(data, function(index, val) {
						$.ajax({
								url: api + "setmailseen",
								type: 'GET',
								headers: {
									'token': layui.data("user").userinfo.token,
								},

								data: {
									"em_id": val.em_id,
									"em_folder": val.em_folder
								}
							})
							.done(function(data) {
								if (data == "success") {
									//真的成功！
								}
							})
					});
				} else {
					layer.msg("请先选择邮件！", {
						offset: 't',
					});
				}
				break;
		};
	});
	getunreadmail = () => {
		var emails = layui.data('unreademail').emails;
		if (emails.length != 0) {
			$(".unreadnum").remove();
			$("#unread").append('<span class="layui-badge unreadnum">' + emails.length + '</span>');
			$(".head-folder").html("未读邮件");
			unreademaillist(emails);
		} else {
			$("#unread").children("span").remove();
			unreademaillist(emails);
		}
	}

	getunreadmail();

	$("body").on('click', '.folder', function() {

		var folder = $(this).text();
		$('.layui-nav-item').attr("class", "layui-nav-item");
		$('.folder').attr("style", "black");
		$(this).parent().attr("class", "layui-nav-item layui-bg-blue");
		$(this).attr("style", "color:#fff");
		$('.head-folder').html(folder);
		if ($(this).attr("id") != "unread") {
			table.render({
				elem: '#emails',
				method: "GET",
				//height: 312,
				url: api + "getemail", //数据接口
				where: {
					"folder": folder.replace(/^\s*/, ""), //替换左侧空格
				},
				page: true, //开启分页
				headers: {
					'token': layui.data("user").userinfo.token,
				},
				cols: [
					[ //表头
						{
							field: 'em_id',
							title: 'ID',
							width: 20,
							sort: true,
							hide: true
						}, {
							field: 'em_sub',
							title: '主题',

							width: "40%"
						}, {
							field: 'em_from',
							title: '发件人',

							width: "30%",
						}, {
							field: 'em_date',
							title: '时间',

							width: "15%"
						}, {
							fixed: 'right',
							align: 'center',
							toolbar: '#showcontext'

						}
					]
				],
				//toolbar: true,	//工具栏
				loading: true,
				title: "邮件",
				skin: "line ",
				even: true

			});
		} else {
			getunreadmail();
		}
		/* Act on the event */
	});


	//查看按钮
	table.on('tool(emails)', function(obj) {
		var data = obj.data;
		if (obj.event === 'detail') {
			layer.open({
				type: 1,
				title: "邮件：" + data.em_sub,
				content: '<div class="layui-card-body">' + data.em_context + '</div>',
				area: ['50%', '60%'],
				offset: '10%',
				maxmin: true,


			})
		}
	});

	$.ajax({
			url: api + "isemconf",
			type: 'GET',
			headers: {
				'token': layui.data("user").userinfo.token,
			},
		})
		.done(function(data) {
			if (data == "true") {
				getemailfolders();
			} else {
				layer.msg("邮件未配置，请先配置邮件信息...", {
					offset: 't',
				});
			}
		})


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