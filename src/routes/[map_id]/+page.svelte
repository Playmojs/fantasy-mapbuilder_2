<script lang="ts">
	import Map from '../../components/Map.svelte';
	import { store } from '../../store.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import Modal from '../../components/Modal.svelte';
	import EntityGrid from '../../components/EntityGrid.svelte';
	import { type TargetType } from '../../lib/types';
	import { maps, current_map, current_article, current_markers } from '../../lib/data';

	import { target } from '../../lib/bind_component';

	let special_entities_: any[];
	$: special_entities_;

	const open_modal = (target_type: TargetType, id: number | null, special_entities: any[]) => {
		target.update_target = target_type;
		target.update_id = id;
		special_entities_ = special_entities;
		store.show_modal = true;
	};
</script>

<Map />
<ParentMap
	change_parent_map={open_modal}
/>
<Informatic />
<Toolbar />
<Modal close={() => (store.show_modal = false)}>
	<EntityGrid {special_entities_} entities={Object.values($maps)} />
</Modal>
