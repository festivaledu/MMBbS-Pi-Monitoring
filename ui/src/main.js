import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import RelativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(RelativeTime)

const app = createApp(App)

app.use(router);
app.provide("$store", store);

app.mount('#app')
