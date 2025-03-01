<script lang="ts">
	import {
		type ModalEntity,
		type GraphModalData,
	} from '$lib/types';
	import { store } from '../../store.svelte';
	import dtb from '$lib/dtb';
	import { gotoMap } from '$lib/goto_map';
	import { push_promise_modal, push_modal, choose_existing_map} from '$lib/modal_manager.svelte';
	import DropdownMapAndArticleSearch from '../DropdownMapAndArticleSearch.svelte';
	import { generate_map_graph } from '$lib/graph_gen.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { goto } from '$app/navigation';

    let use_graph = $state<boolean>(false)
	let display_button_option = $state<boolean>(false)
	let button_hold: boolean = false;

	async function toggle_display_options_button(e: Event){
		button_hold = true;
		await new Promise((r) => {setTimeout(r, 400)})
		if(button_hold){
			display_button_option = true;
			window.addEventListener('click', ()=>{display_button_option=false})
		}
	}

	const go_to_article_or_map_modal = async () => {
		let value: {id: number| null} = {id: null}
		await push_promise_modal({type: "choose_modal", data: {Maps: await choose_existing_map(value)}, use_search: true})
		if(value.id !== null){
			gotoMap(value.id)
        }
	}
	
	async function open_map_graph(){
		await dtb.fetch_all_from_project(store.project_id);
		let graph = generate_map_graph();
		let graph_data: GraphModalData = {graph_entities: {}, head_id: store.project_cache[store.project_id].head_map_id};
		Object.entries(graph).forEach(([id, value]) => {
			const entity: ModalEntity = {
				title: store.map_cache[+id].title,
				image: URL.createObjectURL(store.image_public_urls[store.map_cache[+id].image]),
				on_click: () => {gotoMap(+id)}
			}
			graph_data.graph_entities[+id] = {
				children: value,
				entity: entity
			}
		})
		push_modal({type: 'graph_modal', data: graph_data, use_search: false})
	}
</script>

<div id="toolbar">
	<button
			onclick={() => {
				goto('/projects');
			}}
			style="background-image: url('/assets/house.png');"
			aria-label="Home Button"
			title="Home"
		>
	</button>
    <div id="search_bar">
        <DropdownMapAndArticleSearch/>
    </div>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div id="cycle_button" 
		ontouchstart={toggle_display_options_button} 
		ontouchend={()=>{button_hold=false}} 
		oncontextmenu={(e) => e.preventDefault()}
		aria-roledescription="Cycle button"
		class:open={display_button_option}>
		{#if use_graph}
		<button
			class="toolbar_button"
			onclick={()=>{
				if(display_button_option){return}
				open_map_graph();}}
			style="background-image: url('/assets/Map_icon (2).png');"
			aria-label="Open Map Graph"
			title="Open Map Graph"
			>
		</button>
		{:else}
		<button
			class="toolbar_button"
			onclick={()=>{
				if(display_button_option){return}
				go_to_article_or_map_modal();}}
			style="background-image: url('/assets/old_map.png');"
			aria-label="Go to Map"
			title="Go to Map"
			>
		</button>
		{/if }
		{#if display_button_option}
		<div id="cycle_button_bottom"
			class=open>
		<button
			onclick={() => use_graph = !use_graph}
			style="background-image: url('/assets/{use_graph ? "old_map.png" : "Map_icon (2).png"}');"
			aria-label="Choose new button"
			title="Choose new button"
		></button>
		</div>
		{/if}
	
	
	</div>
</div>

<style>
	#toolbar {
		flex: 0 0 70px;
        padding: 0px 10px 0px 5px;
		gap: 10px;

		display: flex;
		justify-content: end;
		align-items: center;

		color: var(--main_white);
		z-index: 11;
	}

	button{
		aspect-ratio: 4/3;
		height: 40px;
		border: none;
		cursor: pointer;
		background-size: contain;
		background-position: center center;
		background-repeat: no-repeat;
		background-color: transparent;
	}
	
	#cycle_button{
		align-content: center;
		width: 54px;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		padding: 5px;
	}

	#toolbar button:hover {
		opacity: 0.8;
	}

	#search_bar{
		flex: 1 0 fit-content;
	}

	button:disabled{
		cursor: default;
		box-shadow: none;
		opacity: 1;
	}

	#cycle_button_bottom{
		position: absolute;
        top: 60px;
		width: 54px;
		padding: 5px;
		right: 10px;
       
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
	}

	.open{
		background-color: rgb(47, 47, 47);
	}
</style>
