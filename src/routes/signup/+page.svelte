<script lang="ts">
	import Homebar from '../../components/Homebar.svelte';
	import { supabase } from '$lib/dtb';
	import { goto } from '$app/navigation';
	import { store } from '../../store.svelte';

	let email = $state('');
	let password = $state('');
	let confirm_password = $state('');
	let errorMessage = $state('');
	let isDisabled = $state(true);

	$effect(() => {
		if (store.user !== null) {
			goto('/');
		}
	});

	function validateInputs() {
		isDisabled = email.length === 0 || password.length === 0 || password !== confirm_password;
	}

	async function handleSignup() {
		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) {
			errorMessage = error.message;
			console.log(errorMessage);
		} else {
			goto('/');
		}
	}

	function redirectToLogin() {
		goto('/login');
	}
</script>

<Homebar />
<div id="background">
	<img id="image" src="/assets/map.jpg" alt="background" />
	<div id="box">
		<h1>Sign Up</h1>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
		<form on:submit|preventDefault={handleSignup}>
			<label for="email">Email:</label>
			<input type="email" id="email" bind:value={email} on:input={validateInputs} required />

			<label for="password">Password:</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				on:input={validateInputs}
				required
			/>

			<label for="confirm_password">Confirm password:</label>
			<input
				type="password"
				id="confirm_password"
				bind:value={confirm_password}
				on:input={validateInputs}
				required
			/>

			<button type="submit" disabled={isDisabled}>Sign Up</button>
		</form>
		<p class="query">Already have an account? <a href="#" on:click={redirectToLogin}>Login</a></p>
	</div>
</div>

<style>
	#background {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: start;
	}

	#image {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: center;
	}

	#box {
		position: absolute;
		width: 400px;
		max-width: 50%;
		background-color: rgb(47, 47, 47);
		border-color: rgb(100, 100, 100);
		border-width: 5px;
		border-style: solid;
		border-radius: 20px;
		padding: 1rem;
		margin-top: 1rem;

		font-size: 100%;
		display: flex;
		flex-direction: column;
	}

	h1 {
		position: relative;
		color: white;
		text-align: center;
	}

	.error {
		color: red;
		left: 10%;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	label {
		position: relative;
		left: 10%;
		margin-top: 1rem;
		color: white;
	}

	input {
		position: relative;
		width: 80%;
		margin: auto;
		padding: 0.5rem;
		margin-top: 0.5rem;
		background-color: rgb(80, 80, 80);
	}

	button {
		position: relative;
		width: 50%;
		margin: auto;
		margin-top: 1.5rem;
		padding: 0.75rem;
		background-color: rgb(130, 130, 130);
		color: white;
		font-weight: bold;
		font-size: large;
		border: none;
		cursor: pointer;
		opacity: 0.8;
	}

	button:disabled {
		font-weight: normal;
		opacity: 0.4;
		cursor: not-allowed;
		background-color: rgb(60, 60, 60);
	}

	.query {
		position: relative;
		color: white;
		left: 10%;
		bottom: 1%;
		font-size: large;
	}

	a {
		color: rgb(200, 200, 200);
		font-weight: bold;
	}

	@media (max-width: 1100px) {
		h1 {
		margin-top: 0px;
		}
		label{
		margin-top: 10px;
		}
	}
</style>
