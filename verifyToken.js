const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
	return new Promise((resolve, reject) => {
		if (!token) {
			reject("Unauthorized");
		} else {
			jwt.verify(token, "thdyjgsdfg", (err, decoded) => {
				if (err) {
					reject(err);
				} else {
					resolve(true);
				}
			});
		}
	});
};

module.exports = { verifyToken };
