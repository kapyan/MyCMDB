layui.config({ //此处路径请自行处理, 可以使用绝对路径
}).extend({
	dtree: '/static/lib/dtree/dtree'
});
layui.use(['element', 'form', 'jquery', 'laydate', 'dtree'], function() {

	var api = layui.data('api').url;
	var element = layui.element;
	var form = layui.form;
	var $ = layui.$;
	var laydate = layui.laydate;
	var dtree = layui.dtree;
	var timer;
	var items = ['memory', 'cpu', 'disk', 'network'];
	var daterange = getNowFormatDate()

	//获取时间区间
	function getNowFormatDate() {
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
		var weekdate = getBeforeDate(7) + " " + date.getHours() + seperator2 + date.getMinutes() +
			seperator2 + date.getSeconds();
		return [weekdate, currentdate];
	}
	//获取n天前时间
	function getBeforeDate(n) {
		var n = n;
		var d = new Date();
		var year = d.getFullYear();
		var mon = d.getMonth() + 1;
		var day = d.getDate();
		if (day <= n) {
			if (mon > 1) {
				mon = mon - 1;
			} else {
				year = year - 1;
				mon = 12;
			}
		}
		d.setDate(d.getDate() - n);
		year = d.getFullYear();
		mon = d.getMonth() + 1;
		day = d.getDate();
		s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
		return s;
	}
	//时间字符串转时间戳(毫秒级)
	function timeStamp(datetime) {
		datetime = datetime.substring(0, 19);
		datetime = datetime.replace(/-/g, '/');
		var timestamp = new Date(datetime).getTime();
		return timestamp
	}
	//主机属性菜单

	$.ajax({
			async: false,
			url: api + "monitor",
			type: 'GET',
			headers: {
				'token': layui.data("user").userinfo.token,
			},
		})
		.done(function(data) {
			var data = JSON.parse(data);
			if (data.code == 1) {
				layer.msg(data.msg, {
					offset: 't',
				});
			}

		})


	var DTree = dtree.render({
		elem: "#hosttree",
		url: api + "monitor",
		headers: {
			'token': layui.data("user").userinfo.token,
		},
		dataFormat: "list", //配置data的风格为list
		initLevel: 2,
		ficon: "-1", // 隐藏一级图标
		skin: "laySimple",
		menubar: true,
		toolbar: true, // 开启工具栏
		scroll: "#toolbar", // 工具栏绑定div
		toolbarShow: [], // 工具栏自带的按钮制空
		toolbarStyle: {
			title: "主机组",
			area: ["50%", "400px"]
		},
		nodeIconArray: {
			"3": {
				"open": "dtree-icon-wenjianjiazhankai",
				"close": "dtree-icon-weibiaoti5"
			}
		}, // 		自定扩展的二级非最后一级图标，从1开始
		leafIconArray: {
			"11": "dtree-icon-chart-screen"
		}, // 自定义扩展的二级最后一级图标，从11开始
		icon: ["3", "11"], // 使用
		menubarTips: {
			toolbar: ["moveDown", "moveUp"], // 指定工具栏吸附的menubar按钮
			group: [] // 按钮组制空
		},
		formatter: {
			title: function(data) { // 示例给有子集的节点返回节点统计
				var s = data.title;
				if (data.childrennum) {
					s += ' <span style=\'color:blue\'>(' + data.childrennum + ')</span>';
				}
				return s;
			}
		},
		done: function(data, obj) {
			$("#search_btn").unbind("click");
			$("#search_btn").click(function() {
				var value = $("#searchInput").val();
				if (value) {
					var flag = DTree.searchNode(value); // 内置方法查找节点
					if (!flag) {
						layer.msg("该名称主机不存在！", {
							icon: 5
						});
					}
				} else {
					DTree.menubarMethod().refreshTree(); // 内置方法刷新树
				}
			});
		}
	});
	// 点击节点名称获取选中节点值
	dtree.on("node('hosttree')", function(obj) {

		if (!obj.param.leaf) {
			var $div = obj.dom;
			DTree.clickSpread($div); //调用内置函数展开节点
		} else {
			//var data= JSON.stringify(obj.param);
			var id = obj.param.nodeId;
			var hostname = obj.param.context;
			$(".hostinfo").html("<h3><b>" + hostname + '监控信息:</b></h3>');
			$(".hostinfo").attr({
				"id": id,
				"title": hostname
			});;
			$(".dateselect").html('<form class="layui-form layui-form-pane" action=""><div class = "layui-form-item layui-col-md5" style = "position: absolute;right: 10px;" ><label class="layui-form-label">选择时间：</label><div class = "layui-input-block" ><input type="text" class="layui-input" id="time" placeholder="开始时间至结束时间"></div></div></form>');
			var ins22 = laydate.render({
				elem: '#time',
				type: 'datetime',
				range: '至',
				format: 'yyyy-M-d H:m:s',
				theme: '#393D49',
				min: timeStamp(daterange[0]),
				max: timeStamp(daterange[1]),
				done: function(value, date) {
					var date_range = value.split("至");
					var start_time = date_range[0];
					var end_time = date_range[1];
					var id = $(".hostinfo").attr("id");
					var hostname = $(".hostinfo").attr("title");
					clearInterval(timer);
					monitorCharts(id, hostname, timeStamp(start_time), timeStamp(end_time));
				},
			});
			clearInterval(timer);
			monitorCharts(id);
			timer = setInterval(function() {
				monitorCharts(id, hostname);
			}, 30000);

		}
	});



	$("#refresh").click(function() {
		self.location.reload();
	});
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


	monitorCharts = (id, hostname, start_time = "", end_time = "") => {
		$.each(items, function(i, v) {
			var item = items[i];
			$.ajax({
					url: api + 'host_historyGet',
					type: "GET",
					headers: {
						'token': layui.data("user").userinfo.token,
					},
					data: {
						'id': id,
						'item': item,
						'start_time': start_time,
						'end_time': end_time,
					},
				})

				.done(function(data) {
					if (data != "null") {
						var data = JSON.parse(data);

						if (item == "memory") {
							memoryChart(data, hostname);
						} else if (item == "cpu") {
							cpuChart(data, hostname);
						} else if (item == "disk") {
							diskChart(data, hostname);
						} else if (item == "network") {
							networkChart(data, hostname);
						}
					} else {
						$("#" + item).html("暂无数据");
						$("#" + item).removeAttr('_echarts_instance_');
					}
				})
		});
	}

	memoryChart = (data, hostname) => {
		var myChart = echarts.init(document.getElementById('memory'), "macarons");
		myChart.clear();
		var h = data.history;
		var total = h[1].data.value[1] / (1024 * 1024 * 1024)
		myChart.hideLoading();
		myChart.setOption({
			title: {
				text: "总内存：" + Math.ceil(total) + 'G'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985'
					}
				},
				formatter: function(params) {

					var result;
					params.forEach(function(item) {
						if (item.data) {
							value = item.data;
							if (value >= 1000000 && value < 1000000000) {
								num = value / 1024 / 1024
								result = num.toFixed(2) + 'M'
							} else if (value >= 1000000000) {
								num = value / 1024 / 1024 / 1024
								result = num.toFixed(2) + 'G'
							} else {
								num = value / 1024
								// return num.toFixed(2) + 'K'
								result = value + 'k'
							}
						}
					})
					return result

				}
			},
			grid: {
				left: '2%',
				right: '7%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				feature: {
					saveAsImage: {
						name: hostname + '-memory',
						title: '保存为图片',
						pixelRatio: 3
					}
				}
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: h[0].data.time
			},
			yAxis: {
				name: '可用内存',
				type: 'value',
				axisLabel: {
					formatter: function(value) {
						if (value >= 1000000 && value < 1000000000) {
							num = value / 1024 / 1024
							return num.toFixed(2) + 'M'
						} else if (value >= 1000000000) {
							num = value / 1024 / 1024 / 1024
							return num.toFixed(2) + 'G'
						} else {
							num = value / 1024
							// return num.toFixed(2) + 'K'
							return value
						}
					}
				}
			},
			series: [{
				name: '可用内存',
				type: 'line',
				symbol: 'none',
				lineStyle: {
					normal: {
						color: "#00FF99"
					}
				},
				areaStyle: {
					normal: {
						color: "#00FF66"
					}
				},
				data: h[0].data.value,
			}]
		}, true)
	}
	cpuChart = (data, hostname) => {
		var myChart = echarts.init(document.getElementById('cpu'), "macarons");
		var h = data.history;
		myChart.clear();
		myChart.hideLoading();
		myChart.setOption({
			title: {
				text: ""
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985'
					}
				},

				formatter: function(params) {
					var relVal = params[0].name;
					for (var i = 0, l = params.length; i < l; i++) {
						relVal += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';
						relVal += params[i].seriesName + ' : ' + params[i].value + "%"
					}
					return relVal;
				}

			},
			legend: {
				data: ['系统', '用户', 'I/O等待', '空闲']
			},
			grid: {
				left: '3%',
				right: '7%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				feature: {
					saveAsImage: {
						name: hostname + '-cpu',
						title: '保存为图片'
					}
				}
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: h[0].data.time
			},
			yAxis: {
				name: '占用（%）',
				type: 'value'
			},
			series: [{
				name: '用户',
				type: 'line',
				data: h[14].data.value

			}, {
				name: '系统',
				type: 'line',
				data: h[13].data.value

			}, {
				name: 'I/O等待',
				type: 'line',
				data: h[9].data.value

			}, {
				name: '空闲',
				type: 'line',
				data: h[7].data.value

			}]
		})
	}
	diskChart = (data, hostname) => {
		var myChart = echarts.init(document.getElementById('disk'), "macarons");
		var h = data.history;
		var total = h[2].data.value[1] / (1024 * 1024 * 1024);
		var it_name = ['disk'];
		var free = ['空闲(G)'];
		var use = ['占用(G)'];
		var se = [];
		var x = 30;
		var y = 22;
		var r = 1;
		var n = 1;

		for (var i = 0; i < h.length - 1; i = i + 4) {
			var name = h[i].item.split(' ');
			name = '目录[' + name[name.length - 1] + ']';
			it_name.push(name);
			var f = h[i].data.value[1] / (1024 * 1024 * 1024);
			var u = h[i + 3].data.value[1] / (1024 * 1024 * 1024);
			free.push(f.toFixed(2));
			use.push(u.toFixed(2));

			if (n >= 2 && n % 2 == 0) {
				x = 75;
			} else {
				x = 30;
			}
			if (i > 4 && i % 8 == 0) {
				y = y + 28;
			}
			var s = {
				type: 'pie',
				radius: 35,
				name: name,
				encode: {
					itemName: 'disk',
					value: name
				},
				center: [x + '%', y + '%'],
				label: {
					normal: {
						show: true,
						formatter: "{d}%"

					}
				}
			};

			se.push(s);
			n = n + 1;
		}

		var d = [it_name, free, use];
		myChart.clear();
		myChart.hideLoading();
		myChart.setOption({
			title: {

			},
			tooltip: {
				// trigger: 'item',
				// formatter: '{a}{c5}(G)'

			},
			legend: {

			},
			toolbox: {
				feature: {
					saveAsImage: {
						name: hostname + '-disk',
						title: '保存为图片'
					}
				}
			},
			dataset: {
				source: d
			},
			color: ['#33CC00', '#CC0000'],
			series: se


		})

	}
	networkChart = (data, hostname) => {
		var h = data.history;
		var in_data = [];
		var out_data = [];
		var in_name = [];
		var out_name = [];
		for (var i = 0; i < h.length; i++) {
			var netname = h[i].item.split(" ")
			d = {
				name: netname[netname.length - 1],
				type: 'line',
				data: h[i].data.value

			};
			if (i > (h.length) / 2 - 1) {
				out_data.push(d);
				out_name.push(netname[netname.length - 1]);
			} else {
				in_data.push(d);
				in_name.push(netname[netname.length - 1]);
			}

		}
		var myChart = echarts.init(document.getElementById('incomming'), "macarons");
		myChart.clear();
		myChart.hideLoading();
		myChart.setOption({
			title: {
				text: ""
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985'
					}
				},
				formatter: function(params) {

					var relVal = params[0].name;
					for (var i = 0, l = params.length; i < l; i++) {
						value = params[i].value;
						if (value >= 1000000 && value < 1000000000) {
							num = value / 1024 / 1024
							result = name + ' ' + num.toFixed(2) + 'Mbps'
						} else if (value >= 1000000000) {
							num = value / 1024 / 1024 / 1024
							result = num.toFixed(2) + 'Gbps'
						} else if (value < 1000000 && value > 1000) {
							num = value / 1024

							result = num.toFixed(2) + 'Kbps'
						} else if (value <= 1000) {
							num = value
							// return num.toFixed(2) + 'Kbps'
							result = value + 'Bps'
						}

						relVal += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';
						relVal += params[i].seriesName + ' : ' + result
					}
					return relVal
				}
			},
			legend: {
				data: in_name
			},
			grid: {
				left: '3%',
				right: '7%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				feature: {
					saveAsImage: {
						name: hostname + '-network-Incoming',
						title: '保存为图片'
					}
				}
			},

			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: h[0].data.time

			},
			yAxis: {
				name: '入口',
				type: 'value',
				axisLabel: {
					formatter: function(value) {
						if (value >= 1000000 && value < 1000000000) {
							num = value / 1024 / 1024
							return num.toFixed(2) + 'Mbps'
						} else if (value >= 1000000000) {
							num = value / 1024 / 1024 / 1024
							return num.toFixed(2) + 'Gbps'
						} else if (value < 1000000 && value > 1000) {
							num = value / 1024
							// return num.toFixed(2) + 'Kbps'
							return num.toFixed(2) + 'Kbps'
						} else if (value <= 1000) {

							// return num.toFixed(2) + 'Kbps'
							return value + 'Bps'
						}
					}
				}
			},

			series: in_data

		})


		var myChart1 = echarts.init(document.getElementById('outgoing'), "macarons");
		myChart1.clear();
		myChart1.hideLoading();
		myChart1.setOption({
			title: {
				text: ""
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985'
					}
				},
				formatter: function(params) {
					var relVal = params[0].name;
					for (var i = 0, l = params.length; i < l; i++) {
						value = params[i].value;
						if (value >= 1000000 && value < 1000000000) {
							num = value / 1024 / 1024
							result = name + ' ' + num.toFixed(2) + 'Mbps'
						} else if (value >= 1000000000) {
							num = value / 1024 / 1024 / 1024
							result = num.toFixed(2) + 'Gbps'
						} else if (value < 1000000 && value > 1000) {
							num = value / 1024
							result = num.toFixed(2) + 'Kbps'
						} else if (value <= 1000) {
							num = value
							result = value + 'Bps'
						}

						relVal += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>';
						relVal += params[i].seriesName + ' : ' + result
					}
					return relVal

				}
			},
			legend: {
				data: out_name
			},
			grid: {
				left: '3%',
				right: '7%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				feature: {
					saveAsImage: {
						name: hostname + '-network-Incoming',
						title: '保存为图片'
					}
				}
			},

			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: h[0].data.time

			},
			yAxis: {
				name: '出口',
				type: 'value',
				axisLabel: {
					formatter: function(value) {
						if (value >= 1000000 && value < 1000000000) {
							num = value / 1024 / 1024
							return num.toFixed(2) + 'Mbps'
						} else if (value >= 1000000000) {
							num = value / 1024 / 1024 / 1024
							return num.toFixed(2) + 'Gbps'
						} else if (value < 1000000 && value > 1000) {
							num = value / 1024
							// return num.toFixed(2) + 'Kbps'
							result = num.toFixed(2) + 'Kbps'
						} else if (value <= 1000) {

							// return num.toFixed(2) + 'Kbps'
							return value + 'Bps'
						}

					}
				}
			},

			series: out_data

		})
	}
})