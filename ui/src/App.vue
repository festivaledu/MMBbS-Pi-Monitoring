<template>
	<router-view />
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {

}
</script>