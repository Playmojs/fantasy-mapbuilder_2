<script lang="ts">
	import { store } from '../store.svelte';

	function showAlert() {
		alert('Button clicked!');
	}

	function showSecondAlert() {
		alert('Second button clicked!');
	}

	function showThirdAlert() {
		alert('Third button clicked!');
	}
</script>

<div class="toolbar" class:visible={!store.edit_mode}>
	<button class="button1" on:click={showAlert}></button>
	<button class="button2" on:click={showSecondAlert}></button>
	<button class="button3" on:click={showThirdAlert}></button>
</div>

<style>
	.toolbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 7%;
		background-color: #4b4343;
		color: white;
		display: flex;
		justify-content: 500px; /* Ensures buttons are at the right end */
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 5;
	}
	.toolbar.visible {
		display: none;
	}
	.toolbar button {
		width: 80%; /* Adjust the size as needed */
		height: 80%; /* Adjust the size as needed */
		border: none;
		padding: 0;
		cursor: pointer;
		background-size: contain;
		margin-left: 100px; /* Adjust margin for the third button */
	}

	.button1 {
		background: url('/assets/a_town.png') no-repeat center center;
	}

	.button2 {
		background: url('/assets/magil.png') no-repeat center center;
	}

	.button3 {
		background: url('/assets/a_town.png') no-repeat center center;
	}

	.toolbar button:first-child {
		margin-left: 500px; /* How far to the right the buttons are */
	}

	.toolbar button:hover {
		opacity: 0.8; /* Slight hover effect */
	}
</style>
