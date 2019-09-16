function mongoReinit () { 
	function getCollections () {
		$.getJSON('/get-schemas', {type:SI.currentDataSource.type , name:SI.currentDataSource.name}).done((result) => {
			$('#collectionList').text(result);
		})
		.fail(err => {
			SI.setUserUnauthorized(err);
			$('#collectionList').text('Connection :' + err.responseText);
		});
	}
	var getCollectionValues = function (e) {
		e.preventDefault(); 
		let data = {
			collection: $(this).find('input.collection')[0].value,
			condition: $(this).find('.condition')[0].value,
			limit: $(this).find('input.limit')[0].value,
			offset: $(this).find('input.offset')[0].value,
			type: 'mongo',
			operation: 'collection-values',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#collectionQueryResult').text('Result :' + JSON.stringify(res));
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#collectionQueryResult').text('Fail :' + err.responseText);
			});
	}

	if (SI.currentDataSource.type === 'mongo' && $('#operations-nav').hasClass('active')) {
		$('#loadCollectionValue').off('submit');
		$('#loadCollectionValue').on('submit', getCollectionValues);
		getCollections();
	}
}

