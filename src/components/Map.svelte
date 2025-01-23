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

	let {map_container_rect}: {map_container_rect: {x: number, y: number, width: number, height: number}} = $props()

	let click_pos: { x: number; y: number } = { x: 0, y: 0 }; 

	let lines = $state<{x: number, y: number}[][]>([])
	let current_line_index = 0
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
			lines = [];
			return;
		}
		if (lines === undefined || current_line_index !== lines.length - 1)
		{
			current_line_index = lines.length
			lines.push([])
		}
		const relative_position = get_relative_position(release_pos)
		lines[current_line_index].push(relative_position)
		if(lines[current_line_index].length === 1){lines[current_line_index].push(relative_position)}

		map_.addEventListener('mousemove', track_latest_node)
		tracking_node = true
	}
	
	
	function track_latest_node(e: MouseEvent){
		lines[current_line_index][lines[current_line_index].length - 1] = get_relative_position({x: e.x, y: e.y})
	}
	
	function detect_escape(e: KeyboardEvent){
		if (e.key !== 'Escape'){return}
		if (tracking_node){
			tracking_node = false;
			map_.removeEventListener('mousemove', track_latest_node);
			if (lines[current_line_index].length > 2)
			{
				lines[current_line_index].pop();
				current_line_index += 1;
			}
			else
			{
				lines[current_line_index] = [];
			}
			
			return;
		}
		lines = []
	}
	
	function get_relative_position(position: {x: number, y: number}){
		return {x: (position.x - store.map_transform.x - map_container_rect.x)/store.map_transform.scale, y: (position.y - store.map_transform.y - map_container_rect.y)/store.map_transform.scale}
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
		const screen_width = store.mobile_layout ? window.screen.width : window.innerWidth
		const map_height = map_container_rect.height === 0 ? store.mobile_layout ? window.screen.height : window.innerHeight : map_container_rect.height
		zoompan_element.set_transform({x: 0, y: 0, scale: map_height / map_.naturalHeight / screen_width * map_.naturalWidth});
	}

	let offset_limit = $state({x: 0, y: 0, width: 1920, height: 1080})
	function update_offset_limit(){
		offset_limit = {x: 0, y: 0, width: map_container_rect.width, height: map_container_rect.height}
	}

	function on_zoompan(transform: {x: number, y: number, scale: number}){
		store.map_transform = transform;
	}

	$effect(() => {
		store.informatic_minimized;
		store.informatic_dim;
		update_offset_limit();
	})

</script>

<div id="map" bind:this={mapContainer}>
	<img id="map_image" alt="Map" bind:this={map_} src={image_source} onload={()=>{update_scale(); lines = []; store.drawing_path = false;}} />
	{#if !store.drawing_path}
		{#each store.markers as marker}
			<Marker marker_data={marker} {get_relative_movement} />
		{/each}
	{/if}

	{#if store.map.scale !== null}
		{#each lines as line}
			<ScaleBar path_nodes={line} scale={store.map.scale} unit_group={store.unit_group}/>
		{/each}
	{/if}

	<ZoomPan bind:this={zoompan_element} parent_selector="#map" offset_limit={offset_limit} scale_limit={{min: 0.3, max: 5}} on_zoompan={on_zoompan}/>
</div>

<style>
	#map {
		touch-action: none;
		position: absolute;
		width: 100%;
		height: auto;
	}

	#map_image {
		overflow: hidden;
		width: 100%;
		height: 100%;
	}
</style>
