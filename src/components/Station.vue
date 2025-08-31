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
  (e:'draw',value?:{id:number, geometry:any}):void,
  (e:'centering',value?:{id:number}):void

}>()

const line_list = ref<{line:string,dir_list:{text:string,href:string}[]}[]>([])

const dir_list = ref<{text:string,href:string}[]>([])

const selected = ref<string>('')

const next = ref<string>('')
const line = ref<string>('')
const dir = ref<string>('')

onMounted(async () => {
  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/search",{params:{search:props.trip.name}})
  const loc = response.data.result.filter((e:{name:string,location:{lat:string,lon:string}})=>e.name === props.trip.name)[0]?.location;
  const geometry = {
    type: 'Point',
    coordinates: [Number(loc?.lat ?? '0'), Number(loc?.lon ?? '0')]
  }
  
  emit('draw', {id: props.trip.id, geometry: geometry});

  console.log(props.trip.selected)

  next.value = props.trip.selected?.next ?? '';

  await fetch_line()

  line.value = props.trip.selected?.line ?? '';

  await fetch_dir(line.value);

  dir.value = props.trip.selected?.dir ?? '';

})

const fetch_line = async () => {
  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/station",{params:{
      name:props.trip.name,
      kind:props.trip.kind,
      date:props.trip.start.date.split('/').join('-')
    }})
  line_list.value = response.data.result
}

const fetch_dir = async (line:string) => {
  if(!line || line === ''){
    return;
  }
  const selected_line = line_list.value.find(item => item.line === line);
  dir_list.value = selected_line?.dir_list ?? [];
}

const select_next = async (event: Event) => {

  

  const changes = props.trip;
  changes.start = props.trip.start
  if(props.trip.start.latitude == undefined || props.trip.start.longitude == undefined){
      const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/search",{params:{search:props.trip.name}})
      const loc = response.data.result.filter((e:{name:string,location:{lat:string,lon:string}})=>e.name === props.trip.name)[0].location;
      changes.start.latitude = Number(loc.lat ?? '0');
      changes.start.longitude = Number(loc.lon ?? '0');
  }
  const target = event.target as HTMLSelectElement;

  next.value = target.value;

  

  changes.start.date = props.trip.start.date
  changes.start.time = props.trip.start.time
  if(!changes.selected){
    changes.selected = { next: '', line: '' };
  }
  changes.selected.next = target.value;
  emit('change', changes);

  
  if(target.value == 'line'){
    await fetch_line();
  }else if (target.value == 'stay'){
    emit('stay',{id:props.trip.id})
    dir_list.value = [];
    selected.value = '';
  }else if (target.value == 'walk'){
    emit('walk',{id:props.trip.id})
    dir_list.value = [];
    selected.value = '';
  }

  console.log(next.value)
}

const select = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selected.value = target.value;

  line.value = target.value;

  const changes: changes = props.trip;

  changes.id = props.trip.id;
  changes.name = props.trip.name;
  changes.kind = props.trip.kind;
  if (!changes.start) {
    changes.start = { date: '', time: '' };
  }
  changes.start.date = props.trip.start.date;
  changes.start.time = props.trip.start.time;
  if (!changes.end) {
    changes.end = { date: '', time: '' };
  }
  changes.end.date = props.trip.end.date;
  changes.end.time = props.trip.end.time;
  if(!changes.selected){
    changes.selected = { next: '', line: '' };
  }
  changes.selected.next = props.trip.selected.next;
  changes.selected.line = selected.value;
  emit("change",changes);
  const selected_line = line_list.value.find(item => item.line === selected.value);
  dir_list.value = selected_line?.dir_list ?? [];
}

const select_line = async (event: Event) => {
  const target = event.target as HTMLSelectElement;

  dir.value = target.value;

  const changes: changes = props.trip;

  changes.id = props.trip.id;
  changes.name = props.trip.name;
  changes.kind = props.trip.kind;
  if (!changes.start) {
    changes.start = { date: '', time: '' };
  }
  changes.start.date = props.trip.start.date;
  changes.start.time = props.trip.start.time;
  if (!changes.end) {
    changes.end = { date: '', time: '' };
  }
  changes.end.date = props.trip.end.date;
  changes.end.time = props.trip.end.time;
  if(!changes.selected){
    changes.selected = { next: '', line: '' };
  }
  changes.selected.next = props.trip.selected.next;
  changes.selected.line = props.trip.selected.line;
  changes.selected.dir = target.value;
  emit("change",changes);


  emit('selected',{
    id:props.trip.id,
    start:props.trip.start,
    href:target.value
  })
}

const selected_candi = (event?: { name: string, kind?: string, location?: { lat: string, lon: string } }) => {
  const selected_name = event?.name;
  const selected_kind = event?.kind;
  const selected_location = event?.location;

  const changes = props.trip;
  changes.name = selected_name ?? '';
  changes.editable = false;
  changes.kind = selected_kind;
  changes.start.latitude = Number(selected_location?.lat) ?? 0;
  changes.start.longitude = Number(selected_location?.lon) ?? 0;
  emit('change', changes);

}
</script>

<template>
  <div class="Station" @click="emit('centering', { id: props.trip.id })">
    <div class="times">
      <h3 class="time"><span class="date">{{ props.trip.start.date }}</span> {{ props.trip.start.time }}</h3>
    </div>
    <div class="detail">
      <SearchBox v-if="props.trip.editable" @change="selected_candi"></SearchBox>
      <h3 v-else>{{ props.trip.name }}</h3>

      <select @change="select_next" v-if="props.edit" :value="next">
        <option value=""></option>
        <option value="line">鉄道</option>
        <option value="stay">宿泊</option>
        <option value="walk">徒歩</option>
      </select>
      <select @change="select" v-if="props.edit" :value="line">
        <option value="">   </option>
        <option v-for="item in line_list" :key="item.line">{{ item.line }}</option>
      </select>
      <select @change="select_line" v-if="props.edit" :value="dir">
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

  width: 6vw;
  max-width: 80px;
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

  width: 6vw;
  max-width: 80px;
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
.detail h3{
  height: 28px;
  overflow: hidden;
}
@media (max-width: 750px) {
  .Station select {
    width: 50px;
  }
}
</style>
