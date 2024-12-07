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
	let tracking_node: boolean = false;

	function detect_click(e: MouseEvent) {
		click_pos.x = e.x;
		click_pos.y = e.y;
		map_.addEventListener('mouseup', click_release);
	}

	function detect_touch(e: TouchEvent) {
		click_pos.x = e.touches[0].pageX;
		click_pos.y = e.touches[0].pageY;
		map_.addEventListener('touchend', touch_release);1
	}

	async function touch_release(e: TouchEvent) {
		await on_release({ x: e.touches[0].pageX, y: e.touches[0].pageY });
	}

	async function click_release(e: MouseEvent) {
		await on_release({ x: e.x, y: e.y });
	}

	async function on_release(release_pos: { x: number; y: number }) {
		if (Math.abs(click_pos.x - release_pos.x) > 20 || Math.abs(click_pos.y - release_pos.y) > 20) {
			// Mouse has panned too much, don't register as click
			return;
		}
		if (!store.drawing_path){
			// TODO: This is too flimsy of an action rule setup
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
		const relative_position = get_relative_position(release_pos)
		nodes.push(relative_position)
		if(nodes.length === 1){nodes.push(relative_position)}

		map_.addEventListener('mousemove', track_latest_node)
		tracking_node = true
	}
	
	
	function track_latest_node(e: MouseEvent){
		nodes[nodes.length - 1] = get_relative_position({x: e.x, y: e.y})
	}
	
	function detect_escape(e: KeyboardEvent){
		if (e.key !== 'Escape'){return}
		if (tracking_node){
			tracking_node = false;
			map_.removeEventListener('mousemove', track_latest_node);
			nodes.length > 2 ? nodes.pop() : nodes = [];
			return;
		}
		nodes = []
	}
	
	function get_relative_position(position: {x: number, y: number}){
		return {x: (position.x - store.map_transform.x)/store.map_transform.scale, y: (position.y - store.map_transform.y)/store.map_transform.scale}
	}

	function get_relative_movement(x: number, y: number) {
		let rect = map_.getBoundingClientRect();
		let rel_x = Math.max(0, Math.min(((x - rect.x) / rect.width) * 100, 100));
		let rel_y = Math.max(0, Math.min(((y - rect.y) / rect.height) * 100, 100));
		let position: { x: number; y: number } = { x: rel_x, y: rel_y };
		return position;
	}

	onMount(() => {
		map_.addEventListener('mousedown', detect_click);
		map_.addEventListener('touchstart', detect_touch);
		window.addEventListener('keydown', detect_escape)
		window.addEventListener('resize', update_offset_limit);
	});
	

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
