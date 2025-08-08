<script lang="ts">
	import { ContentEditable } from '$lib/components/ui/content-editable';
	import { cn } from '$lib/utils';
	import { PersistedState } from 'runed';

	type ChartConfig = {
		title: string;
		subtitle: string;
		yAxisLabel: string;
		nonPromotedSeriesColor: string;
		categories: {
			label: string;
			color: string;
		}[];
		series: {
			label: string;
			data: {
				allegedData: string;
				bullshitHeight: number;
			}[];
		}[];
	};

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

	let dragStartY = $state(0);
	let originalDragHeight = $state(0);
	let draggingSeriesIndex = $state<[number, number] | null>(null);
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

<main class="flex h-svh items-center justify-center">
	<div class="flex flex-col gap-8">
		<button type="button" onclick={reset}>Reset</button>
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
						<span class="text-sm">{category.label}</span>
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
							class="absolute bottom-0 ml-2 w-52 rounded-sm border border-black"
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
</main>
