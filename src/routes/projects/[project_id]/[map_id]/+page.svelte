<script lang="ts">
	import Map from '../../../../components/Map.svelte';
	import { store } from '../../../../store.svelte';
	import Informatic from '../../../../components/Informatic.svelte';
	import Toolbar from '../../../../components/Toolbar.svelte';
	import ParentMap from '../../../../components/ParentMap.svelte';

	import { page } from '$app/stores';
	import dtb from '$lib/dtb';
	import { onDestroy, onMount } from 'svelte';
	import { pop_modal } from '$lib/modal_manager.svelte';
	import { push_article } from '$lib/article_stack';
	import ModalWindow from '../../../../components/modals/ModalWindow.svelte';
	import ScaleBar from '../../../../components/ScaleBar.svelte';

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

	let window_dims = $state<{height: number, width: number}>({height: 0, width: 0})

	const update_window_dims = () => {
		window_dims.height = window.innerHeight;
		window_dims.width = window.innerWidth
	}

	onMount(()=>{
		window.addEventListener('resize', update_window_dims)
		update_window_dims()
	})
</script>

<Toolbar />
<Map />
<ParentMap />
{#if !store.informatic_minimized}
	<Informatic />
{/if}
{#if store.map.scale !== null}
	<ScaleBar path_nodes={[{x: window_dims.width * ((store.informatic_minimized ? 1 : store.informatic_width / 100) - 0.15), y: window_dims.height - 30},  {x: window_dims.width * ((store.informatic_minimized ? 1 : store.informatic_width / 100) - 0.05), y: window_dims.height - 30}]} scale={store.map.scale / store.map_transform.scale}/>
{/if}

{#each store.modals as modal (modal)}
		<ModalWindow
			close={() => {
				pop_modal();
			}}
			modal={modal}
		/>
	
{/each}
