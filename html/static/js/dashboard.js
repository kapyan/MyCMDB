layui.use(['element', 'jquery', 'form'], function() {
	var api = layui.data('api').url;
	var $ = layui.$
	var element = layui.element;
	var form = layui.form;
	//书签显示
	/**
	 * [description] 添加书签元素
	 * @param  {[type]} dom  [DOM元素]
	 * @param  {[type]} data [数组]
	 */
	bookmarksShow = (dom, data) => {
		for (var i = 0; i < data.length; i++) {
			dom.append('<li class="layui-col-md2 layui-col-xs3 layui-anim-upbit book-mark"><a href="javascript:;"><i class="layui-icon layui-icon-star layui-icon-link link-copy"></i></a><a href="javascript:;" class="del-bookmark" onclick="bookmarkDel(this,' + data[i].id + ',\'' + data[i].title + '\')">x</a><a href="' + data[i].url + '" target="_blank" class="x-admin-backlog-body"><h3><i class="layui-icon layui-icon-star bookmark-icon"></i><b>' + data[i].title + '</b></h3><p><small class="layui-elip">' + data[i].desc + '</small></p></a></li>')
		}
	}

	//链接复制
	$('body').on('click', '.link-copy', function() {
		var text = $(this).parent().next().next().attr('href'); //获取链接
		copyText(text); //执行复制
		　　　　
		layer.msg("链接已复制！", {
			offset: 't',
		});

	})

	//复制提示框
	$('body').on("mouseenter mouseleave", ".link-copy", function(event) {　　
		if (event.type == "mouseenter") {　　　　
			index = layer.tips('复制链接', $(this), {
				tips: 2,
				time: 0
			});　　
		} else if (event.type == "mouseleave") {　　　　
			layer.close(index);　　
		};
	})

	//刪除书签
	bookmarkDel = (t, id, title) => {
		layer.confirm('确定删除书签：' + title + '？', {
			btn: ['确定', '取消'] //按钮
		}, function() {
			$.ajax({
					url: api + 'delbookmark',
					type: 'POST',
					data: {
						'id': id
					},
					async: false,
					headers: {
						'token': layui.data("user").userinfo.token,
					},
				})
				.done(function(data) {
					$(t).parent().remove();
					layer.msg('书签："' + data + '" 已删除！', {
						icon: 1
					});
					var obj = $(".bookmarks").children();
					//判断是否有子元素
					if (obj.length == 0) {
						$(".bookmarks").html("暂无书签，请添加...");
					}
				})
		});


	}
	//获取书签
	$.ajax({
			url: api + "getbookmarks",
			type: 'GET',
			async: false,
			headers: {
				'token': layui.data("user").userinfo.token,
			},
		})
		.done(function(data) {
			if (data != "null") {
				var data = JSON.parse(data);
				bookmarksShow($(".bookmarks"), data);
			} else {
				$(".bookmarks").html("暂无书签，请添加...");
			}
		})

	//弹出层表单
	$('.addbm').on('click', function() {
		layer.open({
			type: 1,
			title: "添加书签",
			// content: ['addbookmark.html','no'], //这里content是一个普通的String
			content: '<div class="layui-row"><div class="layui-col-md9"><br/><br/><form class="layui-form"><div class="layui-form-item"><label class="layui-form-label">标题：</label><div class="layui-input-block"><input type="text" name="title" placeholder="请输入书签标题" lay-verify="required" autocomplete="off" class="layui-input"></div></div><div class="layui-form-item"><label class="layui-form-label">地址：</label><div class="layui-input-block"><input type="text" name="url" placeholder="请输入书签url地址" lay-verify="required" autocomplete="off" class="layui-input"></div></div><div class="layui-form-item"><label class="layui-form-label">描述：</label><div class="layui-input-block"><input type="text" name="desc" placeholder="请输入对书签的描述" lay-verify="required" autocomplete="off" class="layui-input"></div></div><div class="layui-form-item"><div class="layui-input-block"><button class="layui-btn" lay-submit lay-filter="addmarkbook">添加</button><button type="reset" class="layui-btn layui-btn-primary">重置</button></div></div></form></div></div>',
			area: ['380px', '300px'], //大小
			offset: '50px', //top坐标
			skin: 'layui-layer-molv',
			anim: '2' //弹出动画
		});
	});

	//监听提交
	form.on('submit(addmarkbook)', function(data) {
		var title = data.field.title;
		$.ajax({
				url: api + 'addbookmark',
				type: 'POST',
				data: data.field,
				async: false,
				headers: {
					'token': layui.data("user").userinfo.token,
				},
			})
			.done(function(data) {
				var data = JSON.parse(data);
				layer.msg("书签：" + title + " 已添加", {
					offset: 't',
				});
				bookmarksShow($(".bookmarks"), data);
			})
		return false;
	});

	/**
	 * [copyText ] 将传入的字符串复制到剪切板
	 * @param  {[type]} text [需要复制的字符串]
	 * @return {[type]}      [返回true]
	 */
	function copyText(text) {
		const input = document.createElement('INPUT');
		input.style.opacity = 0;
		input.style.position = 'absolute';
		input.style.left = '-100000px';
		document.body.appendChild(input);
		input.value = text;
		input.select();
		input.setSelectionRange(0, text.length);
		document.execCommand('copy');
		document.body.removeChild(input);
		return true;
	}
})