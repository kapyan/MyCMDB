layui.config({ //此处路径请自行处理, 可以使用绝对路径
}).extend({
	dtree: '/static/lib/dtree/dtree'
});
layui.use(['element', 'form', 'jquery', 'laydate', 'dtree',
	'table'
], function() {
	var api = layui.data('api').url;
	var element = layui.element;
	var form = layui.form;
	var $ = layui.$;
	var dtree = layui.dtree;
	var table = layui.table;
	var laydate = layui.laydate;

	//主机列表显示
	showhosts = (id) => {
		table.render({
			elem: '#hosts',
			method: "GET",
			//height: 312,
			url: api + "gethosts", //数据接口
			where: {
				"id": id,
			},
			page: true, //开启分页
			toolbar: '#hosttoolbar',
			headers: {
				'token': layui.data("user").userinfo.token,
			},
			page: true, //开启分页
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
						width: "3%"
					}, {
						field: 'hostname',
						title: '主机名',
						edit: 'text',
						sort: true,

					}, {
						field: 'ip',
						title: 'IP地址',
						edit: 'text',
						sort: true,
						width: "12%"
					}, {
						field: 'system',
						title: '操作系统',
						edit: 'text',
						sort: true,
						width: "8%"
					}, {
						field: 'cpu',
						title: 'CPU型号*核数',
						edit: 'text',
						sort: true,
						width: "12%"
					}, {
						field: 'memory',
						title: '内存',
						edit: 'text',
						sort: true,
					}, {
						field: 'disk',
						title: '磁盘空间',
						edit: 'text',
						sort: true,
					}, {
						field: 'network',
						title: '流量带宽',
						edit: 'text',
						sort: true,
					}, {
						field: 'machineroom',
						title: '机房',
						edit: 'text',
						sort: true,
						hide: true,
						width: "10%"
					}, {
						field: 'rundate',
						title: '上架时间',
						sort: true,
						hide: true,
						width: "14%"
					}, {
						field: 'group',
						title: '分组',
						sort: true,
						hide: true,
						width: "5%"
					}, {
						field: 'remark',
						title: '备注',
						edit: 'text',
						sort: true,
						width: "12%"
					}, {
						fixed: 'right',
						align: 'center',
						toolbar: '#optbar',
						width: "5%"
					}
				]
			],
			//toolbar: true,	//工具栏
			loading: true,
			title: "资产列表",
			skin: "line ",
			even: true

		});

	}
	//远程访问按钮监听
	table.on('tool(hosts)', function(obj) {
		var data = obj.data;
		if (obj.event === 'ssh') {
			//layer.msg('ID：' + data.id + ' 的远程操作');
			var id = data.id;
			$.ajax({
					url: api + 'hostssh',
					type: 'GET',
					data: {
						"hostid": id
					},
					headers: {
						'token': layui.data("user").userinfo.token,
					},
				})
				.done(function(data) {
					var data = JSON.parse(data)
					if (data.exist == "1") {
						if (data.data.length > 1) {
							var ss = "";

							$.each(data.data, function(index, val) {
								console.log(val.username);
								ss = ss + '<option value="' + index + '">' + val.username + '</option>'
							});
							var ssh_from = `<form class="layui-form move">
									    <br><br><br>
									    <div class="layui-form-item">
									    	<label class="layui-form-label">选择用户：</label>
									    	<div class="layui-input-inline">
									       		<select name="sshindex" lay-verify="required" lay-search="">
									       		  ${ss}
									       		</select>
									      	</div>
										</div>
										<div class="layui-form-item">
										    <div class="layui-input-block">
											  	<button class="layui-btn" lay-submit lay-filter="sshuser">确定</button>
											</div>
										</div>
									</form>`;

							layer.open({
								type: 1,
								title: "远程用户选择",
								area: ['500px', '300px'],
								content: ssh_from, //这里content是一个普通的String
								success: function(layero, index) {
									form.render();
								}
							});
						} else {
							var sshinfo = data.data[0];
							var url = "/ssh/?hostname=" + sshinfo.ip
							var formdata = {
								"port": sshinfo.port,
								"username": sshinfo.username,
								"password": sshinfo.passwd
							}
							window.open("/ssh/?hostname=" + sshinfo.ip + "&port=" + sshinfo.port + "&username=" + sshinfo.username + "&password=" + sshinfo.passwd);
						}
					} else {
						window.open("/ssh/?hostname=" + data.data.ip);
					}
					//window.open("http://172.24.4.19/ssh/?hostname=172.24.4.19&username=root&password=MTIzNDU2Cg==")
					form.on('submit(sshuser)', function(userdata) {
						var sshinfo = data.data[userdata.field.sshindex]
						window.open("/ssh/?hostname=" + sshinfo.ip + "&port=" + sshinfo.port + "&username=" + sshinfo.username + "&password=" + sshinfo.passwd)
						return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
					});
				})
		}
	});
	//获取当前时间
	nowdate = () => {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
			" " + date.getHours() + seperator2 + date.getMinutes() +
			seperator2 + date.getSeconds();
		return currentdate
	}
	//编辑主机
	table.on('edit(hosts)', function(obj) {
		var value = obj.value //得到修改后的值
			,
			data = obj.data //得到所在行所有键值
			,
			field = obj.field; //得到字段
		$.ajax({
				url: api + "updatehost",
				type: 'POST',
				async: false,
				data: {
					"fd": field,
					"v": value,
					"id": data.id
				},
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function() {
				layer.msg("修改成功！");
			})
	});
	//主机组显示
	var DTree = dtree.render({
		elem: "#hostgrouptree",
		url: api + "hostgroups",
		method: "GET",
		headers: {
			'token': layui.data("user").userinfo.token,
		},
		dataFormat: "list", //配置data的风格为list
		ficon: "-1", // 隐藏一级图标
		initLevel: "2",
		skin: "laySimple",
		menubar: true,
		toolbar: true, // 开启工具栏
		scroll: "#toolbarDiv", // 工具栏绑定div
		record: true,
		width: "20px",
		//toolbarShow: [], // 工具栏自带的按钮制空
		toolbarStyle: {
			title: "主机组",
			area: ["50%", "80%"]
		},
		toolbarFun: {
			loadToolbarBefore: function(buttons, param, $div) {
				if (param.nodeId == 1 || param.nodeId == -1) {
					buttons.delToolbar = "";
					buttons.editToolbar = "";
				}
				if (param.leaf) { // 如果是叶子节点
					buttons.addToolbar = ""; // 取消新增功能
				}
				return buttons; // 将按钮对象返回
			},
			addTreeNode: function(treeNode, $div) {

				var title = treeNode.addNodeName;
				$.ajax({
					type: "post",
					data: {
						"title": title
					},
					url: api + "addgroup",
					headers: {
						'token': layui.data("user").userinfo.token,
					},
					success: function(result) {
						layer.msg(result);
						DTree.changeTreeNodeAdd("refresh"); // 添加成功，局部刷新树
					}

				});
			},
			editTreeNode: function(treeNode, $div) {
				var id = treeNode.nodeId;
				var title = treeNode.editNodeName;
				$.ajax({
					type: "post",
					data: {
						"id": id,
						"title": title
					},
					url: api + "updategroup",
					headers: {
						'token': layui.data("user").userinfo.token,
					},
					success: function(result) {
						var data = JSON.parse(result);
						layer.msg(data.msg);
					}
				});
			},
			delTreeNode: function(treeNode, $div) {
				//console.log(treeNode);
				var id = treeNode.nodeId;
				$.ajax({
					type: "post",
					data: {
						"id": id
					},
					url: api + "delgroup",
					headers: {
						'token': layui.data("user").userinfo.token,
					},
					success: function(result) {
						var data = JSON.parse(result);
						if (data.code == 0) {
							DTree.changeTreeNodeDel(true); // 删除成功
							$(".group").html('<h3><b><font color="#2894FF">未分组:</font></b></h3>');
							showhosts('-1');
						}

						layer.msg(data.msg);
					},
				});
			}
		},
		nodeIconArray: {
			"3": {
				"open": "dtree-icon-fuxuankuang-banxuan",
				"close": "dtree-icon-fuxuankuang-banxuan"
			}
		}, // 		自定扩展的二级非最后一级图标，从1开始
		leafIconArray: {
			"11": "dtree-icon-fuxuankuang-banxuan"
		}, // 自定义扩展的二级最后一级图标，从11开始
		icon: ["3", "11"], // 使用
		menubarTips: {
			toolbar: [], // 指定工具栏吸附的menubar按钮
			group: [] // 按钮组制空
		},
		done: function(data, obj) {
			$("#search_btn").unbind("click");
			$("#search_btn").click(function() {
				var value = $("#searchInput").val();
				if (value) {
					var flag = DTree.searchNode(value); // 内置方法查找节点
					if (!flag) {
						layer.msg("该组不存在！", {
							icon: 5
						});
					}
				} else {
					DTree.menubarMethod().refreshTree(); // 内置方法刷新树
				}
			});
		},

	});
	//主机列表头工具栏事件
	table.on('toolbar(hosts)', function(obj) {
		var checkStatus = table.checkStatus(obj.config.id);
		switch (obj.event) {
			case 'delhosts':
				var data = checkStatus.data;
				if (data.length != 0) {
					layer.confirm('确定删除所选的' + data.length + '个主机？', {
						btn: ['确定', '取消'] //按钮
					}, function() {
						var hostsid = [];
						$.each(data, function(index, val) {
							hostsid.push(val.id);
						});
						$.ajax({
								url: api + 'delhosts',
								type: 'POST',
								headers: {
									'token': layui.data("user").userinfo.token,
								},
								data: {
									"hostsid": JSON.stringify(hostsid)
								},
							})
							.done(function() {

								layer.msg("删除成功！", {
									offset: 't',
								});
								showhosts($(".group").attr("id"));
							})

					});

				} else {
					layer.msg("选择主机为空！", {
						offset: 't',
					});
				}
				break;
			case 'movehosts':
				var data = checkStatus.data;
				if (data.length != 0) {

					var hostsid = [];
					$.each(data, function(index, val) {
						hostsid.push(val.id);
					});
					var group_select;
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
							var data = JSON.parse(data);
							$.each(data, function(index, val) {
								group_select = group_select + `<option value="${val.id}">${val.groupname}</option>`
							});

						})

					var movefrom = `<form class="layui-form move">
									    <br><br><br>
									    <div class="layui-form-item">
									    	<label class="layui-form-label">分组：</label>
									    	<div class="layui-input-inline">
									       		<select name="group" lay-verify="required" lay-search="">
									       		  <option value="">直接选择或搜索选择</option>
									       		  <option value="0">未分组</option>
									       		  ${group_select}
									       		</select>
									      	</div>
										</div>
										<div class="layui-form-item">
										    <div class="layui-input-block">
											  	<button class="layui-btn" lay-submit lay-filter="movehostsgroup">移动</button>
											  	<button type="reset" class="layui-btn layui-btn-primary">重置</button>
											</div>
										</div>
									</form>`;
					layer.open({
						type: 1,
						title: "移动分组至",
						// content: ['addbookmark.html','no'], //这里content是一个普通的String
						content: movefrom,
						area: ['380px', '500px'], //大小
						offset: '50px', //top坐标
						skin: 'layui-layer-molv',
						anim: '2', //弹出动画
						success: function(layero, index) {
							form.render();
						}
					});
					//监听分组提交
					form.on('submit(movehostsgroup)', function(data) {
						data.field.hostsid = JSON.stringify(hostsid);
						$.ajax({
								url: api + 'movehostgroup',
								type: 'POST',
								data: data.field,
								async: false,
								headers: {
									'token': layui.data("user").userinfo.token,
								},
							})
							.done(function(data) {
								layer.msg("移动成功！", {
									offset: 't',
								});
								layer.closeAll('page');
								showhosts($(".group").attr("id"));
							})
						return false;
					});

				} else {
					layer.msg("选择主机为空！", {
						offset: 't',
					});
				}
				break;
			case 'addhost':
				var group_select;
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
						var data = JSON.parse(data);
						$.each(data, function(index, val) {
							group_select = group_select + `<option value="${val.id}">${val.groupname}</option>`
						});

					})
				var addfrom = `<div class="layui-card-body" style="width:80%">
									<form class="layui-form addhost layui-col-md-offset1">
										<br>
									     <div class="layui-form-item layui-form-text">
    										<label class="layui-form-label">主机名:</label>
    										<div class="layui-input-block">
									       		<input type="text" name="hostname"  autocomplete="off" placeholder="请输入主机名" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">IP地址：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="ip"  autocomplete="off" placeholder="请输入ip地址" class="layui-input" required  lay-verType="tips" lay-verify="required|ip" lay-reqText="请填写ip地址">
												<div class="layui-form-mid layui-word-aux"><small>连续ip用".."隔开，如:192.168.1.1..100</small></div>
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">操作系统：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="system" autocomplete="off" placeholder="请输入操作系统类型" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">CPU*核数：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="cpu" autocomplete="off" placeholder="请输入cpu型号及核数" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">内存：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="memory" autocomplete="off" placeholder="请输入内存大小" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">磁盘空间：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="disk" autocomplete="off" placeholder="请输入磁盘空间大小" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">流量带宽：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="network" autocomplete="off" placeholder="请输入流量带宽大小" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">机房：</label>
									    	<div class="layui-input-block">
									       		<input type="text" name="machineroom" autocomplete="off" placeholder="请输入机房信息" class="layui-input">
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">上架时间：</label>
									    	<div class="layui-input-block">
									       		<input type="text" class="layui-input" name="rundate" id="sjdate" placeholder="yyyy-MM-dd HH:mm:ss" required  lay-verType="tips" lay-verify="required" lay-reqText="请选择时间">
									      	</div>
										</div>
									    <div class="layui-form-item">
									    	<label class="layui-form-label">主机组：</label>
									    	<div class="layui-input-block">
									       		<select name="group" lay-verify="required" lay-search="">
									       		  <option value="0">未分组</option>
									       		  ${group_select}
									       		</select>
									      	</div>
										</div>
										<div class="layui-form-item">
									    	<label class="layui-form-label">备注：</label>
									    	<div class="layui-input-block">
									       		<textarea placeholder="请输入备注内容" class="layui-textarea" name="remark"></textarea>
									      	</div>
										</div>
										<div class="layui-form-item">
											<div class="layui-input-block">
											  	<button class="layui-btn" lay-submit lay-filter="addhosts">添加</button>
											  	<button type="reset" class="layui-btn layui-btn-primary">重置</button>
											<div>
										</div>
									</form>
									</div>`;
				layer.open({
					type: 1,
					title: "添加主机",
					// content: ['addbookmark.html','no'], //这里content是一个普通的String
					content: addfrom,
					area: ['650px', '100%'], //大小
					//offset: '50px', //top坐标
					skin: 'layui-layer-molv',
					anim: '3', //弹出动画
					success: function(layero, index) {
						form.render();
						laydate.render({
							elem: '#sjdate',
							type: 'datetime',
							trigger: 'click',
							max: nowdate(),
							value: nowdate(),
						});
					}
				});

				break;
		};
	});

	//主机组点击
	dtree.on("node('hostgrouptree')", function(obj) {
		var id = obj.param.nodeId;
		var groupname = obj.param.context;
		$(".group").html('<h3><b><font color="#2894FF">' + groupname + ':</font></b></h3>');
		$(".group").attr({
			"id": id,
			"title": groupname
		});
		showhosts(id);

	});
	//首次加载显示所有主机
	showhosts('all');


	//监听搜索提交
	form.on('submit(searchhosts)', function(data) {
		$.ajax({
				url: api + 'searchhosts',
				type: 'GET',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				$(".group").html('<h3><b><font color="#2894FF">查询结果：</font></b></h3>');
				$(".group").attr({
					"id": 1,
				});
				table.render({
					elem: '#hosts',
					page: true, //开启分页
					toolbar: '#hosttoolbar',
					data: data,
					page: true, //开启分页
					cols: [
						[ //表头
							{
								type: 'checkbox',
								fixed: 'left'
							}, {
								field: 'id',
								title: 'id',
								hide: true,
								width: "3%"
							}, {
								field: 'hostname',
								title: '主机名',
								edit: 'text',
								sort: true,

							}, {
								field: 'ip',
								title: 'IP地址',
								edit: 'text',
								sort: true,
								width: "12%"
							}, {
								field: 'system',
								title: '操作系统',
								edit: 'text',
								sort: true,
								width: "8%"
							}, {
								field: 'cpu',
								title: 'CPU型号*核数',
								edit: 'text',
								sort: true,
								width: "12%"
							}, {
								field: 'memory',
								title: '内存',
								edit: 'text',
								sort: true,
							}, {
								field: 'disk',
								title: '磁盘空间',
								edit: 'text',
								sort: true,
							}, {
								field: 'network',
								title: '流量带宽',
								edit: 'text',
								sort: true,
							}, {
								field: 'machineroom',
								title: '机房',
								edit: 'text',
								sort: true,
								hide: true,
								width: "10%"
							}, {
								field: 'rundate',
								title: '上架时间',
								sort: true,
								hide: true,
								width: "14%"
							}, {
								field: 'group',
								title: '分组',
								sort: true,
								width: "5%",
								hide: true,
							}, {
								field: 'remark',
								title: '备注',
								edit: 'text',
								sort: true,
								width: "12%"
							},
						]
					],
					//toolbar: true,	//工具栏
					loading: true,
					title: "资产列表",
					skin: "line ",
					even: true

				});
			})
		return false;
	});
	//监听主机添加
	form.on('submit(addhosts)', function(data) {
		$.ajax({
				url: api + 'addhosts',
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
				})
			})
		return false
	})

	form.verify({
		ip: [
			/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, 'IP地址不符合规则'
		]
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


})