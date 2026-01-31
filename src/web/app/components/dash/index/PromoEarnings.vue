<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'

  const period = ref()
  const periods = ['Last 24 hours', 'This week', 'This month','This Year']
  period.value = periods[3]

  onMounted(()=>{
    chartData.value = setChartData()
    chartOptions.value = setChartOptions()
  })
  const chartData = ref()
  const chartOptions = ref()
  const setChartData = (): ChartData => {
    // const documentStyle = getComputedStyle(document.documentElement);
    return {
      // labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      labels: ['Elite', '1st Class', '2nd Class', '3rd Class', 'Random(5)', 'Random(6)'],
       datasets: [
        {
            // label: 'Dataset 1',
            label: 'Event Code Tiers',
            fill: true,
            // borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
            yAxisID: 'y',
            tension: 0.4,
            data: [28, 25, 23, 22, 20, 19],
        },
      ]
    }
  }

  const setChartOptions = (): ChartOptions => {
    return {
      plugins: {
        legend: {
          // display: false
        },
        tooltip: {
          // enabled: false
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          grid: {
            display: false
          },
          // min: 0
        }
      },
    }
  }
</script>

<template>
  <Card class="col-span-1 lg:col-span-2 min-h-40">
    <template #content>
      <div>
        <h2 class="text-muted-color">PROMO EARNINGS</h2>
        <div class="flex justify-between items-center gap-5 mb-8">
          <div class="grow flex flex-wrap items-end gap-2 font-semibold">
            <div class="text-3xl"><Cedi class="" /> {{ 320.00.toFixed(2) }}</div>
            <div class="text-sm text-primary">+{{ 10.0.toFixed(1) }}%</div>
          </div>
          <div class="card flex justify-center">
              <Select v-model="period" :options="periods" class="w-full md:w-48" />
          </div>
        </div>

        <div class="w-full">
          <Chart type="line" :data="chartData" :options="chartOptions" class="min-h-30" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
