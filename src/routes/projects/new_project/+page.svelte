<script lang="ts">
	import { goto } from "$app/navigation";
	import dtb from "$lib/dtb";
	import { pop_modal, push_modal } from "$lib/modal_manager";
    import {type MapData, type Project, type ModalEntity, type UploadModalData} from "$lib/types"
	import { assert_unreachable } from "$lib/utils";
	import ConfirmModal from "../../../components/ConfirmModal.svelte";
	import Homebar from "../../../components/Homebar.svelte";
	import MapOption from "../../../components/MapOption.svelte";
	import Modal from "../../../components/Modal.svelte";
	import { store } from "../../../store.svelte";

    let project_title = $state<string>('')
    let title_input: HTMLInputElement;

    function update_title(){
        project_title = title_input.value;
    }

    function open_map_option(){
        push_modal({
            type:'upload_modal', data: {submit_func: (file: File | null, title: string) => {
                if(file === null){
                    assert_unreachable("No file selected error"); 
                    return;
                }
                main_map_title = title;
                main_map_file = file;
            },
            validation_func(file, title) {
                return(file !== null && title !== '')
            },
            link_func: null,
            initial_link: null,
            button_title: 'Choose Map',
            initial_image_blob: main_map_file,
            initial_map_title: main_map_title ?? '',
            allow_no_file: false,}
        })
    }

    function valid_project(){return main_map_file===null || main_map_title==='' || project_title === ''}
    async function add_project(){
        if (main_map_file === null || main_map_title === '' || !main_map_title || project_title === ''){return;}
        let project = await dtb.create_new_project(project_title, main_map_title, main_map_file);
        if(project){
            if(project.head_map_id === null){
                assert_unreachable("Project set without headmap"); 
                goto('/');
            }
            store.project_id = project.id
            store.project_cache[store.project_id] = project;
            goto(`/projects/${project.id}/${project.head_map_id}`)
        }
    }

    let main_map_title = $state<string>()
    let main_map_file = $state<File | null>(null)



	let main_map_preview = $derived<string | null>(main_map_file ? URL.createObjectURL(main_map_file) : null)
</script>

<Homebar/>
<main>
    <div id=project_display>
        <div id="image-preview-section">
			{#if main_map_preview}
				<img src={main_map_preview} alt="Image Preview" class="image-preview" />
			{:else}
				<p class="no-image">No image selected</p>
			{/if}
		</div>
        <div id="project_form">
            <h1>New Project</h1>
            <div id="title">
                <p id="title_label">Project Title: </p>
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
                <p id="head_map_label"> {`Main Map: ${main_map_title ?? 'Not added'}`}</p>
                <button id='set_main_map_button' onclick={open_map_option}>{main_map_file ? 'Change' : 'Choose'}</button>
            </div>

            <button id="add_project_button" onclick={add_project} disabled={valid_project()}>Add Project</button>
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
    #project_display{
        position: relative;
        display: flex;
        justify-content: space-around;
        top: 40px;
        align-items: start;
    }

    #project_form{
        position: relative;
        margin-top: 100px;
        width: 40%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        color: white;
        gap: 30px;
    }

    #title{
        position: relative;
        display: flex;
        justify-content: space-around;
        font-size: x-large;
        align-items: center;
    }

    #title_input{
        position: relative;
        font-size: large;
        height: fit-content;
        width: 50%;
    }

    #head_map{
        position: relative;
        display: flex;
        justify-content: space-around;
        gap: 20px;
        font-size: x-large;
        align-items: center;
    }

    #set_main_map_button{
        height: fit-content;
        padding: 5px;
        color: white;
        font-size: large;
        background-color: rgb(80, 80, 80);
        border-radius: 10%;
        cursor: pointer;

    }

    #add_project_button{
        background-color: rgb(20, 150, 20);
        padding: 10px;
        border-radius: 10%;
        margin: 0px 20px;
        cursor: pointer;
    }

    #add_project_button:disabled{
        background-color: rgb(30, 100, 30);
        border: none;
        cursor:not-allowed;
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
        margin-top: 250px;

	}
</style>
