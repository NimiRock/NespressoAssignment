const mysql = require("mysql");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "nespressocustomers",
});

connection.connect((err) => {
	if (err) throw err;
	console.log("cool! connected to mySql");
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
