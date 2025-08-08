<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { ContentEditable } from '$lib/components/ui/content-editable';
	import { cn } from '$lib/utils';
	import { PersistedState } from 'runed';
	import * as Icons from '$lib/components/icons/moving';
	import * as z from 'zod/v4';
	import { toast } from 'svelte-sonner';
	import { domToPng } from 'modern-screenshot';
	import CameraIcon from '@lucide/svelte/icons/camera';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Footer from '$lib/components/site/footer.svelte';

	const ChartConfigSchema = z.object({
		title: z.string(),
		subtitle: z.string(),
		yAxisLabel: z.string(),
		nonPromotedSeriesColor: z.string(),
		categories: z.array(
			z.object({
				label: z.string(),
				color: z.string()
			})
		),
		series: z.array(
			z.object({
				label: z.string(),
				data: z.array(
					z.object({
						allegedData: z.string(),
						bullshitHeight: z.number()
					})
				)
			})
		)
	});

	type ChartConfig = z.infer<typeof ChartConfigSchema>;

	const DEFAULT_CHART_CONFIG: ChartConfig = {
		title: 'Developer Productivity',
		subtitle: 'Productivity across different teams',
		yAxisLabel: '# Tickets Completed / Week',
		categories: [
			{
				label: 'At Work',
				color: '#E89ACC'
			},
			{
				label: 'At Home',
				color: '#EFC2D1'
			}
		],
		nonPromotedSeriesColor: '#ffffff',
		series: [
			{
				label: 'Me',
				data: [
					{
						allegedData: '0',
						bullshitHeight: 90
					},
					{
						allegedData: '0',
						bullshitHeight: 70
					}
				]
			},
			{
				label: 'External Contractors',
				data: [
					{
						allegedData: '50',
						bullshitHeight: 30
					}
				]
			},
			{
				label: 'Dev Team',
				data: [
					{
						allegedData: '20',
						bullshitHeight: 30
					}
				]
			}
		]
	};

	const chartConfig = new PersistedState<ChartConfig>('chart-config', DEFAULT_CHART_CONFIG);

	function reset() {
		chartConfig.current = DEFAULT_CHART_CONFIG;
	}

	function download() {
		const json = JSON.stringify(chartConfig.current);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'bullshit-chart.json';
		a.click();
		a.remove();
	}

	async function importChart(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const file = e.currentTarget.files?.[0];

		if (!file) return;

		const contents = await file.text();

		try {
			const json = JSON.parse(contents);
			const validated = ChartConfigSchema.safeParse(json);

			if (!validated.success) {
				toast.error('Invalid chart config');
				return;
			}

			chartConfig.current = validated.data;
		} catch (e) {
			toast.error('Error parsing chart config', {
				description: e instanceof Error ? e.message : 'Unknown error'
			});
		}
	}

	async function screenshot() {
		const url = await domToPng(chartRef as Node);

		const a = document.createElement('a');
		a.download = 'bullshit-chart.png';
		a.href = url;
		a.click();
		a.remove();
	}

	let dragStartY = $state(0);
	let originalDragHeight = $state(0);
	let draggingSeriesIndex = $state<[number, number] | null>(null);

	let chartRef = $state<HTMLDivElement | null>(null);
</script>

<svelte:window
	onpointermove={(e) => {
		if (draggingSeriesIndex !== null) {
			const difference = e.clientY - dragStartY;

			const newHeightPx = originalDragHeight - difference;

			const newHeightPercentage = Math.min(100, Math.max(0, (newHeightPx / 500) * 100));

			chartConfig.current.series[draggingSeriesIndex[0]].data[
				draggingSeriesIndex[1]
			].bullshitHeight = newHeightPercentage;
		}
	}}
	onpointerup={() => (draggingSeriesIndex = null)}
/>

<main class="grid h-svh grid-rows-[1fr_auto]">
	<div class="flex place-items-center justify-center">
		<div class="flex flex-col">
			<div class="flex items-center justify-end gap-2">
				<Tooltip.Provider delayDuration={150}>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button onclick={screenshot} size="icon" variant="outline" class="group" {...props}>
									<CameraIcon />
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>Download as PNG</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<div>
								<label
									for="chart-config"
									class={buttonVariants({ variant: 'outline', size: 'icon' })}
								>
									<Icons.Download />
								</label>
								<input type="file" accept=".json" id="chart-config" hidden onchange={importChart} />
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>Import from JSON file</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button onclick={download} size="icon" variant="outline" class="group" {...props}>
									<Icons.Upload />
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>Download as JSON</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button onclick={reset} size="icon" variant="outline" class="group" {...props}>
									<Icons.RefreshCcw />
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>Reset to default</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
			<div bind:this={chartRef} class="flex flex-col gap-8 bg-background p-8">
				<div class="flex flex-col gap-2">
					<div>
						<ContentEditable
							this="h1"
							bind:content={chartConfig.current.title}
							class="text-2xl font-medium"
						/>
						<ContentEditable this="p" bind:content={chartConfig.current.subtitle} class="text-sm" />
					</div>
					<!-- legend -->
					<div class="flex place-items-center gap-4">
						{#each chartConfig.current.categories as category, i (i)}
							<div class="flex items-center gap-2">
								<div
									class="size-3 rounded-full border border-zinc-600"
									style="background-color: {category.color}"
								></div>
								<ContentEditable this="span" bind:content={category.label} class="text-sm" />
							</div>
						{/each}
					</div>
				</div>

				<!-- "Chart" -->
				<div class="px-7">
					<div class="relative h-[500px] w-[calc(216px*3+36px)]">
						{#each chartConfig.current.series as series, i (i)}
							{#each series.data as data, j (j)}
								<div
									class="absolute bottom-0 ml-2 w-52 rounded-sm border border-black transition-all"
									style="background-color: {i === 0
										? chartConfig.current.categories[j].color
										: chartConfig.current
												.nonPromotedSeriesColor}; translate: calc(({i} * 100%) + ({i} * 8px)); height: {data.bullshitHeight}%;"
								>
									<!-- drag handle -->
									<div
										class="absolute -top-1.5 left-0 h-4 w-[208px] cursor-row-resize select-none"
										onpointerdown={(e) => {
											originalDragHeight = (data.bullshitHeight / 100) * 500;
											dragStartY = e.pageY;
											draggingSeriesIndex = [i, j];
										}}
									></div>
									<div class={cn('absolute -top-7 w-full text-center', j > 0 && 'top-1')}>
										<ContentEditable this="div" bind:content={data.allegedData} />
									</div>
									{#if j === 0}
										<ContentEditable
											this="div"
											class="relative top-[calc(100%+8px)] w-full text-center"
											bind:content={series.label}
										/>
									{/if}
								</div>
							{/each}
						{/each}

						<!-- Y Axis Label -->
						<div
							class="relative top-1/2 left-[calc(-50%-24px)] flex -translate-y-1/2 -rotate-90 place-items-center justify-center"
						>
							<div
								class="min-w-none w-fit max-w-none p-2 text-center outline-none"
								contenteditable="true"
								onblur={(e) => {
									chartConfig.current.yAxisLabel = e.currentTarget.innerText;
								}}
							>
								{chartConfig.current.yAxisLabel}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<Footer />
</main>
