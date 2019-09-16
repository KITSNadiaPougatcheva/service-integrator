function rabbitReinit (){ 
	function getRabbitCunsomedQueues() {
		$.getJSON('/get-tables', {type:SI.currentDataSource.type , name:SI.currentDataSource.name}).done((result) => {
			$('#queueList').text(JSON.stringify(result));
		})
		.fail(err => {
			SI.setUserUnauthorized(err);
			$('#stateMsg').text('Connection :' + err.responseText);
		});
	}
	var onSendRabbitRequest = function (e) {
			e.preventDefault(); 
			let data = {
				queue: $(this).find('input.queue')[0].value,
				msg: $(this).find('input.msg')[0].value,
				type: 'rabbitmq',
				operation: 'produce',
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
	var onConsumeRabbitRequest = function (e) {
			e.preventDefault(); 
			let data = {
				queue: $(this).find('input.queue')[0].value,
				type: 'rabbitmq',
				operation: 'start-consumer',
				name: SI.currentDataSource.name
			};
			$.post({
				url: '/request', 
				data: data})
				.done(function(res) {
					$('#startConsumerQueryResult').text('Result :' + res.valueOf());
				}).fail(function(err){
					SI.setUserUnauthorized(err);
					$('#startConsumerQueryResult').text('Fail :' + err.responseText);
				});
	}
	var onGetConsumedRabbitRequest = function (e) {
		e.preventDefault(); 
		let data = {
			queue: $(this).find('input.queue')[0].value,
			type: 'rabbitmq',
			operation: 'get-consumed',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#getConsumedResult').text('Result :' + res.valueOf());
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#getConsumedResult').text('Fail :' + err.responseText);
			});
	}
	var onGetQueuesRabbitRequest = function (e) {
		e.preventDefault(); 
		let data = {
			type: 'rabbitmq',
			operation: 'queues',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#getQueuesResult').text('Result :' + res.valueOf());
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#getQueuesResult').text('Fail :' + err.responseText);
			});
	}
	if (SI.currentDataSource.type === 'rabbitmq' && $('#operations-nav').hasClass('active')) {
		getRabbitCunsomedQueues();
		$('#sendRabbitMessage').off('submit');
		$('#sendRabbitMessage').on('submit', onSendRabbitRequest);
		$('#startConsumeMessages').off('submit');
		$('#startConsumeMessages').on('submit', onConsumeRabbitRequest);
		$('#getConsumedMessages').off('submit');
		$('#getConsumedMessages').on('submit', onGetConsumedRabbitRequest);
		$('#getQueuesToConsume').off('submit');
		$('#getQueuesToConsume').on('submit', onGetQueuesRabbitRequest);
	}
}
