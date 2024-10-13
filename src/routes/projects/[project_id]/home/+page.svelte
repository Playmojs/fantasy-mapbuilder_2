<script lang="ts">
	import dtb from '$lib/dtb';
	import { type MapData, type Project, type ModalEntity } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import ConfirmModal from '../../../../components/ConfirmModal.svelte';
	import Homebar from '../../../../components/Homebar.svelte';
	import Modal from '../../../../components/Modal.svelte';
	import { store } from '../../../../store.svelte';

	// const add_map: ModalEntity = {
	// 	image: '/assets/plus.png',
	// 	title: 'Add Map',
	// 	func: () => {
	// 		store.edit_map_window = {
	// 			submit_func: async (file: File | null, title: string) => {
	// 				if(file === null){
	// 					assert_unreachable("No file selected error");
	// 					return;
	// 				}
	// 				let response = await dtb.create_new_map(file, title);
	// 				if (response !== null) {
	// 					main_map = response
	// 				}
	// 			},
	// 			validation_func(file, title) {
	// 				return(file !== null && title !== '')
	// 			},
	// 			button_title: 'Create Map',
	// 			initial_image_blob: null,
	// 			initial_map_title: '',
	// 			allow_no_file: false,
	// 		};
	// 	}
	// };

	const getMaps = async () => {
		await dtb.fetch_all_from_project(store.project_id);
		const maps = Object.entries(store.map_cache).map(([_, map]) => {
			return {
				image: URL.createObjectURL(store.image_public_urls[map.image]),
				title: map.title,
				func: () => {
					main_map = map;
				}
			};
		});
		return maps;
	};

	async function change_head_map() {
		// store.modal_data = {
		// 	Maps: [add_map].concat(await getMaps())
		// };
	}

	let project = $state<Project>();
	let main_map = $state<MapData>();

	async function get_data() {
		project = await dtb.get_project(store.project_id);
		await dtb.fetch_project_images([store.project_cache[store.project_id]]);
		main_map = await dtb.get_map(
			store.project_id,
			store.project_cache[store.project_id].head_map_id
		);
	}
	$effect(() => {
		store.project_id;
		get_data();
	});

	async function update_project() {
		if (!project || project_title === '' || !main_map) {
			return;
		}
		project.name = project_title;
		project.head_map_id = main_map.id;
		dtb.update_project(project);
	}

	function confirm_delete() {
		if (!project) {
			return;
		}
		store.confirm_modal = {
			text: "(Not yet implemented, don't worry) Are you sure you want to delete?",
			confirm_function() {
				console.log('mock-delete');
			}
		};
	}

	let project_title = $state<string>('');
	let title_input: HTMLInputElement;

	$effect(() => {
		if (project) {
			project_title = project.name;
		}
	});
	function update_title() {
		project_title = title_input.value;
	}

	let main_map_preview = $derived<string | null>(
		main_map
			? store.image_public_urls[main_map.image] !== null
				? URL.createObjectURL(store.image_public_urls[main_map.image])
				: null
			: null
	);
</script>

<main>
	<Homebar />
	<div id="project_display">
		<div id="image-preview-section">
			{#if main_map_preview}
				<img src={main_map_preview} alt="Image Preview" class="image-preview" />
			{:else}
				<p class="no-image">No image selected</p>
			{/if}
		</div>
		<div id="project_form">
			<h1>{`Project #${project?.id}`}</h1>
			<div id="title">
				<p id="title_label">Project Title:</p>
				<input
					id="title_input"
					value={project_title}
					bind:this={title_input}
					onkeyup={() => {
						update_title();
					}}
					required
				/>
			</div>
			<div id="head_map">
				<p id="head_map_label">{`Main Map: ${main_map?.title ?? ''}`}</p>
				<button id="change_head_map_button" onclick={change_head_map}>Change</button>
			</div>
			<div id="execute_buttons">
				<button id="delete_button" onclick={confirm_delete}>Delete Project</button>
				<button id="update_button" onclick={update_project}>Save Changes</button>
			</div>
		</div>
	</div>
</main>

<!-- <Modal close={() => (store.modal_data = null)} modal_data={store.modal_data} />
<MapOption />
<ConfirmModal close={() => (store.confirm_modal = null)} /> -->

<style>
	#project_display {
		position: relative;
		display: flex;
		justify-content: space-around;
		top: 40px;
		align-items: center;
	}

	#project_form {
		position: relative;
		margin-top: -20px;
		width: 40%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		color: white;
		gap: 30px;
	}

	#title {
		position: relative;
		display: flex;
		justify-content: space-around;
		font-size: x-large;
		align-items: center;
	}

	#title_input {
		position: relative;
		font-size: large;
		height: fit-content;
		width: 50%;
	}

	#head_map {
		position: relative;
		display: flex;
		justify-content: space-around;
		gap: 20px;
		font-size: x-large;
		align-items: center;
	}

	#change_head_map_button {
		height: fit-content;
		padding: 5px;
		color: white;
		font-size: large;
		background-color: rgb(80, 80, 80);
		border-radius: 10%;
	}

	#execute_buttons {
		gap: 60px;
	}

	#execute_buttons > button {
		padding: 10px;
		border-radius: 10%;
		margin: 0px 20px;
	}

	#update_button {
		background-color: rgb(20, 150, 20);
	}

	#delete_button {
		background-color: red;
	}

	#image-preview-section {
		position: relative;
		width: 50%;
	}

	.image-preview {
		position: relative;
		max-width: 100%;
		border-radius: 10px;
	}

	.no-image {
		color: white;
		font-size: 1.5rem;
		text-align: center;
	}
</style>
