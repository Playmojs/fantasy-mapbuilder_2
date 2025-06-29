<script lang="ts">
	import Map from '../../../../components/Map.svelte';
	import { store } from '../../../../store.svelte';
	import Informatic from '../../../../components/Informatic.svelte';
	import Toolbar from '../../../../components/Toolbar.svelte';
	import ParentMap from '../../../../components/ParentMap.svelte';

	import { page } from '$app/stores';
	import dtb from '$lib/dtb';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { pop_modal } from '$lib/modal_manager.svelte';
	import { push_article } from '$lib/article_stack';
	import ModalWindow from '../../../../components/modals/ModalWindow.svelte';
	import ScaleBar from '../../../../components/ScaleBar.svelte';
	import MobileInformatic from '../../../../components/mobile/MobileInformatic.svelte';
	import MobileToolbar from '../../../../components/mobile/MobileToolbar.svelte';

	function reset_modals() {
		store.modals = [];
	}

	let unsubscribe = page.subscribe(async (value) => {
		reset_modals();
		const map_id = +value.params.map_id;
		const map = await dtb.get_map(store.project_id, map_id);
		if (map) {
			store.map = map;
			if (map.parent_id !== null) {
				await dtb.get_map(store.project_id, map.parent_id);
			}
		}
		const article = await dtb.get_article(store.project_id, store.map.article_id);
		if (article) {
			push_article(article.id, false);
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

	let map_container = $state<HTMLDivElement>();
	let map_container_rect = $state<{x: number, y: number, width: number, height: number}>({x: 0, y: 0, width: 0, height: 0});
	let resizeObserver: ResizeObserver;

	let window_dims = $state<{height: number, width: number}>({height: 0, width: 0})
	let scale_bar_left_position = $derived<{x: number, y: number}>
		(store.mobile_layout ? 
			{x: window_dims.width - 150 , y: (window_dims.height - 70) * (store.informatic_minimized ? 1 : 1 - store.informatic_dim / 100) - 10} : 
			{x: window_dims.width * ((store.informatic_minimized ? 1 :  1 - store.informatic_dim / 100) - 0.15), y: window_dims.height - 80}
		)

	let scale_bar_righ_position = $derived<{x: number, y: number}>({x: scale_bar_left_position.x + Math.max(0.1*window_dims.width, 100), y: scale_bar_left_position.y})

	$effect(()=>{
		if (store.mobile_layout) {
			store.informatic_dim = 50;
		} else {
			store.informatic_dim = 35;
		}
	})
		
	const update_window_dims = () => {
		const expanding: boolean = window_dims.width < window.innerWidth;
		const current_layout: boolean = store.mobile_layout;
		window_dims.height = window.innerHeight;
		window_dims.width = window.innerWidth;
		store.mobile_layout = window.screen.width < 768;

		if(!store.mobile_layout && !expanding){
			store.informatic_dim = Math.max(store.informatic_dim, 450 * 100 / window.innerWidth)
		}
	}

	onMount(()=>{
		if (map_container) {
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					map_container_rect = entry.target.getBoundingClientRect();
				}
			});
			resizeObserver.observe(map_container);
		}

		window.addEventListener('resize', update_window_dims)
		update_window_dims()
	})
</script>


<div id="layout_parent">
	{#if store.mobile_layout}
		<MobileToolbar />
	{:else}
		<Toolbar />
	{/if}
	<div id="map_informatic_parent" class:mobile_layout={store.mobile_layout} >
		<div id="map_holder" bind:this={map_container} style="{store.mobile_layout? "height" : "width"}: {store.informatic_minimized ? 100 : 100 - store.informatic_dim}%">		
			<Map map_container_rect={map_container_rect}/>
			<ParentMap />
			{#if store.map.scale !== null}
				<ScaleBar path_nodes={[scale_bar_left_position, scale_bar_righ_position]} scale={store.map.scale / store.map_transform.scale} unit_group={store.unit_group}/>
			{/if}
		</div>
		{#if store.mobile_layout}
			<MobileInformatic/>
		{:else}
			{#if !store.informatic_minimized}
			<Informatic />
			{/if}
		{/if}
	</div>	
</div>



{#each store.modals as modal (modal)}
		<ModalWindow
			close={() => {
				pop_modal();
			}}
			modal={modal}
		/>
{/each}

<style>
#layout_parent {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100%;
}

#map_informatic_parent{
	position: relative;
	touch-action: none;
	flex: 1;
	display: flex;
	flex-direction: row;
	height: calc(100% - 50px);
}

#map_informatic_parent.mobile_layout{
	flex-direction: column;
}
</style>