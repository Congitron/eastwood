module.exports = function (t, p) {
	var self = this,
	project = p;

	self.table = t;
	self.id = -1;
	self.store = [];

	self.selectAll = function (rowHandler) { project.dao.execute('select * from "' + self.table + '";', rowHandler); }; //use dao to get all properties

	self.select = function (filter) {
		// not implemented
	};
	
	// Need to implement CRUD stuff still

	self.save = function () { 
		if (self.id > 0) { //update

		}

		else { //insert

		}
	};
	
	self.delete = function () { 
		if (self.id > 0) {

		}
	};

	self.load = function () {
		self.store = self.selectAll();
		//maybe setup a dictionary of id to object for faster selection
	};
};
