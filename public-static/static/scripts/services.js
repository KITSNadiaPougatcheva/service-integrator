	var SI = SI || {};
	SI.availableServices = SI.availableServices || {};
	SI.currentDataSource = SI.currentDataSource || {};
	SI.allDataSources = SI.allDataSources || {};
	SI.userData = SI.userData || {};
	SI.setUserUnauthorized = function (res, showMsg) {
		if (res && res.status == 401) {
			$('.login-form').show();
			if (showMsg !== 'notShowMsg')
				$('.greeting').text('You are not authorized');
			if (SI.userData)
				$('#username').val(SI.userData.username);
			for(let key in SI.allDataSources) {
					SI.allDataSources[key].connected = false;
			}
		}
	}

	$(() => {
		var onConnect = function(e) {
			e.preventDefault(); 
			if (!SI.currentDataSource.name) {
				$('.connectionStateMsg').text('Unknown connection');
				return;
			}
			$(this).find('input.name').val(SI.currentDataSource.name);
			let data = $(this).serialize();
			let datasourceName = SI.currentDataSource.type + '-' + SI.currentDataSource.name;
			$.post({
				url: '/connect', 
				data:data})
				.done(function(res) {
					$('.connectionStateMsg').text('State :' + (res.connected ? 'Connected' : 'Not Connected'));
					SI.allDataSources[datasourceName].connected = res.connected;
					$('.dataSourceMsg').text('Connection : ' + JSON.stringify(SI.allDataSources[datasourceName]));
					$('#operations-nav').removeClass('disabled');
				}).fail(function(err){
					$('.connectionStateMsg').text('State : Failed to connect / ' + err.responseText);
					SI.allDataSources[datasourceName].connected = false;
					$('#operations-nav').addClass('disabled');
					setUserUnauthorized(err);
				});
		};

		var onDisconnect = function(e) {
			e.preventDefault();
			if (!SI.currentDataSource.name) {
				$('.connectionStateMsg').text('Unknown connection');
				return;
			}
			let datasource = SI.currentDataSource;
			$(this).find('input.name').val(datasource.name);
			let data = $(this).serialize();
			$.post({
				url: '/disconnect', 
				data:data})
				.done(function(res) {
					$('.connectionStateMsg').text('State : Disconnected - ' + res.toString());
					datasource.connected = false;
					$('#operations-nav').addClass('disabled');
					$('.dataSourceMsg').text('Connection : ' + JSON.stringify(datasource));
				}).fail(function(err){
					$('.connectionStateMsg').text('State : Operation Failed / ' + err.responseText);
					validateDataSource(datasource);
					setUserUnauthorized(err);
				});
		};

		var onCreateDataSource = function(e) {
			e.preventDefault(); 
			let data = $(this).serialize();
			$.post({
				url: '/create-data-source', 
				data:data})
				.done(function(res) {
					$('a.data-source').removeClass('active');
					let dataSourceName = res.type + '-' + res.name;
					if (!SI.allDataSources[dataSourceName]) {
						$('#data-source-list')
						.append(`<a href="#" data-source="${res.name}" data-type="${res.type}" class="list-group-item list-group-item-action data-source active ${dataSourceName}">${res.name}</a>`);
					}
					$('.dataSourceMsg').text('Connection :' + JSON.stringify(res.valueOf()));
					$('.connectionStateMsg').text('State : ' + (res.connected ? 'Connected' : 'Not connected'));
					SI.allDataSources[res.type + '-' + res.name] = res;
					SI.currentDataSource = res;
				}).fail(function(err){
					setUserUnauthorized(err);
					$('.dataSourceMsg').text('Fail :' + err.responseText);
				});
		}
		
		var onChooseDataSource = function(e){
			e.preventDefault(); 
			$('a.data-source').removeClass('active');
			$(this).addClass('active');
			let dataSourceName = $(this).data('type') + '-' + $(this).data('source');
			SI.currentDataSource = SI.allDataSources[dataSourceName];
			loadDataSourcePanelOfType($(this).data('type'));
		}
		
		var onChooseNavTab = function (e) {
			e.preventDefault(); 
			if (!SI.currentDataSource.type) {
				return;
			}
			let frameType = $(this).data('type');
			let type = SI.currentDataSource.type;
			let framePath = SI.availableServices[type].frames[frameType];
			
			$('.service-nav').removeClass('active');
			$('#'+frameType+'-nav').addClass('active');
			$('.service-panel').hide();
			let frameId = '#'+frameType+'-panel';
			$(frameId).load(framePath, function(resp, status,xhr){
				$(frameId).show();
				reloadAllEvents(type);
				fillInPanelData(frameId);
			});
		}
		
		function setupUserData(res) {
			$('.login-form').hide();
			$('.greeting').text(`Hi, ${res.username} !`);
			SI.userData = res;
			$.ajaxSetup({headers: { "x-access-token": res.token }});
			$('#username').val('');
			$('#pswd').val('');
		}

		function setUserUnauthorized(res, showMsg) {
			SI.setUserUnauthorized(res, showMsg);
		}
		
		var onAuth = function (e) {
			e.preventDefault();
			let data = {username:$('#username').val(), password: $('#pswd').val()};
			$.post({
				url: '/auth', 
				data:data
				})
				.done(function(res) {
					setupUserData(res);
				}).fail(function(err){
					$('.greeting').text('Fail :' + err.responseText);
				});
		}

		function loadServiceScript(scriptPath) {
				$.getScript( scriptPath, function( data, textStatus, jqxhr ) {
						console.log( "Load was performed :" + scriptPath);
				});
		}
		function reinitScripts(script) {
			window[script]();
		}
		function fillInDataSourcePanel() {
			$('.dataSourceMsg').text('Current connection : ' + JSON.stringify(SI.currentDataSource));
			$('.connectionStateMsg').text('State : ' + (SI.currentDataSource.connected ? 'Connected' : 'Not Connected'));
			if(SI.currentDataSource.connected) {
				$('#operations-nav').removeClass('disabled');
			} else {
				$('#operations-nav').addClass('disabled');
			}
			if (SI.availableServices[SI.currentDataSource.type]) {
				reinitScripts(SI.availableServices[SI.currentDataSource.type].initialize);
			} else {
				console.log('undefined');
			}
			for (let key in SI.currentDataSource){
				if (key !== 'type') {
					$('input.' + key).val(SI.currentDataSource[key]);
				}
			}
		}
		function fillInPanelData(frameId) {
			if ('#create-data-source-panel' === frameId) {
				fillInDataSourcePanel();
				return;
			}
			if ('#operations-panel' === frameId) {
				$('div.data-source').text('Data-Source : ' + SI.currentDataSource.name);
				$('div.connection-state').text('State : ' + (SI.currentDataSource.connected ? 'Connected':'Not connected'));
				$('div.service-type').text('Type : ' + SI.currentDataSource.type);
				$('div.db-name').text('DB name : ' + SI.currentDataSource.dbname);
				reinitScripts(SI.availableServices[SI.currentDataSource.type].initialize);
				return;
			}
		}

		function loadServicesList() {
			$.getJSON('/get-services').done((result) => {
				result.services.forEach(function( item) {
					$('#createDataSourceTypeSelect').append(`<option value='${item.type}'>${item.type}</option>`);
					SI.availableServices[item.type] = item;
					loadServiceScript(item.script);
				});
				if (result.user && result.user.username) {
					setupUserData(result.user);
				}
				loadDataSources();
			})
			.fail(err => {
				$('#stateMsg').text('Connection :' + err.responseText);
			});
		}

		function setDatasources (results) {
			let startDataSource;
			results.forEach(function( item) {
				let dataSourceName = item.type + '-' + item.name;
				if ($('a.data-source.' + dataSourceName).length === 0) {
					$('#data-source-list').append(`<a href="#" data-source="${item.name}" data-type="${item.type}" ` 
						+` class="list-group-item list-group-item-action data-source ${dataSourceName}">${item.name}</a>`);
				}
				SI.allDataSources[dataSourceName] = item;
				if (!startDataSource)
						startDataSource = dataSourceName;
			});
			reloadAllEvents();
			if(startDataSource) {
				$('a.' + startDataSource).trigger('click');
			}
			$('#upload-file').val('');
		}

		function loadDataSources() {
			$.getJSON('/get-data-sources').done((result) => {
				setDatasources(result);
      }).fail(err => {
				$('#stateMsg').text('Connection :' + err.responseText);
				setUserUnauthorized(err, 'notShowMsg');
      });
			
		}
		
		function reloadAllEvents(type){
				$('.connect').off('submit');
				$('.connect').on('submit', onConnect);

				$('.disconnect').off('submit');
				$('.disconnect').on('submit', onDisconnect);

				$('.create-data-source').off('submit');
				$('.create-data-source').on('submit', onCreateDataSource);
				
				$('a.data-source').off('click');
				$('a.data-source').on('click', onChooseDataSource);
		}
		loadServicesList();

		var loadCreateDataSourcePanel = function(e) {
			e.preventDefault();
			let type = $('#createDataSourceTypeSelect').val();
			SI.currentDataSource = {}
			loadDataSourcePanelOfType(type);
		}
		
		var loadDataSourcePanelOfType = function(type) {
			$('.service-nav').removeClass('active');
			$('#create-data-source-nav').addClass('active');
			$('.service-panel').hide();
			$('#create-data-source-panel').addClass('active');
			$('#create-data-source-panel').load(SI.availableServices[type].frames['create-data-source'], function(resp, status,xhr){
				$('#create-data-source-panel').show();
				reloadAllEvents(type);
				fillInPanelData('#create-data-source-panel');
			});
		}
		
		$('#addDataSourceForm').on('submit', loadCreateDataSourcePanel);
		$('#authFrom').on('submit', onAuth);

		function loadServicePanel(path, type) {
			$("#service-panel").load(path, function(resp, status, xhr) {
				reloadAllEvents(type);
			});
		}
		 $('.service').on("click", function(e) {
			e.preventDefault(); 
			loadServicePanel($(this).data('frame'), $(this).data('type'));
		});
		
		 $('.service-nav').on("click", onChooseNavTab);

		function validateDataSource(datasource){
			let dataSourceName = datasource.type + '-' + datasource.name;
			$.getJSON('/get-services' + datasource.type + '/' + datasource.name).done((result) => {
				SI.allDataSources[dataSourceName] = result;
				if (SI.currentDataSource.name === datasource.name && SI.currentDataSource.type === datasource.type) {
					SI.currentDataSource = result;
					$('.dataSourceMsg').text('Current connection :' + JSON.stringify(SI.currentDataSource));
				}
			})
			.fail(err => {
				SI.allDataSources[dataSourceName].connected = false;
				setUserUnauthorized(err);
			});
		}
		function downloadTextFile(text, name) {
			const a = document.createElement('a');
			const type = name.split(".").pop();
			a.href = URL.createObjectURL( new Blob([text], { type:`text/${type === "txt" ? "plain" : type}` }) );
			a.download = name;
			a.click();
		  }
		  
		var onDownloadDataSources = function (e) {
			e.preventDefault();
			downloadTextFile(JSON.stringify(SI.allDataSources), 'datasources.json');
		}

		var onUploadDataSources = function (e) {
			e.preventDefault();
			$('#upload-file').click();
		}

		var onSettings = function (e) {
			e.preventDefault();
		}

		var doUploadDataSources = function() {
			console.log('uploaded file = ' + $('#upload-file').val());
			var form = new FormData(); 
			form.append('file', $('#upload-file')[0].files[0]);
			$.ajax({
				url: '/upload-datasources',
				type: 'post',
				contentType: false, 
				processData: false, 
				data: form,
				dataType: 'json'
			  }).done(function(results) {
					setDatasources(results);
			}).fail(function(err){
				setUserUnauthorized(err);
				$('#upload-file').val('');
			});
		}

		$('.download-datasources').on("click", onDownloadDataSources);
		$('.upload-datasources').on("click", onUploadDataSources);
		$('.settings').on("click", onSettings);
		$('#upload-file').on("change", doUploadDataSources);
	}
);
