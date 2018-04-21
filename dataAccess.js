"use strict";

 module.exports = function (project) {
	var self = this,
	project = project,
	pg = require('pg'),
	// postgresql://username:password@localhost/database
	connectionString = 'postgresql://' + project.settings.databaseUser +
		':' + project.settings.databasePassword +
		'@localhost/' + project.settings.database;

	self.execute = function (text, rowHandler) {
		pg.connect(connectionString, function (err, client, done) {
			try {
				if (err) {
					Logger.error('error fetching client from pool', err);
				}
				else {
					client.query(text, function (err, result) {
						if (err) { Logger.error('error running query', err); }
						rowHandler(result.rows);
					});
				}
			}
			catch (ex) { }
			finally { done(); }
		});
	};

	self.getTableSchema = function(table) {
		// not implemented yet
	};
};
