<script lang="ts">
	import { type ModalEntity } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import { store } from '../store.svelte';

	export let modal_entities: ModalEntity[] = [];

	export let close: () => void;
	export let on_close: ((success: boolean) => Promise<void> | void) | undefined;

	async function handle_entity_click(entity: ModalEntity) {
		await entity.on_click();
		if (on_close){on_close(true);}
		close()
	}
</script>

<div id="grid-container">
	<div id="grid">
		{#each modal_entities as entity}
			<div
				class="entity-item"
				onclick={() => {
					handle_entity_click(entity);
				}}
			>
				<div class="image-container">
					<img class="entity-image" src={entity.image} alt={entity.title} />
				</div>
				<p>{entity.title}</p>
			</div>
		{/each}
	</div>
</div>

<style>
	#grid-container {
		max-height: calc(100vh - 300px);
		overflow-y: scroll;
		padding-right: 15px;
	}

	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}

	.entity-item {
		cursor: pointer;
		text-align: center;
		background-color: rgb(50, 50, 50);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		padding: 10px 10px;
		border-radius: 10px;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 150px;
		overflow: hidden;
	}

	.entity-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;
	}

	.entity-item p {
		color: var(--main_white);
		font-size: large;
		margin: 10px 0px 0px 0px;
	}

	#grid-container::-webkit-scrollbar {
		width: 12px;
	}

	#grid-container::-webkit-scrollbar-track {
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#grid-container::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#grid-container::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}
</style>
