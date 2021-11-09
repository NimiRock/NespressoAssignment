# NespressoAssignment

===== Heroku: https://guarded-wave-13435.herokuapp.com/nespresso/ =====

In case Heroku is not running, the file "dbConfig.js" contains another config for local MySQL database commented out.

The available endpoints:
  1. GET: "/" - Home page
  2. POST: /nespresso/get-token - get a token
  3. GET: /nespresso/all-customers - get all customers
  4. GET: /nespresso/customer/:customer_id - get a specific customer
  5. DELETE: /nespresso/delete-customer/:customer_id - delete a customer
  6. PUT: /nespresso/edit-customer/:customer_id - update a customer
  7. POST: /nespresso/new-customer/ - create a new customer
  8. Anything else - "Route not found"


The username and password to get the token are:
username: "admin"
password: "123456"
