const axios = require("axios"),
	  dht = require("node-dht-sensor"),
	  dotenv = require("dotenv"),
	  ds18x20 = require("ds18x20"),
	  os = require("os"),
	{ machineId } = require("node-machine-id");

const { expand: dotenvExpand } = require("dotenv-expand");
dotenvExpand(dotenv.config({ path: `${process.cwd()}/.env` }));

let sensor = null;

if (+process.env["USE_DHT_SENSOR"]) {
	console.log(`Using sensor of type DHT${process.env["DHT_TYPE"]}.`);
} else {
	if (!ds18x20.isDriverLoaded()) {
		throw new Error("w1 driver is not loaded (modprobe w1-therm/w1-gpio)");
	}

	console.log(`Using sensor of type DS18x20.`);
	sensor = ds18x20.list()[0];
}

(async () => {
	let nodeId = await machineId({ original: true});
	let interfaces = Object.entries(os.networkInterfaces()).reduce((list, [interfaceName, interfaceData]) => {
		if (interfaceData.some(_ => _.internal)) return list;

		list[interfaceName] = interfaceData.find(_ => _.family === "IPv4");

		return list;
	}, {});

	await axios.post(`${process.env.MONITOR_URL}/api/v1/nodes/register`, {
		id: nodeId,
		hostname: os.hostname(),
		interfaces
	}).then(response => response.data);


	let pushToServer = async () => {
		let temperature = null,
			humidity = null;

		if (+process.env["USE_DHT_SENSOR"]) {
			let sensor = await dht.read(+process.env["DHT_TYPE"], +process.env["DHT_GPIO"]);

			temperature = sensor.temperature;
			humidity = sensor.humidity;
		} else {
			temperature = ds18x20.get(sensor);
		}

		await axios.post(`${process.env.MONITOR_URL}/api/v1/sensors/publish?node.id=${nodeId}`, {
			temperature,
			humidity
		});
	}

	pushToServer();
	let interval = setInterval(pushToServer, parseInt(process.env.UPDATE_INTERVAL) * 1000)
})();