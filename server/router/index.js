const express = require("express"),
	  fs = require("fs"),
	  httpStatus = require("http-status"),
	  path = require("path");

const { unflatten } = require("flat"),
	  { Sequelize } = require("sequelize"),
	  { v4: uuid } = require("uuid")

let router = express.Router();

router.use((req, res, next) => {
	if (req.query) req.query = unflatten(req.query);

	return next();
});

router.get("/nodes", async (req, res) => {
	const { Node } = global.models;

	let nodeList = await Node.findAll();

	return res.status(200).json(nodeList);
});

router.post("/nodes/register", async (req, res) => {
	try {
		const { Node } = global.models;

		let [ nodeObj, created ] = await Node.findOrCreate({
			where: {
				id: req.body["id"]
			},
			defaults: {
				id: req.body["id"],
				hostname: req.body["hostname"],
				interfaces: req.body["interfaces"]
			}
		});

		if (!created) {
			nodeObj.update({
				hostname: req.body["hostname"],
				interfaces: req.body["interfaces"]
			});
		}

		return res.status(httpStatus.OK).json(nodeObj);
	} catch (error) {
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			error: {
				name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
				code: httpStatus.INTERNAL_SERVER_ERROR,
				error: error.message
			}
		});
	}
});

router.get("/sensors", async (req, res) => {
	const { Node, TemperatureEntry } = global.models;

	if (req.query.node) {
		let query = (req.query.node || {}).filter(["id", "hostname", "eth0_mac", "eth0_ipv4", "wlan0_mac", "wlan0_ipv4"]);
		if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).json({
			error: {
				name: httpStatus[httpStatus.BAD_REQUEST],
				code: httpStatus.BAD_REQUEST
			}
		});

		let nodeObj = await Node.findOne({
			where: {
				...query
			}
		});

		if (!nodeObj) return res.status(httpStatus.NOT_FOUND).json({
			error: {
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND
			}
		});

		let sensorEntryList = await TemperatureEntry.findAll({
			where: {
				nodeId: nodeObj.id
			},
			order: [["createdAt", "ASC"]]
		});

		return res.status(httpStatus.OK).json(sensorEntryList);
	} else {
		let sensorEntryList = await TemperatureEntry.findAll({
			order: [["createdAt", "ASC"]]
		});

		return res.status(httpStatus.OK).json(sensorEntryList);
	}
});

router.post("/sensors/publish", async (req, res) => {
	try {
		const { Node, TemperatureEntry } = global.models;

		let query = (req.query.node || {}).filter(["id", "hostname", "eth0_mac", "eth0_ipv4", "wlan0_mac", "wlan0_ipv4"]);
		if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).json({
			error: {
				name: httpStatus[httpStatus.BAD_REQUEST],
				code: httpStatus.BAD_REQUEST,
				message: "No node specified"
			}
		});

		let { temperature, humidity } = req.body;
		if (temperature == null || humidity == null) return res.status(httpStatus.BAD_REQUEST).json({
			error: {
				name: httpStatus[httpStatus.BAD_REQUEST],
				code: httpStatus.BAD_REQUEST,
				message: "Missing entry details"
			}
		});

		let nodeObj = await Node.findOne({
			where: {
				...query
			}
		});

		if (!nodeObj) return res.status(httpStatus.NOT_FOUND).json({
			error: {
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND
			}
		});

		let sensorEntryObj = await TemperatureEntry.create({
			id: uuid(),
			temperature,
			humidity,
			nodeId: nodeObj.id
		});

		return res.status(httpStatus.OK).json(sensorEntryObj);
	} catch (error) {
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			error: {
				name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
				code: httpStatus.INTERNAL_SERVER_ERROR,
				error: error.message
			}
		});
	}
});

module.exports = router;