var redisReinit = function() {
	var onSetRedisRequest = function (e) {
			e.preventDefault(); 
			let data = {
				key: $(this).find('input.key')[0].value,
				value: $(this).find('input.value')[0].value,
				ex: $(this).find('input.ex')[0].value,
				time: $(this).find('input.time')[0].value,
				type: 'redis',
				operation: 'set',
				name: SI.currentDataSource.name
			};
			$.post({
				url: '/request', 
				data: data})
				.done(function(res) {
					$('#setQueryResult').text('Result :' + res.valueOf());
				}).fail(function(err){
					SI.setUserUnauthorized(err);
					$('#setQueryResult').text('Fail :' + err.responseText);
				});
	}
	var onLoadRedisRequest = function (e) {
			e.preventDefault(); 
			let data = {
				key: $(this).find('input.key')[0].value,
				type: 'redis',
				operation: 'load',
				name: SI.currentDataSource.name
			};
			$.post({
				url: '/request', 
				data: data})
				.done(function(res) {
					$('#loadQueryResult').text('Result :' + res.valueOf());
				}).fail(function(err){
					SI.setUserUnauthorized(err);
					$('#loadQueryResult').text('Fail :' + err.responseText);
				});
	}
	var onAuthRedisRequest = function (e) {
		e.preventDefault(); 
		let data = {
			password: $(this).find('input.password')[0].value,
			type: 'redis',
			operation: 'auth',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#authRedisResult').text('Result :' + res.valueOf());
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#authRedisResult').text('Fail :' + err.responseText);
			});
	}
	var onCommandRedis = function (e) {
		e.preventDefault(); 
		let data = {
			command: $(this).find('input.command')[0].value,
			params: $(this).find('.params')[0].value,
			type: 'redis',
			operation: 'command',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#commandRedisResult').text('Result :' + JSON.stringify(res));
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#commandRedisResult').text('Fail :' + err.responseText);
			});
	}

	$('#setRedisValue').off('submit');
	$('#setRedisValue').on('submit', onSetRedisRequest);
	$('#loadRedisValue').off('submit');
	$('#loadRedisValue').on('submit', onLoadRedisRequest);
	$('#authRedisConn').off('submit');
	$('#authRedisConn').on('submit', onAuthRedisRequest);
	$('#commandRedis').off('submit');
	$('#commandRedis').on('submit', onCommandRedis);
}