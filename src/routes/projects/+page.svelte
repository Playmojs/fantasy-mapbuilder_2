<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ModalEntity, Project } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import Homebar from '../../components/Homebar.svelte';
	import dtb from '../../lib/dtb';
	import { store } from '../../store.svelte';

	const get_projects = async () => {
		await dtb.fetch_all_projects();
	};
	get_projects();

	let project_markers = $derived<ModalEntity[]>(
		Object.entries(store.project_cache).map(([_, project]) => {
			return {
				image: store.image_public_urls[store.project_images[project.id]]
					? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
					: '/assets/old_map.png',
				title: project.name,
				on_click: () => {
					goto(`/projects/${project.id}/${project.head_map_id}`);
				}
			};
		})
	);
</script>

<Homebar />
<main>
	<h1 id="title">Existing Projects</h1>
	<div id="projects_container">
		<div id="grid">
			{#each project_markers as entity}
				<div
					class="entity-item"
					onclick={() => {
						entity.on_click();
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
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		width: 100%;
		gap: 30px;
	}

	#title {
		position: relative;
		margin: auto;
		font-size: 4rem;
		color: var(--color-text-primary);
		margin: 40px 0px 30px 0px;
		padding: 20px;
		font-family: 'Cormorant Garamond';
		text-decoration: underline solid var(--color-primary-dark);
		text-underline-offset: 20px;
		text-shadow: var(--text-shadow-base);
	}

	#projects_container {
		position: relative;
		width: 90%;
		/* max-height: 80vh; */
		height: fit-content;
		
		border-radius: 15px;
		background-color: var(--color-bg-tertiary);
		overflow-y: auto;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
		border: 5px ridge var(--color-accent);
	}
	
	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 0.5fr));
		grid-template-rows: repeat(auto-fill, 250px);
		gap: 50px;
		
		padding: 20px 50px;
	}

	
	.entity-item {
		position: relative;

		cursor: pointer;
		text-align: center;
		background-color: var(--color-bg-secondary);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		box-shadow: var(--shadow-md);
		
	}
	
	.image-container {
		position: relative;
		width: 80%;
		height: 250px;
		overflow: hidden;
		margin: 10px;
	}
	
	.entity-image {
		position: relative;
		padding-top: 5px;
		
		max-width: 100%;
		max-height: 95%;
		
		border-radius: 15px;
		box-shadow: var(--shadow-md);
	}
	
	.entity-item p {
		position: relative;
		color: var(--color-text-primary);
		font-size: 2rem;
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
		margin: 0px 0px 10px 0px;
	}
	
	
	#projects_container::-webkit-scrollbar {
		width: 12px;
	}
	
	#projects_container::-webkit-scrollbar-thumb {
		background-color: var(--color-panel);
	}
	
	#projects_container::-webkit-scrollbar-corner {
		background-color: var(--color-panel-active);
	}
	
	#projects_container::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-panel-hover);
	}

	@media(max-width: 1200px){
		#grid{
			grid-template-columns: repeat(auto-fill, minmax(180px, 0.5fr));
			grid-template-rows: repeat(auto-fill, 180px);
		}
	}
	
	@media(max-width: 768px){
		#grid{
			grid-template-columns: repeat(auto-fill, minmax(120px, 0.5fr));
			grid-template-rows: repeat(auto-fill, 120px);
			gap: 20px;
			padding: 20px 20px;
		}
		.entity-item p {
			font-size: 1rem;
		}
		#title{
			font-size: 2rem;
		}
	}
</style>
