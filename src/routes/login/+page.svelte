<script lang="ts">
	import Homebar from '../../components/Homebar.svelte';
	import { supabase } from '$lib/dtb';
	import { goto } from '$app/navigation';
	import { store } from '../../store.svelte';
	import { page } from '$app/stores';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isDisabled = $state(true);

	$effect(() => {
		if (store.user !== null) {
			goto('/');
		}
	});

	function validateInputs() {
		isDisabled = email.length === 0 || password.length === 0;
	}

	async function handleLogin() {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			errorMessage = error.message;
			console.log(error);
		} else {
			goto('/');
		}
	}

	function redirectToSignup() {
		goto('/signup');
	}

	async function change_password(){
		const response = await supabase.auth.resetPasswordForEmail(email, {
  		redirectTo: `${$page.url.origin}`,
	})
		if(response.error){
			console.error("Failed to reset password: ", response.error)
		}
	}
</script>

<Homebar />
<div id="background">
	<img id="image" src="/assets/Invella.jpg" alt="background" />
	<div id="box">
		<h1>Login</h1>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
		<form on:submit|preventDefault={handleLogin}>
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

			<button type="submit" disabled={isDisabled}>Login</button>
		</form>
		<p class="query">Don't have an account? <a href="#" on:click={redirectToSignup}>Sign up</a></p>
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
		background-color: rgb(60, 60, 60);
		box-shadow: 10px 5px 5px rgb(40, 40, 40);
		user-select: none;
		border-radius: 20px; 
		padding: 1rem 1rem 0rem 1rem;
		margin-top: 5rem;
		gap: 30px;

		border: 4px ridge var(--main_gold);

		font-size: 100%;
		display: flex;
		flex-direction: column;
	}

	h1 {
		position: relative;
		color: var(--main_white);
		text-align: center;
		padding: 5px 0px;
		border-radius: 10px;
		text-shadow: 5px 5px 5px rgb(10, 10, 10)
	}

	.error {
		color: red;
		left: 10%;
	}

	form {
		display: flex;
		flex-direction: column;
		background-color: rgb(90, 90, 90);
		padding: 5px 0px;
		border-radius: 10px;
		box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
	}

	label {
		position: relative;
		left: 10%;
		margin-top: 1rem;
		color: var(--main_white);
		font-size: large;
	}

	input {
		position: relative;
		width: 80%;
		margin: auto;
		padding: 0.5rem;
		margin-top: 0.5rem;
		font-size: large;
		font-weight: bold;
		background-color: rgb(80, 80, 80);
		border-radius: 10px;
		box-shadow: inset 3px 3px 5px rgb(40, 40, 40);
	}

	button {
		position: relative;
		margin: 1.5rem auto 0.5rem auto;
		padding: 0.75rem 4rem;
		background-color: rgb(80, 80, 80);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		color: var(--main_white);
		font-weight: bold;
		font-size: large;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		opacity: 0.8;
	}

	button:disabled {
		font-weight: normal;
		opacity: 0.4;
		cursor: not-allowed;
		background-color: rgb(60, 60, 60);
		box-shadow: none;
	}

	.query {
		position: relative;
		color: var(--main_white);
		bottom: 5px;
		font-size: large;
		margin-left: 20px;
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
