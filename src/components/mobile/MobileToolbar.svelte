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

    let use_graph = $state<boolean>(false)

	const go_to_article_or_map_modal = async () => {
		let value: {id: number| null} = {id: null}
		await push_promise_modal({type: "choose_modal", data: {Map: await choose_existing_map(value)}, use_search: true})
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
    <div id="search_bar">
        <DropdownMapAndArticleSearch/>
    </div>
	<div class="button_group">
        {#if use_graph}
        <button
            onclick={()=>{open_map_graph();}}
            style="background-image: url('/assets/Map_icon (2).png');"
            aria-label="Open Map Graph"
            title="Open Map Graph"
            >
        </button>
        {:else}
		<button
			onclick={()=>{go_to_article_or_map_modal();}}
			style="background-image: url('/assets/old_map.png');"
			aria-label="Go to Map or Article"
			title="Go to Map or Article"
			>
		</button>
        {/if }
	</div>
</div>

<style>
	#toolbar {
		flex: 0 0 50px;
        padding: 0px 10px 0px 30px;

		display: flex;
		justify-content: end;
		align-items: center;

		color: var(--main_white);
		z-index: 11;
	}

	.button_group {
		flex: 0 1 80px;
		 
		display: flex;
		justify-content: center;
		gap: 10px;
		align-items: center;
		height: 100%;
	}

	#toolbar button {
		aspect-ratio: 4/3;
		height: 80%;
		border: none;
		cursor: pointer;
		background-size: contain;
		background-position: center center;
        background-color: transparent;
		background-repeat: no-repeat;
        
	}

	#toolbar button:hover {
		opacity: 0.8;
	}

	#search_bar{
		flex: 1 0 fit-content;
	}

	#toolbar button:disabled{
		cursor: default;
		box-shadow: none;
		opacity: 1;
	}
</style>
