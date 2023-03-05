const axios = require("axios"),
	  dotenv = require("dotenv"),
	  gpio = require("onoff"),
	  os = require("os");

const { expand: dotenvExpand } = require("dotenv-expand");
dotenvExpand(dotenv.config({ path: `${process.cwd()}/.env` }));

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

	const getRandomFloat = (min, max, decimals = 2) => {
		return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
	}

	let pushToServer = async () => {
		await axios.post(`${process.env.MONITOR_URL}/api/v1/sensors/publish?node.id=${nodeId}`, {
			temperature: getRandomFloat(20, 30),
			humidity: getRandomFloat(50, 85)
		});
	}

	pushToServer();
	let interval = setInterval(pushToServer, parseInt(process.env.UPDATE_INTERVAL) * 1000)
})();