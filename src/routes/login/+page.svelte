<script lang="ts">
	import Homebar from '../../components/Homebar.svelte';
	import { supabase } from '$lib/dtb';
	import { goto } from '$app/navigation';
	import { store } from '../../store.svelte';
	import { page } from '$app/stores';
	import "../../lib/styles/button.css"

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
<main>
	<img id="image" src="/assets/Invella.jpg" alt="background" />
	<div id="box">
		<h1>Login</h1>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
		<form onsubmit={(e)=>{e.preventDefault(); handleLogin()}}>
			<label for="email">Email:</label>
			<input type="email" id="email" bind:value={email} oninput={validateInputs} required />

			<label for="password">Password:</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				oninput={validateInputs}
				required
			/>

			<button class="btn-primary" type="submit" disabled={isDisabled}>Login</button>
		</form>
		<p class="query">Don't have an account? <a href="/signup" onclick={redirectToSignup}>Sign up</a></p>
	</div>
</main>

<style>
	main {
		position: relative;
		width: 100%;
		height: calc(100vh - 40px - 2rem);
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#image {
		position: absolute;
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: center;
	}

	#box {
		position: relative;
		width: 80%;
		max-width: 400px;

		display: flex;
		flex-direction: column;
		padding: 1rem 1rem 0rem 1rem;
		gap: 30px;
		
		background-color: var(--color-panel);
		box-shadow: var(--shadow-lg);
		user-select: none;
		
		border-radius: 20px; 
		border: 4px ridge var(--color-accent);
		
		font-size: 100%;
	}

	h1 {
		position: relative;
		color: var(--color-text-primary);
		text-align: center;
		text-shadow: var(--text-shadow-base);
	}

	.error {
		color: red;
		left: 10%;
	}

	form {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-tertiary);
		padding: 5px 0px;
		border-radius: 10px;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	label {
		position: relative;
		left: 10%;
		margin-top: 1rem;
		color: var(--color-text-primary);
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
		background-color: var(--color-border);
		border-radius: 10px;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
	}

	button {
		position: relative;
		margin: 1.5rem auto 0.5rem auto;
		padding: 0.75rem 4rem;
		color: var(--color-text-primary);
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
		background-color: var(--color-panel);
		box-shadow: none;
	}

	.query {
		position: relative;
		color: var(--color-text-primary);
		bottom: 5px;
		font-size: large;
		margin-left: 20px;
	}

	a {
		color:  var(--color-text-secondary);
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
