var testJson = {
	GET: function (request, response, data) {
		response.setHeader('Content-Type', 'application/json');
		var jsonResponse = { a: 'does this work?', b: 'hello world', c: 1123458 };
		//response.write(JSON.stringify(jsonResponse));
		response.end(JSON.stringify(jsonResponse));
	}
};

module.exports = testJson;
