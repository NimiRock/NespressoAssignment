// Setting up the server
const http = require("http");
const { getReqData } = require("./utils");
const { Query } = require("./dbConfig");
const { verifyToken } = require("./verifyToken");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 1000;

const server = http.createServer(async (req, res) => {
	// / : GET
	if (req.url === "/" && req.method === "GET") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end("Welcome to Nespresso customers API!");
	}
	// /nespresso/get-token : POST - username: "admin", password: "123456"
	else if (req.url === "/nespresso/get-token" && req.method === "POST") {
		/* Defining the needed data
        verify that there is no missing data
        verify the username and password
        sign the token, and sent it in the response */
		try {
			const requestBodyData = await getReqData(req);
			const parsedData = JSON.parse(requestBodyData);
			const { username, password } = parsedData;
			if ((!username, !password)) {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end("Missing information");
			} else if (username !== "admin" || password !== "123456") {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end("Unauthorized");
			} else {
				const token = jwt.sign({ username, password }, "thdyjgsdfg", { expiresIn: "7m" });
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ token }));
			}
		} catch (error) {
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ message: error }));
		}
	}

	// /nespresso/all-customers : GET
	else if (req.url === "/nespresso/all-customers" && req.method === "GET") {
		/* Validate token
        defining the needed query
        get all the customers
        set the status code and content-type
        send the data */
		try {
			const token = req.headers.authorization;
			await verifyToken(token);
			const sqlQuery = `SELECT * FROM customers`;
			const allCustomers = await Query(sqlQuery);
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify(allCustomers));
		} catch (error) {
			if (error === "Unauthorized") {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			} else {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			}
		}
	}

	// /nespresso/customer/:customer_id : GET
	else if (req.url.match(/\/nespresso\/customer\/([0-9]+)/) && req.method === "GET") {
		/* Verify token
        get customer_id from url
        defining the needed query
        get customer with the query
        set the status code and content-type based on if a customer was found or not
        send the data/error */
		try {
			const token = req.headers.authorization;
			await verifyToken(token);
			const customer_id = req.url.split("/")[3];
			const sqlQuery = `SELECT * FROM customers WHERE customer_id=${customer_id}`;
			const customer = await Query(sqlQuery);
			if (customer.length === 0) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end("No customer with this ID was found, no customer was updated");
			}
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify(customer));
		} catch (error) {
			if (error === "Unauthorized") {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			} else {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			}
		}
	}

	// /nespresso/delete-customer/:customer_id : DELETE
	else if (req.url.match(/\/nespresso\/delete-customer\/([0-9]+)/) && req.method === "DELETE") {
		/* verify token
        get customer_id from url
        defining the needed queries
        check if a customer with this id exist, if not send error
        delete the customer with the query
        set the status code and content-type
        send the data/error */
		try {
			const token = req.headers.authorization;
			await verifyToken(token);
			const customer_id = req.url.split("/")[3];
			const getQuery = `SELECT * FROM customers WHERE customer_id=${customer_id}`;
			const deleteQuery = `DELETE FROM customers WHERE customer_id=${customer_id}`;
			const customer = await Query(getQuery);
			if (customer.length === 0) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end("No customer with this ID was found, no changes took affect.");
			}
			await Query(deleteQuery);
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(`The customer ${customer[0].first_and_last_name} was deleted successfully.`);
		} catch (error) {
			if (error === "Unauthorized") {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			} else {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			}
		}
	}

	// /nespresso/edit-customer/:customer_id : UPDATE
	else if (req.url.match(/\/nespresso\/edit-customer\/([0-9]+)/) && req.method === "PUT") {
		/* verify token
        get customer_id from url
        getting the data from the request, and parse it
        defining the needed query to get the customer, and check if this user exist
        getting the data our of the request body, and defining the needed queries to update the customer, and get it after the changes
        set the status code and content-type based on if a customer was found or not
        send the data/error */
		try {
			const token = req.headers.authorization;
			await verifyToken(token);
			const customerIdBeforeTheChange = req.url.split("/")[3];
			const requestBodyData = await getReqData(req);
			const parsedData = JSON.parse(requestBodyData);
			const getcustomerById = `SELECT * FROM customers WHERE customer_id=${customerIdBeforeTheChange}`;
			const customerToUpdate = await Query(getcustomerById);
			if (customerToUpdate.length === 0) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end("No customer with this ID was found, no customer was updated");
			}
			const { customer_id, first_and_last_name, date_of_birth, gender, phone_numbers } = parsedData;
			if (!customer_id || !first_and_last_name || !date_of_birth || !gender || !phone_numbers) {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end("Some information is missing in the request");
			}
			if (gender.toLowerCase() !== "male" || gender.toLowerCase() !== "female") {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end("invalid gender");
			} else {
				const updateQuery = `UPDATE customers SET customer_id=?, first_and_last_name=?, date_of_birth=?, gender=?, phone_numbers=? WHERE customer_id=${customer_id}`;
				const customerQueryAfterUpdate = `Select * FROM customers WHERE customer_id=${parsedData.customer_id}`;
				await Query(updateQuery, customer_id, first_and_last_name, date_of_birth, gender, phone_numbers);
				const updatedCustomer = await Query(customerQueryAfterUpdate);
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(updatedCustomer));
			}
		} catch (error) {
			if (error === "Unauthorized") {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			} else {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			}
		}
	}

	// /nespresso/new-customer/ : POST
	else if (req.url === "/nespresso/new-customer" && req.method === "POST") {
		/* verify token
        get the data from the request
        verify no missing information in the request
        defining the needed query to post
        insert the data to the DB, and get that customer
        set the status code and content-type based on if a customer was found or not
        send the data/error */
		try {
			const token = req.headers.authorization;
			await verifyToken(token);
			const requestBodyData = await getReqData(req);
			const parsedData = JSON.parse(requestBodyData);
			const { customer_id, first_and_last_name, date_of_birth, gender, phone_numbers } = parsedData;
			if (!customer_id || !first_and_last_name || !date_of_birth || !gender || !phone_numbers) {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end("Some information is missing in the request");
			}
			if (gender.toLowerCase() !== "male" || gender.toLowerCase() !== "female") {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end("Invalid Gender");
			} else {
				const newCustomerQuery = `INSERT INTO customers (customer_id, first_and_last_name, date_of_birth, gender, phone_numbers)
            VALUES(${customer_id}, "${first_and_last_name}", "${date_of_birth}", "${gender}", "${phone_numbers}");`;
				await Query(newCustomerQuery);
				const customerQueryAfterCreation = `Select * FROM customers WHERE customer_id=${customer_id}`;
				const getNewCustomer = await Query(customerQueryAfterCreation);
				res.writeHead(201, { "Content-Type": "application/json" });
				res.end(JSON.stringify(getNewCustomer));
			}
		} catch (error) {
			if (error === "Unauthorized") {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			} else {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error }));
			}
		}
	}

	// No route present
	else {
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ message: "Route not found" }));
	}
});

server.listen(PORT, () => {
	console.log(`server started on port: ${PORT}`);
});
