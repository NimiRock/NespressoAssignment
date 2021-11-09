const mysql = require("mysql");

// const connection = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "",
// 	database: "nespressocustomers",
// });

const connection = mysql.createPool({
	host: "us-cdbr-east-04.cleardb.com",
	user: "b9f04cf6d85a61",
	password: "c87945a0",
	database: "heroku_1c85dce2e7470a5",
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
