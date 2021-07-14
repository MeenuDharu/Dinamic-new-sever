const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const fs = require('fs');
const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const dbConfig = require('./config/database');
const jwtConfig = require('./config/jwtsecret');

const fileUpload = require('express-fileupload');


const environment = 'development';
//  const environment = 'production';

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(fileUpload());


mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
if (environment === 'production') {
	console.log('production env');

	// DB CONNECTION
	mongoose.connect(dbConfig.production.credentials, { useNewUrlParser: true })
		.then(() => console.log('database connected'))
		.catch((err) => console.error(err));

	// CREATE SERVER

	// const privateKey = fs.readFileSync('/var/www/clients/client0/web3/ssl/dinamic.io-le.key');
	// const certificate = fs.readFileSync('/var/www/clients/client0/web3/ssl/dinamic.io-le.crt');
	// const credentials = { key : privateKey , cert: certificate};
	// const server = https.createServer(credentials, app);

	//CLoudFare connection
	// CREATE SERVER
	const server = http.createServer(app);

	// LISTEN PORT
	server.listen(4000, function (err, res) {
		if (err) console.log('port error', err);
		console.log('Running on port 4000...');
	});
}
else {
	console.log('development env');

	// DB CONNECTION
	mongoose.connect(dbConfig.development.credentials, { useNewUrlParser: true })
		.then(() => console.log('database connected'))
		.catch((err) => console.error(err));

	// CREATE SERVER
	const server = http.createServer(app);

	// LISTEN PORT
	server.listen(4000, function (err, res) {
		if (err) console.log('port error', err);
		console.log('Running on port 4000...');
	});
}

// Admin
const adminAuth = require('./routes/admin/auth');
const adminRestaurant = require('./routes/admin/restaurant');
const adminBranch = require('./routes/admin/branch');
const adminTable = require('./routes/admin/table');
const adminUser = require('./routes/admin/user');

app.use('/admin/auth', adminAuth);
app.use('/admin/restaurant', verifyToken, adminRestaurant);
app.use('/admin/branch', verifyToken, adminBranch);
app.use('/admin/table', verifyToken, adminTable);
app.use('/admin/user', verifyToken, adminUser);

// User
const userAuth = require('./routes/user/auth');
const userSession = require('./routes/user/session');
const userScan = require('./routes/user/scan');
const userBill = require('./routes/user/bill');
const userTheme = require('./routes/user/theme');

app.use('/user/auth', userAuth);
app.use('/user/session', userSession);
app.use('/user/scan', userScan);
app.use('/user/bill', userBill);
app.use('/user/theme', userTheme);

app.get('/', function (req, res) {
	res.send({ message: 'Welcome to DiNAMIC admin panel version 0.1' });
});

/* Middlewares */
function verifyToken(req, res, next) {
	if (req.headers.authorization) {
		let token = req.headers.authorization.split(' ')[1];
		if (token) {
			jwt.verify(token, jwtConfig.jwtSecretKey, function (err, response) {
				if (!err && response) {
					req.id = response.id;
					req.user_type = response.user_type;
					next();
				}
				else {
					return res.json({ success: false, message: 'Failed to authenticate token.' });
				}
			});
		}
		else {
			return res.status(403).send({ success: false, message: 'Unauthorized request.' });
		}
	}
	else {
		return res.status(403).send({ success: false, message: 'No token provided.' });
	}
}
