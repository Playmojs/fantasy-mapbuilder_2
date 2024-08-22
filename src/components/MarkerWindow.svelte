<script lang="ts">
	import dtb from '$lib/dtb';
	import type { Article, MapData } from '$lib/types';
	import { get } from 'svelte/store';
	import { store } from '../store.svelte';
	import { fade } from 'svelte/transition';
	import { assert, assert_unreachable } from '$lib/utils';

	export let map_id: number | null;
	export let article_id: number | null;

	let image: string;
	let title: string;

	async function get_data() {
		assert(map_id !== null || article_id !== null, 'Both map id and article id are not null');
		let response;
		let default_img: string = '';
		if (map_id !== null) {
			response = await dtb.get_map(map_id);
			default_img = '/assets/article_icon.png';
		} else if (article_id !== null) {
			response = await dtb.get_article(article_id);
			default_img = '/assets/article_icon.png';
		}

		if (response) {
			title = response.title;
			image = response.image ?? default_img;
		}
	}

	get_data();
</script>

<div
	id="marker_window"
	transition:fade={{ duration: 300 }}
	style="transform: scale({1 / store.map_transform.scale}) translateX(-50%);"
>
	<div id="window_content">
		<h1>{title}</h1>
		<img src={image} alt="MarkerWindow" />
	</div>
</div>

<style>
	#marker_window {
		position: fixed;
		left: 50%;
		bottom: 100%;
		background: rgb(47, 47, 47);
		width: 150px;
		height: auto;
		max-width: none;
		color: white;
		border-radius: 10px;
		transform-origin: bottom left;
		clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 50% 100%, 0% 90%);
		padding-bottom: 20px;
	}

	#window_content {
		width: 90%;
		overflow-y: hidden;
		max-height: 90%;
		padding: 5%;
	}

	#window_content img {
		position: relative;
		display: block;
		max-width: 100%;
		height: auto;
	}

	h1 {
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
		margin-bottom: 5px;
		margin-top: 5px;
	}
</style>
