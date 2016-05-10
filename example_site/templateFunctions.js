module.exports = templateFunctions = {
	multiply: function(params) {
		var result = params.x * params.y;
		return result;
	},

	getYear: function() {
		return new Date().getFullYear();
	}
};
