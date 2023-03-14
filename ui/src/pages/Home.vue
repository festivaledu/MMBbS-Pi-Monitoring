<template>
	<template v-if="(nodes && nodes.length) && (sensorEntries && sensorEntries.length)">
		<NodeOverview v-for="node in nodes" :node="node" :sensorEntries="sortedSensorEntries[node.id]" />
	</template>

	<template v-else>
		<p class="my-5 text-center text-muted">No data to display.</p>
	</template>
</template>

<script>
import NodeOverview from './../components/NodeOverview.vue'

export default {
	components: {
		NodeOverview
	},
	data() {
		return {
			nodes: [],
			sensorEntries: [],
			updateInterval: null
		}
	},
	async mounted() {
		let serverUrl = `${location.hostname}:3000`;

		let urlParams = new URLSearchParams(location.search);
		if (urlParams.has("server")) {
			serverUrl = urlParams.get("server");
		}

		try {
			this.nodes = await fetch(`http://${serverUrl}/api/v1/nodes`).then(data => data.json());
			this.sensorEntries = await fetch(`http://${serverUrl}/api/v1/sensors`).then(data => data.json());

			this.updateInterval = setInterval(async () => {
				this.nodes = await fetch(`http://${serverUrl}/api/v1/nodes`).then(data => data.json());
				this.sensorEntries = await fetch(`http://${serverUrl}/api/v1/sensors`).then(data => data.json());
			}, 5 * 1000);
		} catch (error) {
			alert(`Failed to connect to http://${serverUrl}`);
		}
	},
	destroyed() {
		clearInterval(this.updateInterval)
	},
	computed: {
		sortedSensorEntries() {
			return this.sensorEntries.reduce((sensorEntries, sensorEntry) => {
				if (!sensorEntries[sensorEntry.nodeId]) sensorEntries[sensorEntry.nodeId] = [];

				sensorEntries[sensorEntry.nodeId].push(sensorEntry);

				return sensorEntries;
			}, {});
		}
	}
}
</script>