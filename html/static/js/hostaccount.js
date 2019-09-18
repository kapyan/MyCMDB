layui.config({ //此处路径请自行处理, 可以使用绝对路径
}).extend({
	formSelects: '/static/lib/formSelects-v4/formSelects-v4',
});
layui.use(['element', 'form', 'jquery', 'laydate', 'table', 'formSelects'], function() {
	var api = layui.data('api').url;
	var element = layui.element;
	var $ = layui.$;
	var form = layui.form;
	var formSelects = layui.formSelects;
	var table = layui.table;
	var flag = 0;

	//新建页面
	$(".newaccount").click(function(event) {


		layer.open({
			type: 1,
			title: "新建账号",
			// content: ['addbookmark.html','no'], //这里content是一个普通的String
			//content: $(".addform").html(),
			content: ` <div class="layui-card-body" style="width: 80%">
  <form class="layui-form addhost" lay-filter="addaccountform">
    <br>
     <div class="layui-form-item">
        <label class="layui-form-label">类型：</label>
        <div class="layui-input-block">
            <select name="servertype" lay-verify="required" lay-search="" lay-filter="stype">
              <option value=0>服务器</option>
              <option value=1>MySQL</option>
              <option value=2>Redis</option>
              <option value=3>Mongodb</option>
            </select>
          </div>
    </div>
     <div class="opt2">
       <div class="layui-form-item">
          <label class="layui-form-label">用户角色：</label>
            <div class="layui-input-block">
              <select name="role" lay-verify="required" lay-search="">
                <option value="0">超级用户</option>
                <option value="1">普通用户</option>
              </select>
            </div>
       </div>
    <div class="layui-form-item name">
        <label class="layui-form-label">用户名：</label>
        <div class="layui-input-block">
            <input type="text" name="username"  autocomplete="off" placeholder="请输入用户名" class="layui-input" required  lay-verType="tips" lay-verify="required" lay-reqText="请填写用户名">
        </div>
    </div>
  </div>
    <div class="layui-form-item">
        <label class="layui-form-label">密码：</label>
        <div class="layui-input-block">
            <input type="password" name="password"  autocomplete="off" placeholder="请输入密码" class="layui-input pwd" required  lay-verType="tips" lay-verify="required" lay-reqText="请填写密码"><a href="javascript:;" class="pwdst" style="position: absolute;top:10px;right: 8px;"><i class="fa fa-eye-slash" aria-hidden="true"></i></a>
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">关联主机组：</label>
        <div class="layui-input-block">
            <select name="ingroup" xm-select="selectgroup" xm-select-skin="normal" xm-select-search="">
            </select>
          </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label">关联IP(域名)：</label>
        <div class="layui-input-block">
            <textarea class="layui-textarea" name="inhost" autocomplete="off" placeholder="请输入ip或域名，多个用英文逗号,隔开" class="layui-input"></textarea>
        </div>

  </div>

    <div class="layui-form-item">
        <label class="layui-form-label">关联端口号：</label>
        <div class="layui-input-block">
            <input type="number" name="inport" autocomplete="off" placeholder="请输入端口号" class="layui-input inport" required  lay-verType="tips" lay-verify="required|port" lay-reqText="请填写端口号" value="22">
          </div>
    </div><br><br>
    <div class="layui-form-item">
      <div class="layui-input-block">
          <button class="layui-btn" type="button" lay-submit lay-filter="addaccout">添加</button>
          <button type="reset" class="layui-btn layui-btn-primary">重置</button>
      <div>
    </div>
  </form>
 </div>`,
			area: ['650px'], //大小
			//offset: '50px', //top坐标
			skin: 'layui-layer-molv',
			anim: '3', //弹出动画
			success: function(layero, index) {
				$.ajax({
						url: api + 'hostgroups',
						type: 'GET',
						data: {
							"t": "select"
						},
						headers: {
							'token': layui.data("user").userinfo.token,
						},
						async: false,
					})
					.done(function(data) {
						var data = JSON.parse(data),
							ss = [];
						$.each(data, function(index, val) {
							ss.push({
								"name": val.groupname,
								"value": val.id
							})
						});
						formSelects.data('selectgroup', 'local', {
							arr: ss
						});

					})
				form.render();
			}
		});

		$(".pwdst").click(function(event) {
			if (flag == 0) {
				$(".pwdst").html('<i class="fa fa-eye" aria-hidden="false"></i>')
				$(".pwd").attr({
					type: 'text',
				});
				flag = 1
			} else {
				$(".pwdst").html('<i class="fa fa-eye-slash" aria-hidden="true"></i>')
				$(".pwd").attr({
					type: 'password',
				});
				flag = 0
			}
		});

		form.on('select(stype)', function(data) {

			if (data.value == 0) {
				$(".inport").val(22);
			} else if (data.value == 1) {
				$(".inport").val(3306);
			} else if (data.value == 3) {
				$(".inport").val(27017);
			}

			if (data.value == 2) {
				$(".opt2").empty();
				$(".inport").val(6637);
			} else {
				var text = '<div class="layui-form-item"><label class="layui-form-label">用户角色：</label><div class="layui-input-block"><select name="userrole" lay-verify="required" lay-search=""><option value="0">超级用户</option><option value="1">普通用户</option></select></div></div><div class="layui-form-item name"><label class="layui-form-label">用户名：</label><div class="layui-input-block"><input type="text" name="username"  autocomplete="off" placeholder="请输入用户名" class="layui-input" required  lay-verType="tips" lay-verify="required" lay-reqText="请填写用户名"></div></div></div>'
				$(".opt2").html(text);

			}

			form.render();

		});
		form.on('submit(addaccout)', function(data) {
			$.ajax({
					url: api + 'addaccount',
					type: 'POST',
					data: data.field,
					async: false,
					headers: {
						'token': layui.data("user").userinfo.token,
					},
				})
				.done(function(data) {
					layer.msg("添加成功！", {
						"offset": 1
					});
					showaccounts();
				})
			return false
		})
	});


	form.on('submit(searchaccount)', function(data) {
		$.ajax({
				url: api + 'searchaccount',
				type: 'GET',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				table.render({
					elem: '#accounts',
					data: data,
					page: true, //开启分页
					toolbar: '#accounttoolbar',
					cols: [
						[ //表头
							{
								type: 'checkbox',
								fixed: 'left'
							}, {
								field: 'id',
								title: 'id',
								hide: true,
								width: "5%"
							}, {
								field: 'username',
								title: '用户名',
								sort: true,
								width: "15%"

							}, {
								field: 'role',
								title: '角色',
								sort: true,
								width: "15%"
							}, {
								field: 'servertype',
								title: '服务类型',
								sort: true,
								width: "20%"
							}, {
								field: 'address',
								title: '关联IP或域名',
								sort: true,
								width: "35%"
							}, {
								field: 'port',
								title: '关联端口',
								sort: true,

							}
						]
					],
					//toolbar: true,	//工具栏
					loading: true,
					title: "账号列表",
					skin: "line ",
					even: true

				});
				table.on('toolbar(accounts)', function(obj) {
					var checkStatus = table.checkStatus(obj.config.id);
					switch (obj.event) {
						case 'delih':
							var data = checkStatus.data;
							if (data.length != 0) {
								layer.confirm('确定删除所选的' + data.length + '个关联主机？', {
									btn: ['确定', '取消'] //按钮
								}, function() {
									var hostsid = [];
									$.each(data, function(index, val) {
										hostsid.push(val.id);
									});
									$.ajax({
											url: api + 'delaccount',
											type: 'POST',
											headers: {
												'token': layui.data("user").userinfo.token,
											},
											data: {
												"ih_id": JSON.stringify(hostsid),
												"opt": "1"
											},
										})
										.done(function() {

											layer.msg("删除成功！", {
												offset: 't',
											});
											showaccounts()
										})

								});

							} else {
								layer.msg("选择账号为空！", {
									offset: 't',
								});
							}
							break;
						case 'delah':
							var data = checkStatus.data;
							if (data.length != 0) {
								layer.confirm('确定删除所选的账号及关联主机', {
									btn: ['确定', '取消'] //按钮
								}, function() {
									var hostsid = [];
									$.each(data, function(index, val) {
										hostsid.push(val.id);
									});
									$.ajax({
											url: api + 'delaccount',
											type: 'POST',
											headers: {
												'token': layui.data("user").userinfo.token,
											},
											data: {
												"ih_id": JSON.stringify(hostsid),
												"opt": "2"
											},
										})
										.done(function() {

											layer.msg("删除成功！", {
												offset: 't',
											});
											showaccounts()
										})

								});

							} else {
								layer.msg("选择账号为空！", {
									offset: 't',
								});
							}
							break;
					};
				});

			})
		return false
	})


	form.verify({
		port: [
			/^[1-9]|[1-9]\\d{3}|[1-6][0-5][0-5][0-3][0-5]$/, '介于1-65535之间'
		],
	});

	showaccounts = () => {
		table.render({
			elem: '#accounts',
			method: "GET",
			// //height: 312,
			url: api + "getaccount", //数据接口
			page: true, //开启分页
			toolbar: '#accounttoolbar',
			headers: {
				'token': layui.data("user").userinfo.token,
			},
			//toolbar: '#makremail',
			//defaultToolbar: [],
			cols: [
				[ //表头
					{
						type: 'checkbox',
						fixed: 'left'
					}, {
						field: 'id',
						title: 'id',
						hide: true,
						width: "5%"
					}, {
						field: 'username',
						title: '用户名',
						sort: true,
						width: "15%"

					}, {
						field: 'role',
						title: '角色',
						sort: true,
						width: "15%"
					}, {
						field: 'servertype',
						title: '服务类型',
						sort: true,
						width: "20%"
					}, {
						field: 'address',
						title: '关联IP或域名',
						sort: true,
						width: "35%"
					}, {
						field: 'port',
						title: '关联端口',
						sort: true,

					}
				]
			],
			//toolbar: true,	//工具栏
			loading: true,
			title: "账号列表",
			skin: "line ",
			even: true

		});
		table.on('toolbar(accounts)', function(obj) {
			var checkStatus = table.checkStatus(obj.config.id);
			switch (obj.event) {
				case 'delih':
					var data = checkStatus.data;
					if (data.length != 0) {
						layer.confirm('确定删除所选的' + data.length + '个关联主机？', {
							btn: ['确定', '取消'] //按钮
						}, function() {
							var hostsid = [];
							$.each(data, function(index, val) {
								hostsid.push(val.id);
							});
							$.ajax({
									url: api + 'delaccount',
									type: 'POST',
									headers: {
										'token': layui.data("user").userinfo.token,
									},
									data: {
										"ih_id": JSON.stringify(hostsid),
										"opt": "1"
									},
								})
								.done(function() {

									layer.msg("删除成功！", {
										offset: 't',
									});
									showaccounts()
								})

						});

					} else {
						layer.msg("选择账号为空！", {
							offset: 't',
						});
					}
					break;
				case 'delah':
					var data = checkStatus.data;
					if (data.length != 0) {
						layer.confirm('确定删除所选的账号及关联主机', {
							btn: ['确定', '取消'] //按钮
						}, function() {
							var hostsid = [];
							$.each(data, function(index, val) {
								hostsid.push(val.id);
							});
							$.ajax({
									url: api + 'delaccount',
									type: 'POST',
									headers: {
										'token': layui.data("user").userinfo.token,
									},
									data: {
										"ih_id": JSON.stringify(hostsid),
										"opt": "2"
									},
								})
								.done(function() {

									layer.msg("删除成功！", {
										offset: 't',
									});
									showaccounts()
								})

						});

					} else {
						layer.msg("选择账号为空！", {
							offset: 't',
						});
					}
					break;
			};
		});

	}
	showaccounts();

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
})