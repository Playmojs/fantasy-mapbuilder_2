<script>
	import Homebar from '../../components/Homebar.svelte';
	import { supabase } from '$lib/dtb';
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

	async function handleSignup() {
		const { data, error } = await supabase.auth.signUp({ email, password });

		if (error) {
			errorMessage = error.message;
		} else {
			goto('/'); // Redirect to home after successful signup
		}
	}

	function redirectToLogin() {
		goto('/login');
	}
</script>

<main>
	<Homebar items={homebarItems} />
	<h1>Sign Up</h1>
	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
	<form on:submit|preventDefault={handleSignup}>
		<label for="email">Email:</label>
		<input type="email" id="email" bind:value={email} on:input={validateInputs} required />

		<label for="password">Password:</label>
		<input type="password" id="password" bind:value={password} on:input={validateInputs} required />

		<button type="submit" disabled={isDisabled}>Sign Up</button>
	</form>
	<p>Already have an account? <a href="#" on:click={redirectToLogin}>Login</a></p>
</main>

<style>
	main {
		padding: 2rem;
		max-width: 400px;
		margin: auto;
	}

	.error {
		color: red;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	label {
		margin-top: 1rem;
	}

	input {
		padding: 0.5rem;
		margin-top: 0.5rem;
	}

	button {
		margin-top: 1.5rem;
		padding: 0.75rem;
		background-color: #333;
		color: white;
		border: none;
		cursor: pointer;
		opacity: 0.8;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
