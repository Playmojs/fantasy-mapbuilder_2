<script lang="ts">
	import type { ConfirmModalData } from "$lib/types";
	import { store } from "../store.svelte";

    let { modal_data, close }: { modal_data: ConfirmModalData; close: any } = $props();

	const handleClose = (e: Event) => {
		e.stopPropagation();
		close();
	};

    async function confirm(){
        modal_data.confirm_function()
        close()
    }

    function cancel(){
        close()
    }

</script>

<div class="modal" on:click={handleClose}>
	<div class="modal-content" on:click|stopPropagation>
        <h1>{modal_data.text ?? ''}</h1>
        <div id="buttonrow">
            <button on:click={()=>{confirm()}}>Confirm</button>
            <button on:click={()=>{cancel()}}>Cancel</button>
        </div>
	
		<span class="close" on:click={handleClose}>&times;</span>
	</div>
</div>

<style>
	.modal {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}

	.modal.hidden {
		display: none;
	}

	.modal-content {
		position: relative;
		margin: 5% auto;
		padding: 20px;
		background: rgb(47, 47, 47);
		width: 60%;
        top: 10%;
		max-width: 800px;
		max-height: 80%;
		overflow-y: hidden;
		border-radius: 15px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
		border: 3px ridge var(--main_gold);
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: var(--main_white);
	}

    #buttonrow{
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 40%;
		margin: 20px 0px;
    }

    button{
        position: relative;
		background-color: rgb(80, 80, 80);
		cursor:pointer;
        width: 30%;
		font-size: large;
		color: var(--main_white);
		border-radius: 10%;
		padding: 7px 0px;
		box-shadow: 3px 3px 3px rgb(10, 10, 10);
    }

    h1{
        color: var(--main_white);
		text-shadow: 3px 3px 3px rgb(10, 10, 10);
    }
</style>
