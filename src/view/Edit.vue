<script setup lang="ts">
import { reactive,onMounted } from 'vue';
import Station from '../components/Station.vue';
import Line from '../components/Line.vue';
import Stay from '../components/Stay.vue';
import Header from '../components/Header.vue';
import { type changes, type Trip, type header } from  '../components/types'

import axios from 'axios'


const props = defineProps<{
    id: number
}>();

const journy = reactive({
  id:0,
  name: '',
  header: {
    season: '夏',
    month: '',
    day: '',
    destination: '広島',
    travelType: '',
    name: ''
  },
  trips: [] as Trip[]
})

const now_date = new Date();

journy.trips.push({id:0,type:'Station',name:'京都',start:{date:`${now_date.getFullYear()}/${now_date.getMonth() + 1}/${now_date.getDate()}`,time:'08:30'},end:{date:'',time:''},kind:"R"})

onMounted(async () => {
  if (isNaN(props.id)) {
    console.log('No ID provided');
    return;
  }
  const response = await axios.get(`https://vercel-kv-three.vercel.app/api/get/${props.id}`)
  console.log(response.data)
  if (response.data) {
    console.log(response.data.data[0])
    const data = JSON.parse(response.data.data[0].data);
    journy.id = response.data.id;
    journy.name = data.name;
    journy.header = data.header;
    journy.trips = data.trips;
  } else {
    console.log('No data found for the given ID');
  }
})
console.log(props.id)

const selected_line = (value?: {id:number,start:{date:string,time:string},href:string}):void => {
  //timetable.time_table = value?.table ?? []

  if (value?.id !== undefined && value.id < journy.trips.length) {
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const last = journy.trips[journy.trips.length - 1]

  journy.trips.push({
    id:journy.trips.length,
    type:'Line',
    name:'',
    start:{date:last.start.date,time:value?.start.time ?? ''},
    end:{date:'',time:''},
    kind: last.kind,
    href: value?.href ?? ''
  })
}

const selected_stop = (value?: changes):void => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const trip = journy.trips.find(item => item.id === value?.id)

  if (trip && value?.start !== undefined) {
    trip.end = value.start;
  }

  journy.trips.push({id:journy.trips.length,type:'Station',name:value?.name ?? '',start:value?.start ?? {date:"",time:""},end:{date:"",time:""}})
}

const changed_el = (value?: changes):void => {

  const trip = journy.trips.find(item => item.id === value?.id)
  if (trip) {
    trip.name = value?.name ?? ''
    trip.start = value?.start ?? {date:'',time:''}
    trip.end = value?.end ?? {date:'',time:''}
  }
}

const selected_stay = (value?: {id:number}):void => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const trip = journy.trips.find(item => item.id === value?.id)

  if (trip) {
    trip.end = trip.start;
  }

  journy.trips.push({id:journy.trips.length,type:'Stay',name:'',start:trip?.start ?? {date:'',time:''},end: {date:'',time:''}})

  const new_date = new Date();
  new_date.toLocaleString()

  new_date.setDate(new_date.getDate() + 1);

  journy.trips.push({id:journy.trips.length,type:'Station',name:trip?.name ?? '',start:{date:`${new_date.getFullYear()}/${new_date.getMonth() + 1}/${new_date.getDate()}`,time:'08:00'},end:{date:new_date.toLocaleDateString(),time:new_date.toLocaleTimeString()}})
}

const selected_walk = (value?: {id:number}):void => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const trip = journy.trips.find(item => item.id === value?.id)

  if (trip) {
    trip.end = trip.start;
  }

  journy.trips.push({id:journy.trips.length,type:'Walk',name:'',start:trip?.start ?? {date:'',time:''},end: {date:'',time:''}})

  journy.trips.push({id:journy.trips.length,type:'Station',name:'',start:trip?.start ?? {date:'',time:''},end: {date:'',time:''},editable:true})
}

const header_changes = (value?: header):void => {
  // This function can be used to handle changes from the Header component
  // For example, you can update the journey trips based on the header inputs
  if (value) {
    console.log(value);
    journy.header.season = value.season;
    journy.header.month = value.month;
    journy.header.day = value.day;
    journy.header.destination = value.destination;
    journy.header.travelType = value.travelType;
    journy.header.name = value.name;
    journy.name = value.name;

    console.log(journy)
  }
}

const save = async (value?: header) => {
  if (value) {
    console.log(value);
    journy.header.season = value.season;
    journy.header.month = value.month;
    journy.header.day = value.day;
    journy.header.destination = value.destination;
    journy.header.travelType = value.travelType;
    journy.header.name = value.name;
    journy.name = value.name;

  }
  // This function can be used to save the journey data

  const response = await axios.post("https://vercel-kv-three.vercel.app/api/save",{id:journy.id, data:JSON.stringify(journy)})

  console.log(response.data.id)
  console.log('Saving journey:', journy);

  journy.id = response.data.id;
  // You can implement the logic to save the journey data here
}

</script>

<template>
  <Header :header="journy.header" :edit="true" @changed="header_changes" @save="save"/>
  <div class="margin"></div>
  <div>
    <template v-for="trip in journy.trips" :key="trip.name">
      <div v-if="trip.type == 'Station'" class="sectioon">
        <Station :trip="trip" :edit="true" @selected="selected_line" @stay="selected_stay" @walk="selected_walk"/>
      </div>
      <div v-else-if="trip.type == 'Line'" class="sectioon">
        <Line :trip="trip" :edit="true" @selected="selected_stop" @changed="changed_el"/>
      </div>
      <div v-else-if="trip.type == 'Stay'" class="sectioon">
        <Stay/>
      </div>
      <div v-else-if="trip.type == 'Walk'" class="sectioon">
        <h3>徒歩</h3>
      </div>
    </template>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');

.time{
  font-family: "Roboto Mono", monospace;
  margin: 0;
  color: #9c9c9c;
  margin-right: 50px;
}
.detail {
    width:270px;
}
.times{
  display: flex;
  flex-direction: column;
}
.sectioon {
  margin-bottom: 20px;
}
.margin {
  margin-bottom: 40px;
}
</style>
