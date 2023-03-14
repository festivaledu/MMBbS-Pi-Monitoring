const chalk = require("chalk"),
	  cookieParser = require("cookie-parser"),
	  cors = require("cors"),
	  dotenv = require("dotenv"),
	  express = require("express"),
	  fs = require("fs"),
	  httpStatus = require("http-status"),
	  path = require("path");

const { Sequelize } = require('sequelize');

const Models = require("./models");

const { expand: dotenvExpand } = require("dotenv-expand");
dotenvExpand(dotenv.config({ path: `${process.cwd()}/.env` }));

Object.defineProperty(Object.prototype, "filter", {
	value: function(values) {
		return Object.keys(this).filter(k => values.includes(k)).reduce((r, k) => { r[k] = this[k]; return r; }, {});
	},
	enumerable: false
});

Object.defineProperty(Object.prototype, "prune", {
	value: function(values) {
		Object.keys(this).forEach(key => !this[key] && delete this[key]);

		return this;
	},
	enumerable: false
});

//#region Database Configuration
let sequelize = new Sequelize({
	storage: path.join(process.cwd(), process.env["DATABASE_FILENAME"]),
	dialect: "sqlite",
	logging: false
});

let database = {
	models: {},
	sequelize,
	Sequelize
}

Object.entries(Models).forEach(([modelName, model]) => {
	if (typeof model === "function") {
		database.models[modelName] = model(database.sequelize, Sequelize);
	}
});

Object.entries(database.models).forEach(([modelName, model]) => {
	if (model.associate) {
		model.associate(database.models);
	}
});

global.models = database.models;
//#endregion

let expressApp = express();
expressApp.set("json spaces", 2);
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());
expressApp.use(cookieParser());
expressApp.use(cors());

expressApp.use(express.static('../ui/dist'));
expressApp.use("/api/v1", require("./router"));

let listener = expressApp.listen(+process.env["SERVER_PORT"] || 3000, () => {
	database.sequelize.sync({
		// force: true
	});

	console.log(`[${chalk.blue("INFO")}] Server running on port ${listener.address().port}`);
});