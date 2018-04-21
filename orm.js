module.exports = function (project) {
	var self = this,
	project= project,
	dao = project.dao,
	models = require('../../' + project.settings.projectFolder + '/models.json'),
	modelBase = require('./model.js');

	self.newModel = function (orm, key, model) {
		if (orm[key]) { return; }
		orm[key] = new modelBase(key, project);
		console.log('made model: ' + key);
	};

	for (var key in models) {
	    if (models.hasOwnProperty(key)) {
	   		var model = models[key];
	   		if (!model['table']) { model.table = key; }
	   		self.newModel(self, key, model);
	    }
	}
}
