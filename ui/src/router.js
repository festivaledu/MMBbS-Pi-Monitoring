import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from './layouts/DefaultLayout.vue'

import Home from './pages/Home.vue'

const routes = [
	{
		path: "/",
		component: DefaultLayout,
		children: [{
			path: "/",
			component: Home
		}]
	}
];

const router = createRouter({
	linkActiveClass: "active",
    history: createWebHistory(),
    routes,
});

export default router;