<script setup lang="ts">
import { ref, defineEmits, onMounted } from 'vue';
import axios  from 'axios'

import SearchBox from './subcomponents/SearchBox.vue';

import { type Trip, type changes } from  './types'


const props = defineProps<{
  trip: Trip,
  edit: boolean
}>();

const emit = defineEmits<{
  (e:'selected',value?:{
    id:number,
    start:{
      date:string,
      time:string
    },
    end?:{
      date:string,
      time:string
    },
    href: string,
  }):void,
  (e:'change',value?:changes):void,
  (e:'stay',value?:{
    id:number,
  }):void,
  (e:'walk',value?:{
    id:number,
  }):void,

}>()

const line_list = ref<{line:string,dir_list:{text:string,href:string}[]}[]>([])

const dir_list = ref<{text:string,href:string}[]>([])

const selected = ref<string>('')

onMounted(async () => {
  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/search",{params:{search:props.trip.name}})
  console.log(response.data.result.filter((e:{name:string,location:{lat:string,lon:string}})=>e.name === props.trip.name))

})


const select_next = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if(target.value == 'line'){
    const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/station",{params:{name:props.trip.name,kind:props.trip.kind}})
    line_list.value = response.data.result
  }else if (target.value == 'stay'){
    emit('stay',{id:props.trip.id})
    dir_list.value = [];
    selected.value = '';
  }else if (target.value == 'walk'){
    emit('walk',{id:props.trip.id})
    dir_list.value = [];
    selected.value = '';
  }
}

const select = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selected.value = target.value;
  const selected_line = line_list.value.find(item => item.line === selected.value);
  dir_list.value = selected_line?.dir_list ?? [];
}

const select_line = async (event: Event) => {
  const target = event.target as HTMLSelectElement;

  emit('selected',{
    id:props.trip.id,
    start:props.trip.start,
    href:target.value
  })
}

const selected_candi = (event?: { name: string, kind?: string }) => {
  const selected_name = event?.name;
  const selected_kind = event?.kind;
  console.log(selected_name)
  console.log(selected_kind)

  const changes = props.trip;
  changes.name = selected_name ?? '';
  changes.editable = false;
  changes.kind = selected_kind;
  emit('change', changes);

}
</script>

<template>
  <div class="Station">
    <div class="times">
      <h3 class="time">{{ props.trip.start.date }} {{ props.trip.start.time }}</h3>
    </div>
    <div class="detail">
      <SearchBox v-if="props.trip.editable" @change="selected_candi"></SearchBox>
      <h3 v-else>{{ props.trip.name }}</h3>

      <select @change="select_next" v-if="props.edit">
        <option value=""></option>
        <option value="line">鉄道</option>
        <option value="stay">宿泊</option>
        <option value="walk">徒歩</option>
      </select>
      <select @change="select" v-if="props.edit">
        <option value="">   </option>
        <option v-for="item in line_list" :key="item.line">{{ item.line }}</option>
      </select>
      <select @change="select_line" v-if="props.edit">
        <option value="">   </option>
        <option v-for="item in dir_list" :key="item.text" :value="item.href">{{ item.text }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>

.Station {
  display: flex;
  height: fit-content;
  max-height: 90px;
}
.Station select{
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  width: 80px;
  margin-left: 5px;
  margin-right: 5px;
  padding: 5px;
  background-color: transparent;
  border: 1px solid #354F33;
  border-left: 0;
  border-right: 0;

  transition: 0.25s
}
.Station select:focus{
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  width: 80px;
  margin-left: 5px;
  margin-right: 5px;
  padding: 5px;
  background-color: transparent;
  border: 2px solid #CA6A1F;
  border-left: 0;
  border-right: 0;
  outline: none ;
}
.times {
  justify-content: center;
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
.detail {
  height: fit-content;
  max-height: 90px;
}
</style>
