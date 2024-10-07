<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ModalEntity, Project } from '$lib/types';
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
			return project.id in store.user_projects;
		})
	);

	let project_markers = $derived<ModalEntity[]>(
		my_projects.map((project) => {
			return {
				image: store.image_public_urls[store.project_images[project.id]]
					? URL.createObjectURL(store.image_public_urls[store.project_images[project.id]])
					: '/assets/map_icon.png',
				title: project.name,
				func: () => {
					goto(`/projects/${project.id}/${project.head_map_id}`);
				}
			};
		})
	);

	$effect(() => {
		if (store.user) {
			get_projects();
		}
	});
</script>

<main>
	<Homebar />
	<button id="add_project_button">New Project</button>
	<h1 id="title">My Projects</h1>
	<div id="projects_container">
		<div id="grid">
			{#each project_markers as entity}
				<div
					class="entity-item"
					onclick={() => {
						entity.func();
						store.modal_data = null;
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
		width: 100%;
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
		left: 3%;
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
		cursor: pointer;
		text-align: center;
		background-color: rgb(47, 47, 47);
		border-radius: 10px;
	}

	.image-container {
		position: relative;
		margin: auto;
		margin-top: 5px;
		margin-bottom: 0px;
		width: 80%;
		height: 250px;
		overflow: hidden;
		margin-bottom: 0;
	}

	.entity-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;

		border-radius: 15px;
		border-width: 3px;
		border-color: rgb(47, 47, 47);
		border-style: solid;
	}

	.entity-item p {
		color: white;
		font-size: 2rem;
		margin-top: 0px;
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
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
