function postgreReinit() { 
	function getPostgreTables() {
		$.getJSON('/get-tables', {type:SI.currentDataSource.type , name:SI.currentDataSource.name}).done((result) => {
			let tables = [];
			result.forEach(function( item) {
				tables.push(`${item.table_schema}.${item.table_name}`);
			});
			$('ul.table-list').append(`<li class="list-group-item" style="word-break:break-all;">${tables}</li>`);
		})
		.fail(err => {
			SI.setUserUnauthorized(err);
			$('#stateMsg').text('Connection :' + err.responseText);
		});
	}
	function getPostgreSchemas() {
		let schemas = [];
		$.getJSON('/get-schemas', {type:SI.currentDataSource.type , name:SI.currentDataSource.name}).done((result) => {
			result.forEach(function( item) {
				schemas.push(item.schema_name);
			});
			$('ul.schema-list').append(`<li class="list-group-item" style="word-break:break-all;">${schemas}</li>`);
		})
		.fail(err => {
			SI.setUserUnauthorized(err);
			$('#stateMsg').text('Connection :' + err.responseText);
		});
	}

	var runPostgreQuery = function (e) {
		e.preventDefault(); 
		let data = {
			query: $(this).find('.queryToPostgre')[0].value,
			type: 'postgre',
			operation: 'query',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#queryResult').text('Result :' + JSON.stringify(res));
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#queryResult').text('Fail :' + err.responseText);
			});
	}

	var runPostgreSelectFromTableQuery = function (e) {
		e.preventDefault(); 
		let scheme = $(this).find('.scheme')[0].value || 'public';
		let table = $(this).find('.table')[0].value;
		let query = `select * from "${scheme}"."${table}"`;
		let data = {
			query: query,
			limit: $(this).find('.limit')[0].value,
			offset: $(this).find('.offset')[0].value,
			type: 'postgre',
			operation: 'query',
			name: SI.currentDataSource.name
		};
		$.post({
			url: '/request', 
			data: data})
			.done(function(res) {
				$('#selectTableResult').text('Result :' + JSON.stringify(res));
			}).fail(function(err){
				SI.setUserUnauthorized(err);
				$('#selectTableResult').text('Fail :' + err.responseText);
			});
	}


	if (SI.currentDataSource.type === 'postgre' && $('#operations-nav').hasClass('active')) {
		getPostgreTables();
		getPostgreSchemas();
		$('#formQueryToPostgre').off('submit');
		$('#formQueryToPostgre').on('submit', runPostgreQuery);
		$('#formSelectFromTablePostgre').off('submit');
		$('#formSelectFromTablePostgre').on('submit', runPostgreSelectFromTableQuery);

	}
}

