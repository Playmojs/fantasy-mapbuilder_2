<script lang="ts">
	import { onMount } from 'svelte';
	import Marker from './Marker.svelte';
	import ZoomPan from './ZoomPan.svelte';
	import { store } from '../store.svelte';
	import dtb from '$lib/dtb';
	import { push_article } from '$lib/article_stack';
	import ScaleBar from './ScaleBar.svelte';

	let mapContainer: HTMLDivElement;
	let map_: HTMLImageElement;

	let click_pos: { x: number; y: number } = { x: 0, y: 0 };

	let nodes = $state<{x: number, y: number}[]>([])

	function detectClick(e: MouseEvent) {
		click_pos.x = e.x;
		click_pos.y = e.y;
		map_.addEventListener('mouseup', clickRelease);
	}

	function detectTouch(e: TouchEvent) {
		click_pos.x = e.touches[0].pageX;
		click_pos.y = e.touches[0].pageY;
		map_.addEventListener('touchend', touchRelease);1
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
		if (!store.drawing_path){
			const article = await dtb.get_article(store.project_id, store.map.article_id);
			if (article && article.id !== store.article.id) {
					push_article(article.id, true);
					if (store.informatic_opened_by_marker){
						store.informatic_minimized = true;
				}
			}
			store.selected_marker = null;
			nodes = [];
			return;
		}
		nodes.push({x: (release_pos.x - store.map_transform.x)/store.map_transform.scale, y: (release_pos.y - store.map_transform.y)/store.map_transform.scale})
	}

	onMount(() => {
		map_.addEventListener('mousedown', detectClick);
		map_.addEventListener('touchstart', detectTouch);
		window.addEventListener('resize', update_offset_limit);
	});
	
	function get_relative_movement(x: number, y: number) {
		let rect = map_.getBoundingClientRect();
		let rel_x = Math.max(0, Math.min(((x - rect.x) / rect.width) * 100, 100));
		let rel_y = Math.max(0, Math.min(((y - rect.y) / rect.height) * 100, 100));
		let position: { x: number; y: number } = { x: rel_x, y: rel_y };
		return position;
	}

	let image_source = $derived<string>(store.map.image && store.image_public_urls[store.map.image] ? URL.createObjectURL(store.image_public_urls[store.map.image]) : '')
	
	let zoompan_element: ZoomPan
		
	function update_scale(){
			zoompan_element.set_transform({x: 0, y: 50, scale: (window.innerHeight-50) / map_.naturalHeight / window.innerWidth * map_.naturalWidth});
	}

	let offset_limit = $state({x: 0, y: 50, width: 1920, height: 1080})
	function update_offset_limit(){
		if (!window){return}
		offset_limit = {x: 0, y: 50, width: window.innerWidth*(store.informatic_minimized ? 1 : store.informatic_width / 100), height: window.innerHeight - 50}
	}

	function on_zoompan(transform: {x: number, y: number, scale: number}){
		store.map_transform = transform;
	}

	$effect(() => {
		store.informatic_minimized;
		store.informatic_width;
		update_offset_limit();
	})

</script>

<div id="map-container" bind:this={mapContainer}>
	<img id="map" alt="Map" bind:this={map_} src={image_source} onload={()=>{update_scale(); nodes = []; store.drawing_path = false;}} />
	{#if !store.drawing_path}
		{#each store.markers as marker}
			<Marker marker_data={marker} {get_relative_movement} />
		{/each}
	{/if}

	{#if store.map.scale !== null}
		<ScaleBar path_nodes={nodes} scale={store.map.scale}/>
	{/if}

	<ZoomPan bind:this={zoompan_element} parent_selector="#map-container" offset_limit={offset_limit} scale_limit={{min: 0.3, max: 5}} on_zoompan={on_zoompan}/>
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
