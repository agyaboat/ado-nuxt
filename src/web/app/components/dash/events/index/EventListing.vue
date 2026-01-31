<script setup lang="ts">
  // import {allList, runningList, draftList, endedList} from '~/composables/sample-event-seeds'
  // import type { EventCardProps } from '~/types/event';

  const tabValue = ref<number>(0)
  const valueMaps = {
    running: 0,
    draft: 1,
    ended: 2,
    trashed: 3,
  }

  const rvalueMaps = {
    '0': 'running',
    '1': 'draft',
    '2': 'ended',
    '3': 'trashed',
  }

  const eventStore = useEventsDraftStore()

  const storeMaps = {
    '0' : eventStore.active,
    '1' : eventStore.draft,
    '2' : eventStore.ended,
    '3' : eventStore.trashed
  }

</script>

<template>
  <div class="">
    <div ref="ll"></div>
    <div>
      <!-- {{ filters }} -->
      <Tabs v-model:value="tabValue" scrollable>
        <div class="mb-2 text-muted-color">Tap on the Tabs below to view events under each status: </div>
        <TabList class="max-w-sm rounded-xl mb-5">
          <!-- <Tab :value="valueMaps.all">All Events</Tab> -->
          <Tab :value="valueMaps.running">Live</Tab>
          <Tab :value="valueMaps.draft">Drafts</Tab>
          <Tab :value="valueMaps.ended">Ended</Tab>
          <Tab :value="valueMaps.trashed">Trashed</Tab>
        </TabList>
        
        <!-- <component :is="compMaps[String(tabValue) as keyof typeof compMaps]" /> -->
         <DashEventsList v-if="tabValue === 0" :model="eventStore.active" />
         <DashEventsList v-else-if="tabValue === 1" :model="eventStore.draft" />
         <DashEventsList v-else-if="tabValue === 2" :model="eventStore.ended" />
         <DashEventsList v-else-if="tabValue === 3" :model="eventStore.trashed" />

        </Tabs>
      </div>
      <div></div>
    </div>
</template>

<style scoped>
</style>
