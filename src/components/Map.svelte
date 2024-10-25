<script lang="ts">
	import { onMount } from 'svelte';
	import Marker from './Marker.svelte';
	import ZoomPan from './ZoomPan.svelte';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';

	let mapContainer: HTMLDivElement;
	let map_: HTMLImageElement;

	let click_pos: { x: number; y: number } = { x: 0, y: 0 };

	function detectClick(e: MouseEvent) {
		click_pos.x = e.x;
		click_pos.y = e.y;
		map_.addEventListener('mouseup', clickRelease);
	}

	function detectTouch(e: TouchEvent) {
		click_pos.x = e.touches[0].pageX;
		click_pos.y = e.touches[0].pageY;
		map_.addEventListener('touchend', touchRelease);
	}

	async function touchRelease(e: TouchEvent) {
		await determineMarkerRelease({ x: e.touches[0].pageX, y: e.touches[0].pageY });
	}

	async function clickRelease(e: MouseEvent) {
		await determineMarkerRelease({ x: e.x, y: e.y });
	}

	async function determineMarkerRelease(release_pos: { x: number; y: number }) {
		if (Math.abs(click_pos.x - release_pos.x) > 20 || Math.abs(click_pos.y - release_pos.y) > 20) {
			return;
		}
		const article = await dtb.get_article(store.project_id, store.map.article_id);
		if (article) {
			store.article_history.push(article.id);
			if (store.informatic_opened_by_marker){
				store.informatic_minimized = true;
			}
		}
		store.selected_marker = null;
		return;
	}

	onMount(() => {
		map_.addEventListener('mousedown', detectClick);
		map_.addEventListener('touchstart', detectTouch);
	});

	function get_relative_movement(x: number, y: number) {
		let rect = map_.getBoundingClientRect();
		let rel_x = Math.max(0, Math.min(((x - rect.x) / rect.width) * 100, 100));
		let rel_y = Math.max(0, Math.min(((y - rect.y) / rect.height) * 100, 100));
		let position: { x: number; y: number } = { x: rel_x, y: rel_y };
		return position;
	}

	let image_source = $state('');
	$effect(() => {
		if (store.map.image && store.image_public_urls[store.map.image]) {
			image_source = URL.createObjectURL(store.image_public_urls[store.map.image]);
		}
	});

	type transform={x: number; y: number; scale: number}
	let transf = $state<transform>({x: 0, y: 0, scale: 1})

	function update_scale(){
		transf={x: 0, y: 0, scale: window.innerHeight / map_.naturalHeight / window.innerWidth * map_.naturalWidth};
	}
</script>

<div id="map-container" bind:this={mapContainer}>
	<img id="map" alt="Map" bind:this={map_} src={image_source} onload={()=>{update_scale()}} />
	{#each store.markers as marker}
		<Marker marker_data={marker} {get_relative_movement} />
	{/each}
	<ZoomPan parent_selector="#map-container" transform={transf}/>
</div>

<style>
	#map-container {
		touch-action: none;
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	#map {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
