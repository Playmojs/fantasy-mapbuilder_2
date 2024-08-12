<script lang="ts">
	import Map from '../../components/Map.svelte';
	import { store } from '../../store.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import Modal from '../../components/Modal.svelte';
	import { slide } from 'svelte/transition';
</script>

<Map />
<ParentMap />
{#if !store.minimized}
	<Informatic />
{/if}
<Toolbar />
<Modal close={() => (store.modal_data = null)} modal_data={store.modal_data} />
