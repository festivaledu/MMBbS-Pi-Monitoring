import { reactive, readonly } from "vue";

const state = reactive({
	temperatureUnit: parseInt(localStorage.temperatureUnit ?? 0), // 0 = C, 1 = F, 2 = K, 3 = R, 4 = Re
	timePeriod: localStorage.timePeriod ?? 30 // minutes; 5, 10, 15, 30, 60, 180, 360, 720, 1440, 2880, 10080
});

export default {
	state: readonly(state),

	setTemperatureUnit(unit) {
		state.temperatureUnit = parseInt(unit);
		localStorage.temperatureUnit = parseInt(unit);
	},
	setTimePeriod(period) {
		state.timePeriod = parseInt(period);
		localStorage.timePeriod = parseInt(period);
	}
};
