<script lang="ts">
	import dtb from '$lib/dtb';
	import type { Article, MapData } from '$lib/types';
	import { get } from 'svelte/store';
	import { store } from '../store.svelte';
	import { fade } from 'svelte/transition';
	import { assert, assert_unreachable } from '$lib/utils';
	import { untrack } from 'svelte';

	let { map_id = null, article_id = null, scale }: { map_id: number | null; article_id: number | null, scale: number } =
		$props();

	let intermediate_image = $state<string>('');
	let title = $state<string>('');
	let default_img: string = '';

	async function get_data() {
		assert(map_id === null || article_id === null, 'Both map id and article id are not null');
		let response;
		if (map_id !== null) {
			response = await dtb.get_map(store.project_id, map_id);
			default_img = '/assets/old_map.png';
		} else if (article_id !== null) {
			response = await dtb.get_article(store.project_id, article_id);
			default_img = '/assets/Parchment.png';
		}

		if (response) {
			title = response.title;
			intermediate_image = response.image ?? default_img;
		}
	}

	let image = $state<string>('');
	$effect(() => {
		image = store.image_public_urls[intermediate_image]
			? URL.createObjectURL(store.image_public_urls[intermediate_image])
			: default_img;
	});

	get_data();
</script>

<div id='border'
	transition:fade={{ duration: 300 }}
	style="transform: scale({1 / scale}) translateX(-50%);">
	<div id="marker_window">
		<div id="window_content">
			<h1>{title}</h1>
			<img src={image} alt="MarkerWindow" />
		</div>
	</div>
</div>

<style>
	#border {
		position: inherit;
		left: 50%;
		bottom: 100%;
		background: var(--main_gold);
		width: 150px;
		max-width: none;
		color: var(--main_white);
		border-radius: 10px;
		transform-origin: bottom left;
		clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 50% 100%, 0% 90%);
		padding-bottom: 20px;

		z-index: 50;
	}
	#marker_window {
		position: relative;

		background: rgb(60, 60, 60);
		height: 95%;
		padding-bottom: 20px;
		color: var(--main_white);
		margin: 0px 2.5%;
		top: 10px;
		border-radius: 10px;
		clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 50% 100%, 0% 90%);
	}

	@media(max-width: 1300px){
		#border{
			width: 100px;
		}
	}

	#window_content {
		width: 90%;
		overflow-y: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-left: 5%;
	}

	#window_content img {
		position: relative;
		max-width: 100%;
		height: auto;
	}

	h1 {
		position: relative;
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
		margin-bottom: 5px;
		margin-top: 5px;
	}
</style>
