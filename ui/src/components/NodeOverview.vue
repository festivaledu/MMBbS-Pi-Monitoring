<template>
	<div class="node-container shadow p-3 mb-3 mb-md-5 bg-white rounded-4">
		<div class="d-flex justify-content-between align-items-center mb-3">
			<span class="fs-3 fw-bold">{{ node.hostname }}</span>
			<div class="border rounded-3 px-2" style="cursor: pointer" data-bs-toggle="collapse" :data-bs-target="`#collapse-node-${node.id}`">
				<i class="bi bi-three-dots text-muted" />
			</div>
			<span class="text-muted">updated {{ formatRelativeDate(currentEntry.createdAt) }}</span>
		</div>

		<div class="collapse" :id="`collapse-node-${node.id}`">
			<div class="card card-body flex-row">
				<div class="col-12 col-sm-4">
					<p class="fw-bold mb-0">Hostname</p>
					<pre>{{ node.hostname }}</pre>
				</div>
				<div class="col-12 col-sm-4">
					<p class="fw-bold mb-0">Ethernet (eth0)</p>
					<p class="mb-0">IPv4: <span class="font-monospace">{{ node.eth0_ipv4 || "unknown" }}</span></p>
					<p class="mb-0">MAC Address: <span class="font-monospace">{{ node.eth0_mac || "unknown" }}</span></p>
				</div>
				<div class="col-12 col-sm-4">
					<p class="fw-bold mb-0">Wi-Fi (wlan0)</p>
					<p class="mb-0">IPv4: <span class="font-monospace">{{ node.wlan0_ipv4 || "unknown" }}</span></p>
					<p class="mb-0">MAC Address: <span class="font-monospace">{{ node.wlan0_mac || "unknown" }}</span></p>
				</div>
			</div>
		</div>

		<LineChart ref="chart" class="mb-3" :chartData="chartData" :options="chartOptions" :height="250" />

		<div class="d-flex justify-content-between align-items-center">
			<div class="text-start">
				<span class="d-block text-muted mb-0">Temperature</span>
				<span class="d-block fs-4 fw-semibold mb-0">{{ convertCelsiusToSelectedUnit(currentEntry?.temperature) || "––" }} {{ temperatureUnitLabel }}</span>
			</div>

			<div class="text-end">
				<span class="d-block text-muted mb-0">Humidity</span>
				<span class="d-block fs-4 fw-semibold mb-0">{{ currentEntry?.humidity || "––" }}%</span>
			</div>
		</div>
	</div>
</template>

<script>
import 'chartjs-adapter-dayjs'
import dayjs from 'dayjs'

import { LineChart } from 'vue-chart-3'

import { TIME_PERIODS, TEMP_LABELS, TEMP_UNITS } from '../Utils'

export default {
	props: ["node", "sensorEntries"],
	components: { LineChart },
	inject: ["$store"],
	data() {
		return {
			chartMinDate: dayjs().subtract(Math.max(this.$store.state.timePeriod, 1), "minutes").format(),
			chartMaxDate: dayjs().format(),
		}
	},
	methods: {
		convertCelsiusToSelectedUnit(temp) {
			switch (this.$store.state.temperatureUnit) {
				case 0: return (temp).toFixed(2);
				case 1: return ((temp * 1.8) + 32).toFixed(2);
				case 2: return (temp + 273.15).toFixed(2);
				case 3: return ((temp + 273.15) * 9/5).toFixed(2);
				case 4: return (temp * 0.8).toFixed(2);
			}
		},
		createLinearGradient(context, datasetIndex = 0) {
			const chart = context.chart;
			const {ctx, chartArea} = chart;

			if (!chartArea) {
				return "#f0f";
			}

			return chart.config.data.datasets[datasetIndex].borderColor;

			let rgb = chart.config.data.datasets[datasetIndex].borderColor;
			let sep = rgb.indexOf(",") > -1 ? "," : " ";
			rgb = rgb.substr(4).split(")")[0].split(sep);

			let r = (+rgb[0]),
				g = (+rgb[1]),
				b = (+rgb[2]);

			const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

			gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.0)`);
			gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.25)`);

			console.log(`rgba(${r}, ${g}, ${b}, 0.0)`)
			console.log(`rgba(${r}, ${g}, ${b}, 0.25)`)

			return gradient;
		},
		formatAbsoluteDate(date) {
			return dayjs(date).format("YYYY/MM/DD HH:mm:ss");
		},
		formatRelativeDate(date) {
			return dayjs().to(dayjs(date));
		},
	},
	computed: {
		chartOptions() {
			return {
				animations: false,
				plugins: {
					// legend: { display: false },
					tooltip: {
						enabled: false
					}
				},
				scales: {
					x: {
						type: "time",
						time: {
							minUnit: "minute",
							round: "second",
							displayFormats: {
                                minute: "HH:mm",
                                hour: "MM/DD HH:mm",
                            },
							parser(timestamp) {
								return dayjs(timestamp).add(new Date().getTimezoneOffset() * -1, "minutes")
							}
						},
						min: this.chartMinDate,
						max: this.chartMaxDate,
						ticks: {
                            maxRotation: 0,
                            autoSkipPadding: 30,
						}
					},
					y: {
						suggestedMin: 0,
						suggestedMax: 50,
						ticks: {
							callback: (value, index, ticks) => {
								return `${value} ${this.temperatureUnitLabel}`;
							}
						}
					},
					y1: {
						position: "right",
						min: 0,
						max: 100,
						grid: {
							display: false,
						},
						ticks: {
							callback: (value, index, ticks) => {
								return `${value} %`;
							}
						}
					}
				}
			}
		},
		chartData() {
			let temperatureData = [];
			let humidityData = [];

			this.sensorEntries
				.filter(entry => dayjs(entry.createdAt).isAfter(dayjs().subtract(Math.max(this.$store.state.timePeriod, 1) + 10, "minutes")))
				.map(entry => {
					let x = dayjs(entry.createdAt).format();

					temperatureData.push({
						x,
						y: this.convertCelsiusToSelectedUnit(entry.temperature),
					});

					humidityData.push({
						x,
						y: entry.humidity,
					})
				});

			return {
				datasets: [{
					label: "Temperature",
					yAxisID: "y",
					borderColor: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--bs-primary-rgb')})`,
					borderWidth: 2,
					radius: 0,
					backgroundColor: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--bs-primary-rgb')})`,
					// backgroundColor: (context) => {
					// 	return this.createLinearGradient(context, 0)
					// },
					// fill: true,
					cubicInterpolationMode: "monotone",
					data: temperatureData
				}, {
					label: "Humidity",
					yAxisID: "y1",
					borderColor: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--bs-warning-rgb')})`,
					borderWidth: 2,
					radius: 0,
					backgroundColor: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--bs-warning-rgb')})`,
					// backgroundColor: (context) => {
					// 	return this.createLinearGradient(context, 1)
					// },
					// fill: true,
					cubicInterpolationMode: "monotone",
					data: humidityData
				}]
			}
		},
		currentEntry() {
			if (!this.sensorEntries || !this.sensorEntries.length) return null;

			return this.sensorEntries[this.sensorEntries.length - 1];
		},
		temperatureUnitLabel() {
			return TEMP_UNITS[this.$store.state.temperatureUnit];
		}
	},
	watch: {
		sensorEntries(value) {
			this.chartMinDate = dayjs().subtract(Math.max(this.$store.state.timePeriod, 1), "minutes").format();
			this.chartMaxDate = dayjs().format();

			this.$refs.chart.update();
		},
		"$store.state.timePeriod"(value) {
			this.chartMinDate = dayjs().subtract(Math.max(value, 1), "minutes").format();
			this.chartMaxDate = dayjs().format();
		}
	}
}
</script>