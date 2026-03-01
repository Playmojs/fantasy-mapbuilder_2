<script lang="ts">
	import dtb from '$lib/dtb';
	import type { MarkerWindowData } from '$lib/types';
	import { store } from '../store.svelte';
	import { fade } from 'svelte/transition';
	import { assert} from '$lib/utils';

	let { markerWindowData}: { markerWindowData: MarkerWindowData} =
		$props();

	let intermediate_image = $state<string>('');
	let title = $state<string>('');
	let default_img: string = '';

	async function get_data() {
		assert(markerWindowData.map_id === null || markerWindowData.article_id === null, 'Both map id and article id are not null');
		let response;
		if (markerWindowData.map_id !== null) {
			response = await dtb.get_map(store.project_id, markerWindowData.map_id);
			default_img = '/assets/old_map.png';
		} else if (markerWindowData.article_id !== null) {
			response = await dtb.get_article(store.project_id, markerWindowData.article_id);
			default_img = '/assets/Parchment.png';
		}

		if (response) {
			title = response.title;
			intermediate_image = response.image ?? default_img;
		}
	}

	let image = $derived(store.image_public_urls[intermediate_image]
			? URL.createObjectURL(store.image_public_urls[intermediate_image])
			: default_img);

	$effect(()=>
	{
		markerWindowData;
		get_data();
	})
</script>

<div id='border'
	transition:fade={{ duration: 300 }}
	class:attach_bottom={markerWindowData.attach_bottom}
	style="
		top: {markerWindowData.y}px; 
		left: {markerWindowData.x}px;
		transform: translateX(-50%) {markerWindowData.attach_bottom ? "translateY(-100%)": ""};
	">
	<div id="marker_window"
		class:attach_bottom={markerWindowData.attach_bottom}>
		<div id="window_content"
			class:attach_bottom={markerWindowData.attach_bottom}>
			<h1>{title}</h1>
			<img src={image} alt="MarkerWindow" />
		</div>
	</div>
</div>

<style>
	#border {
		position: absolute;
		background: var(--color-accent);
		width: 150px;
		max-width: none;
		color: var(--color-text-primary);
		border-radius: 10px;
		transform-origin: bottom left;
		padding-bottom: 20px;
		pointer-events: none;
		
		z-index: 50;
	}

	.attach_bottom
	{
		clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 50% 100%, 0% 90%);
	}

	#marker_window {
		position: relative;

		background: var(--color-panel);
		height: 95%;
		padding-bottom: 20px;
		color: var(--color-text-primary);
		margin: 0px 2.5%;
		top: 10px;
		border-radius: 10px;
		text-overflow: ellipsis;
	}

	@media(max-width: 1300px){
		#border{
			width: 120px;
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
		color: var(--color-text-primary);
		margin-bottom: var(--space-xs);
		margin-top: var(--space-xs);
	}
</style>
