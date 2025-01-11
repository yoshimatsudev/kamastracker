<script lang="ts">
	const { data } = $props();

	let kamasValues = $state(data.data);
	let maxValue = $state({ serverName: '', paypalValue: 0, status: '' });
	let audio: HTMLAudioElement;
	let audioEnabled = $state(false);
	let intervalValue = $state(30);
	let threshold = $state(0);

	const getMaxValue = (data) => {
		return data.reduce(
			(max, item) => {
				const paypalValue = parseFloat(item.paypalValue.replace('€/M', ''));
				return paypalValue > max.paypalValue ? { serverName: item.serverName, paypalValue, status: item.status } : max;
			},
			{ serverName: '', paypalValue: 0, status: ''}
		);
	};

	function updateThreshold(event) {
		threshold = parseFloat(event.target.value);
		localStorage.setItem('threshold', threshold.toString());
	}

	function updateIntervalValue(event) {
		intervalValue = parseFloat(event.target.value);
		localStorage.setItem('intervalValue', intervalValue.toString());
	}

	maxValue = getMaxValue(kamasValues);

	async function fetchDataAndCheckAlarms() {
		try {
			const response = await fetch('/');
			const data = await response.json();
			kamasValues = data;

			const values = data.map((item) => {
				return {
					serverName: item.serverName,
					paypalValue: parseFloat(item.paypalValue.replace('€/M', '')),
					status: item.status
				};
			});

			if (threshold > 0) {
				values.forEach((item) => {
					if (parseFloat(item.paypalValue) >= threshold) {
						if (audioEnabled && audio) {
							audio.play();
						}

						alert(`${item.serverName} is above the threshold of ${threshold}€/M, status: ${item.status}`);
					}
				});
			}

			maxValue = values.reduce(
				(max, item) => {
					return item.paypalValue > max.paypalValue
						? { serverName: item.serverName, paypalValue: item.paypalValue, status: item.status }
						: max;
				},
				{ serverName: '', paypalValue: 0, status: '' }
			);
		} catch (error) {
			console.error('Error fetching data contact developer', error);
		}
	}

	function enableAudio() {
		audioEnabled = !audioEnabled;
	}

	$effect(() => {
		setInterval(fetchDataAndCheckAlarms, intervalValue * 60 * 1000);

		// fetchDataAndCheckAlarms();
	});

	$effect(() => {
		const storedThreshold = localStorage.getItem('threshold');
		if (storedThreshold) {
			threshold = parseFloat(storedThreshold);
		}
	})

	$effect(() => {
		const storedIntervalValue = localStorage.getItem('intervalValue');
		if (storedIntervalValue) {
			intervalValue = parseFloat(storedIntervalValue);
		}
	})
</script>

<audio src="https://freesound.org/data/previews/536/536420_4921277-lq.mp3" bind:this={audio}
></audio>

<div class="mx-auto max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-md">
	<h1 class="text-center text-2xl font-bold">Monitoramento de kamas</h1>
	<div class="rounded-lg bg-gray-100 p-4">
		<h2 class="text-lg font-semibold">Valores do kamas:</h2>
		<p class="text-gray-700">{JSON.stringify(kamasValues)}</p>
	</div>
	<div class="rounded-lg bg-gray-100 p-4">
		<h2 class="text-lg font-semibold">Melhor valor:</h2>
		<p class="text-gray-700">Server: {maxValue.serverName}</p>
		<p class="text-gray-700">Value: {maxValue.paypalValue}€/M</p>
		<p class="text-gray-700">Status: {maxValue.status}</p>
	</div>

	<div class="bg-gray-100 p-4 rounded-lg">
		<h2 class="text-lg font-semibold">Valor para alerta: 0 para desabilitar</h2>
		<input type="number" bind:value={threshold} oninput={updateThreshold} class="w-full p-2 border rounded" />
	</div>

	<div class="bg-gray-100 p-4 rounded-lg">
		<h2 class="text-lg font-semibold">Intervalo de verificação em minutos:</h2>
		<input type="number" bind:value={intervalValue} oninput={updateIntervalValue} class="w-full p-2 border rounded" />
	</div>
	{#if audioEnabled}
		<button
			class="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			onclick={enableAudio}>Desabilitar alerta de audio</button
		>
	{:else}
		<button
			class="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			onclick={enableAudio}>Habilitar alerta de audio</button
		>
	{/if}
</div>
