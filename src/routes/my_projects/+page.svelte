<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ModalEntity, Project } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import Homebar from '../../components/Homebar.svelte';
	import dtb from '../../lib/dtb';
	import { store } from '../../store.svelte';

	const get_projects = async () => {
		await dtb.get_my_project_ids();
		await dtb.get_projects(store.user_projects);
		await dtb.fetch_project_images(my_projects);
	};
	get_projects();

	
	let my_projects = $derived<Project[]>(
		Object.values(store.project_cache).filter((project) => {
			return store.user_projects.includes(project.id);
		})
	);
	
	let project_markers = $derived<{ [id: number]: ModalEntity<void> }>(
		Object.fromEntries(
			my_projects.map((project) => [
				project.id,
				{
					image: store.image_public_urls[store.project_images[project.id]]
						? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
						: '/assets/map_icon.png',
					title: project.name,
					on_result: () => {
						if(project.head_map_id === null){assert_unreachable("Trying to go to map with id null")}
						goto(`/projects/${project.id}/${project.head_map_id}`);
					}
				}
			])
		)
	);

	$effect(() => {
		if (store.user) {
			get_projects();
		}
	});

</script>

<Homebar />
<main>
	<button id="add_project_button" onclick={()=>{goto(`/projects/new_project`);}}>New Project</button>
	<h1 id="title">My Projects</h1>
	<div id="projects_container">
		<div id="grid">
			{#each Object.entries(project_markers) as [id, entity]}
				<div
					class="entity-item"
					onclick={() => {
						entity.on_result();
					}}
				>
					<div class="image-container">
						<img class="entity-image" src={entity.image} alt={entity.title} />
					</div>
					<p>{entity.title}</p>
					<button
						id="edit_project"
						onclick={(e: Event) => {
							goto(`/projects/${id}/home`);
							e.stopPropagation();
						}}
					></button>
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
	}
	
	#add_project_button {
		position: absolute;
		left: 80px;
		top: 120px;
		height: 50px;
		aspect-ratio: 3;
		border-radius: 10%;
		color: white;
		background-color: rgb(20, 150, 20);
		border: none;
		font-size: 1rem;
		cursor: pointer;
	}
	
	#title {
		position: relative;
		margin: auto;
		color: white;
		margin-top: 50px;
	}

	#projects_container {
		position: relative;
		width: 90%;
		top: 30px;
		max-height: 80vh;

		padding: 20px 50px;

		border-radius: 15px;
		background-color: grey;
		overflow-y: auto;
	}

	#grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 0.5fr));
		gap: 50px;
	}

	.entity-item {
		position: relative;
		cursor: pointer;
		text-align: center;
		background-color: rgb(47, 47, 47);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		
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
		margin-top: auto;

		max-width: 100%;
		max-height: 100%;

		border-radius: 15px;
		border-width: 3px;
		border-color: rgb(47, 47, 47);
		border-style: solid;
	}

	.entity-item p {
		position: relative;
		color: white;
		font-size: 2rem;
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
		margin: 10px 0px;
	}

	#edit_project {
		position: absolute;
		top: 10px;
		height: 20px;
		right: 10px;
		aspect-ratio: 1;
		background-color: transparent;
		background-image: url('/assets/cog.png');
		background-size: contain;
		background-repeat: no-repeat;
		border: none;
	}

	#projects_container::-webkit-scrollbar {
		width: 12px;
	}

	#projects_container::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#projects_container::-webkit-scrollbar-corner {
		background-color: rgb(47, 47, 47);
	}

	#projects_container::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}

	@media (max-width: 1500px) {
		#projects_container {
			max-height: 50vh;
			width: 87%;

			padding: 20px 50px;
		}
		.image-container {
			height: 150px;
		}
	}

	@media (max-width: 1150px) {
		#grid {
			grid-template-columns: repeat(auto-fill, minmax(250px, 0.5fr));
			gap: 25px;
		}
		#projects_container {
			max-height: 50vh;
			width: 83%;

			padding: 20px 50px;
		}
	}
</style>
