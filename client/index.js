const axios = require("axios"),
	  dht = require("node-dht-sensor"),
	  dotenv = require("dotenv"),
	  ds18x20 = require("ds18x20"),

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
	let interfaces = os.networkInterfaces();
	let wlan0 = interfaces["en0"].find(_ => _.family == "IPv4");
	let eth0 = interfaces["en5"].find(_ => _.family == "IPv4");

	let nodeObj = await axios.post(`${process.env.MONITOR_URL}/api/v1/nodes/register`, {
		hostname: os.hostname(),
		eth0_mac: eth0.mac,
		eth0_ipv4: eth0.address,
		wlan0_mac: wlan0.mac,
		wlan0_ipv4: wlan0.address,
	}).then(response => response.data);

	const nodeId = nodeObj.id;

	let pushToServer = async () => {
		let temperature = 0.0,
			humidity = 0.0;

		if (+process.env["USE_DHT_SENSOR"]) {
			let sensor = await dht.read(+process.env["DHT_TYPE"], +process.env["DHT_GPIO"]);

			temperature = sensor.temperature;
			humidity = sensor.humidity;
		} else {
			temperature = ds18x20.get(sensor);
			humidity = 0;
	}

		await axios.post(`${process.env.MONITOR_URL}/api/v1/sensors/publish?node.id=${nodeId}`, {
			temperature,
			humidity
		});
	}

	pushToServer();
	let interval = setInterval(pushToServer, parseInt(process.env.UPDATE_INTERVAL) * 1000)
})();