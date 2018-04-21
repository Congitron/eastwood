"use strict";

module.exports = function(projectFolder) {
	var self = this,
	RequestHandler = require('./requestHandler.js'),
	DataAccess = require('./dataAccess.js'),
	Orm = require('./orm.js'),
	SessionManager = require('./sessionManager');

	self.settings = require('../../' + projectFolder + '/settings.json');
	self.settings.projectFolder = projectFolder;
	self.requestHandler = new RequestHandler(self);
	self.dao = new DataAccess(self);
	self.orm = new Orm(self);
	self.sessionManager = new SessionManager(self);
};
