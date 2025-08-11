<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import axios  from 'axios'

const emit = defineEmits<{
  (e: 'change', value?: { name: string, kind?: string, location?: { lat: string, lon: string } }): void,
}>();

const candi_list = ref<{name:string,location:{lat:string,lon:string},kind?:string}[]>([])

const edit_name = async (event: Event) => {
  const target = event.target as HTMLHeadingElement;
  const new_name = target.textContent?.trim() ?? '';
  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/search",{params:{search:new_name}})

  candi_list.value = response.data.result;
}

const selected_candi = async (event: Event) => {
  const candi = candi_list.value.find(item => item.name === (event.target as HTMLDivElement).textContent?.trim());
  console.log(candi);
  emit('change', { name: (event.target as HTMLDivElement).textContent?.trim() ?? '', kind: candi?.kind, location: { lat: candi?.location.lat ?? '', lon: candi?.location.lon ?? '' } });
}
</script>

<template>
    <h3 contenteditable="true" @input="edit_name"></h3>
    <div class="candi_list" v-if="candi_list.length > 0">
      <div v-for="item in candi_list" :key="item.name" @click="selected_candi">
        {{ item.name }}
      </div>
    </div>
</template>
<style scoped>
h3{
  border-bottom: 1px solid #354F33;
}
h3:focus {
  outline: none;
  border-bottom: 1px solid #CA6A1F;
}
.candi_list {
  background-color: #242424;
  position: absolute;
  display: block;
  width: 270px;
  max-height: 400px;
  overflow-y: scroll;
  z-index: 100;
  border-radius: 5px;
  border: #9c9c9c 1px solid;
}
.candi_list div {
  margin: 0;
  cursor: pointer;
  text-align: left;
}
</style>