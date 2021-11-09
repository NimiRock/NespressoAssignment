const mysql = require("mysql");

const connection = mysql.createConnection({
	host: "us-cdbr-east-04.cleardb.com",
	user: "b9f04cf6d85a61",
	password: "c87945a0",
	database: "heroku_1c85dce2e7470a5",
});

connection.connect((err) => {
	if (err) throw err;
	console.log("connected to mySql");
});

const Query = (q, ...values) => {
	return new Promise((resolve, reject) => {
		connection.query(q, values, (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
};

module.exports = { connection, Query };
