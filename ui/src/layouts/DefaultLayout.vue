<template>
	<nav class="navbar navbar-expand-md fixed-top bg-white border-bottom border-1">
		<div class="container-fluid">
			<a class="navbar-brand fw-bold" href="#">MmBBS Pi Monitoring</a>

			<div class="d-flex align-items-center">
				<div class="dropdown me-2">
					<div class="bg-light rounded-5 p-1" data-bs-toggle="dropdown" aria-expanded="false">
						<span class="fw-semibold mx-2 w-100">{{ timePeriodLabels[selectedTimePeriod] }}</span>
						<i class="bi bi-caret-down-fill mx-2 mx-md-1" />
					</div>

					<ul class="dropdown-menu dropdown-menu-end text-small shadow mt-2">
						<li v-for="(period, index) in timePeriods" :key="index">
							<a href="#" class="dropdown-item" :class="{ 'active': selectedTimePeriod == period }" @click.prevent="selectTimePeriod(period)">
								{{ timePeriodLabels[period] }}
							</a>
						</li>
					</ul>
				</div>

				<div class="dropdown">
					<div class="bg-light rounded-5 p-1" data-bs-toggle="dropdown" aria-expanded="false">
						<span class="fw-semibold mx-2 w-100">{{ temperatureUnits[selectedTemperatureUnit] }}</span>
						<i class="bi bi-caret-down-fill mx-2 mx-md-1" />
					</div>

					<ul class="dropdown-menu dropdown-menu-end text-small shadow mt-2">
						<li v-for="(id, index) in temperatureUnitIDs" :key="id">
							<a href="#" class="dropdown-item" :class="{ 'active': selectedTemperatureUnit == id }" @click.prevent="selectTemperatureUnit(id)">
								{{ temperatureUnitLabels[id] }} ({{ temperatureUnits[id] }})
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</nav>

	<main class="d-flex flex-nowrap h-100">
		<div class="container">
			<router-view />
		</div>
	</main>
</template>

<style lang="less">
main {
	padding: calc(~"1rem + 57px") 1rem 1rem !important;
}
</style>

<script>
import { TIME_PERIODS, TEMP_LABELS, TEMP_UNITS } from '../Utils'

export default {
	inject: ["$store"],
	methods: {
		// setMonitorUrl(url) {
		// 	this.$store.setMonitorUrl(url)
		// },
		selectTimePeriod(period) {
			this.$store.setTimePeriod(period)
		},
		selectTemperatureUnit(unit) {
			this.$store.setTemperatureUnit(unit)
		}
	},
	computed: {
		timePeriods() {
			return Object.keys(TIME_PERIODS);
		},
		timePeriodLabels() {
			return TIME_PERIODS;
		},
		temperatureUnitIDs() {
			return Object.keys(TEMP_UNITS);
		},
		temperatureUnits() {
			return TEMP_UNITS;
		},
		temperatureUnitLabels() {
			return TEMP_LABELS;
		},

		selectedTimePeriod() {
			return this.$store.state.timePeriod
		},
		selectedTemperatureUnit() {
			return this.$store.state.temperatureUnit
		},
	}
}
</script>