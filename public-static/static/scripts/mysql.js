function mysqlReinit () { 

	function getMysqlTables() {
		$.getJSON('/get-tables', {type:SI.currentDataSource.type , name:SI.currentDataSource.name}).done((result) => {
			let tables = [];
			result.forEach(function( item) {
				for(let key in item) {
					tables.push(item[key]);
				}
			});
			$('ul.table-list').append(`<li class="list-group-item" style="word-break:break-all;">${tables}</li>`);
		})
		.fail(err => {
			SI.setUserUnauthorized(err);
			$('#stateMsg').text('Connection :' + err.responseText);
		});
	}
	function getMysqlSchemas() {
		$.getJSON('/get-schemas', {type:SI.currentDataSource.type , name:SI.currentDataSource.name}).done((result) => {
			let schemas = [];
			result.forEach(function(item) {
				schemas.push(item['Database']);			
			});
			$('ul.schema-list').append(`<li class="list-group-item" style="word-break:break-all;">${schemas}</li>`);
		})
		.fail(err => {
			SI.setUserUnauthorized(err);
			$('#stateMsg').text('Connection :' + err.responseText);
		});
	}
	var runMysqlQuery = function (e) {
		e.preventDefault(); 
		let data = {
			query: $(this).find('.queryToMysql')[0].value,
			type: 'mysql',
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
    if (SI.currentDataSource.type === 'mysql' && $('#operations-nav').hasClass('active')) {
		getMysqlTables();
		getMysqlSchemas();
		$('#formQueryToMysql').off('submit');
		$('#formQueryToMysql').on('submit', runMysqlQuery);
	}
}
