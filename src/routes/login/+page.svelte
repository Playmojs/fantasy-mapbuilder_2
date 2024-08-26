<script lang="ts">
	import Homebar from '../../components/Homebar.svelte';
	import { supabase } from '$lib/dtb';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let errorMessage = '';
	let isDisabled = true;

	let homebarItems = [
		{ label: 'Home', href: '/', position: 'left' },
		{ label: 'Demo Project', href: '/1', position: 'left' },
		{ label: 'Login', href: '/login', position: 'right' },
		{ label: 'Signup', href: '/signup', position: 'right' }
	];

	function validateInputs() {
		isDisabled = email.length === 0 || password.length === 0;
	}

	async function handleLogin() {
		console.log('Login test!');
		return;
		// const { data, error } = await supabase.auth.signInWithPassword({ email, password });

		// if (error) {
		// 	errorMessage = error.message;
		// } else {
		// 	goto('/'); // Redirect to home after successful login
		// }
	}

	function redirectToSignup() {
		goto('/signup');
	}
</script>

<Homebar items={homebarItems} />
<div id="background">
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
		position: fixed;
		background-color: rgb(60, 60, 60);
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}

	#box {
		position: relative;
		top: 200px;
		margin: auto;
		width: 30%;
		height: 45%;
		background-color: rgb(47, 47, 47);
		border-color: rgb(100, 100, 100);
		border-width: 5px;
		border-style: solid;
		border-radius: 20px;
		font-size: x-large;
	}

	h1 {
		position: relative;
		color: white;
		text-align: center;
	}

	.error {
		color: red;
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
</style>
