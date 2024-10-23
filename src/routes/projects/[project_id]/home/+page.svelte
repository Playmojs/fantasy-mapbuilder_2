<script lang="ts">
	import dtb from '$lib/dtb';
	import { choose_existing_map, get_new_map_data, pop_modal, push_modal, push_promise_modal } from '$lib/modal_manager';
	import { type MapData, type Project, type ModalEntity } from '$lib/types';
	import { assert_unreachable } from '$lib/utils';
	import ConfirmModal from '../../../../components/ConfirmModal.svelte';
	import Homebar from '../../../../components/Homebar.svelte';
	import MapOption from '../../../../components/MapOption.svelte';
	import Modal from '../../../../components/Modal.svelte';
	import { store } from '../../../../store.svelte';

	let project = $state<Project>();
	let main_map = $state<MapData>();
	let users = $state<string[]>([])

	const change_main_map = async () => {
		if (!project){return}
		await dtb.fetch_all_from_project(project.id)
		const response = await push_promise_modal({type: 'choose_modal', data: {Maps: await choose_existing_map()}})
		if(!response){return}
		else{
			main_map = store.map_cache[response]
		}
	}

	async function get_data() {
		project = await dtb.get_project(store.project_id);
		await dtb.fetch_project_images([store.project_cache[store.project_id]]);
		if(!project){return}
		
		main_map = await dtb.get_map(
			project.id,
			project.head_map_id
		);
		dtb.get_usernames_in_project(project.id).then((data) => {
			if(data){users = data}})
		dtb.fetch_all_from_project(project.id)
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
		push_modal({type: 'confirm_modal', data: {
			text: "(Not yet implemented, don't worry) Are you sure you want to delete?",
			confirm_function() {
				console.log('mock-delete');
			}
		}})
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
		{#if main_map_preview}
			<div id="image-preview-section">
				<img src={main_map_preview} alt="Image Preview" class="image-preview" />
			</div>
		{/if}
		<div id="project_form">
			<div>
				<h1>{`Project #${project?.id}`}</h1>
			</div>
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
				<button id="change_head_map_button" onclick={change_main_map}>Change</button>
			</div>
			<div id="users">
				<p id="users_title">Contributors:</p>
				<div id='user_list'>
				{#each users as user}
					<p class="user_entry">{`${user}`}</p>
				{/each}
				</div>
			</div>
			<div id="execute_buttons">
				<button id="delete_button" onclick={confirm_delete}>Delete Project</button>
				<button id="update_button" onclick={update_project}>Save Changes</button>
			</div>
		</div>
	</div>
</main>

{#each store.modals as modal (modal)}
	{#if modal.type === 'upload_modal'}
		<MapOption
			modal_data={modal.data}
			close={() => {
				pop_modal();
			}}
			on_close={modal.on_close}
		/>
	{:else if modal.type === 'confirm_modal'}
		<ConfirmModal
			modal_data={modal.data}
			close={() => {
				pop_modal();
			}}
		/>
	{:else if modal.type === 'choose_modal'}
		<Modal
			modal_data={modal.data}
			close={() => {
				pop_modal();
			}}
			on_close={modal.on_close}
		/>
	{/if}
{/each}

<style>
	#project_display {
		position: relative;
		display: flex;
		height: 90%;
		justify-content: space-around;
		top: 40px;
		align-items: start;
	}

	#project_form {
		position: relative;
		margin-top: 50px;
		width: 40%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		color: rgb(220, 220, 220);
		background-color: rgb(80, 80, 80);
		padding: 50px 0px;
		border-radius: 5%;
		gap: 30px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
		border: 5px ridge rgb(178, 151, 0);
	}

	#project_form > div{
		width: 80%;
		background-color: rgb(70, 70, 70);
		padding: 0px 5%;
		border-radius: 10px;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	#title {
		position: relative;
		display: flex;
		justify-content: start;
		font-size: x-large;
		align-items: center;
	}

	#title_label{
		padding-right: 50px;
	}

	#title_input {
		position: relative;
		font-size: large;
		height: fit-content;
		padding-left: 5px;
		height: 30px;
		font-weight: bold;
		background-color: rgb(150, 150, 150);
		box-shadow: inset 2px 2px 2px rgb(40, 40, 40);
		border-radius: 5px;
		width: 50%;
	}

	#head_map {
		position: relative;
		display: flex;
		justify-content: start;
		gap: 20px;
		font-size: x-large;
		align-items: center;
	}

	#change_head_map_button {
		height: fit-content;
		padding: 5px 10px;
		margin-left: 100px;
		color: rgb(220, 220, 220);
		font-size: large;
		background-color: rgb(100, 100, 100);
		border-radius: 10%;
		cursor: pointer
	}

	#users{
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 0px;
	}

	#users_title{
		font-size: x-large;
		align-self: left;
	}
	#user_list{
		position: relative;
		background-color: rgb(50, 50, 50);
		border-radius: 10px;
		width: 300px;
		font-size: 1.1rem;
		width: 100%;
		padding-left: 10px;
		margin-bottom: 10px;
		margin-top: 0px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
	}

	#execute_buttons {
		margin-top: 20px;
		display: flex;
		justify-content: space-around;
		background-color: transparent !important;
		box-shadow: none !important;
	}

	#execute_buttons > button {
		padding: 10px;
		border-radius: 10%;
		margin: 0px 20px;
		height: fit-content;
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
	}

	#update_button {
		background-color: rgb(20, 150, 20);
	}

	#delete_button {
		background-color: rgb(200, 20, 20);
	}

	#image-preview-section {
		position: relative;
		width: 50%;
		height: fit-content;
		margin-top: auto;
		margin-bottom: auto;
	}

	.image-preview {
		margin-top: 50px;
		position: relative;
		max-width: 100%;
		border-radius: 10px;
		box-shadow: 10px 5px 5px rgb(40, 40, 40);
	}
</style>
