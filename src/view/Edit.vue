<script setup lang="ts">
import { reactive,onMounted, ref } from 'vue';
import Station from '../components/Station.vue';
import Line from '../components/Line.vue';
import Stay from '../components/Stay.vue';
import Header from '../components/Header.vue';
import Walk from '../components/Walk.vue';
import { type changes, type Trip, type header } from  '../components/types'

import axios from 'axios'
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LPolyline, LMarker, LControlZoom } from '@vue-leaflet/vue-leaflet';

  

const props = defineProps<{
    id: number
}>();

const journy = reactive({
  id:0,
  name: '',
  header: {
    season: '',
    month: '',
    day: '',
    destination: '',
    travelType: '',
    name: ''
  },
  trips: [] as Trip[]
})


const points = reactive<{id:number,geometry?:any}[]>([])
const walk_lines = reactive<{id:number,geometry?:any}[]>([])
const transport_lines = reactive<{id:number,geometry?:any}[]>([])

const map_center = ref<[number, number]>([32.205869963387336, 131.336749005514])
const map_bounds = ref<[[number, number], [number, number]]>([[0, 0], [0, 0]]);
const map_zoom = ref<number>(8);

const now_date = new Date();

journy.trips.push({id:0,type:'Station',name:'京都',start:{date:`${now_date.getFullYear()}/${now_date.getMonth() + 1}/${now_date.getDate()}`,time:'08:30'},end:{date:'',time:''},kind:"R",editable:true})

onMounted(async () => {
  if (isNaN(props.id)) {
    console.log('No ID provided');
    return;
  }
  const response = await axios.get(`https://vercel-kv-three.vercel.app/api/get/${props.id}`)
  if (response.data) {
  
    const data = JSON.parse(response.data.data[0].data);
    journy.id = response.data.id;
    journy.name = data.name;
    journy.header = data.header;
    journy.trips = data.trips;
    console.log('Journey data loaded:', data.header);
  } else {
    console.log('No data found for the given ID');
  }
})

const selected_line = (value?: {id:number,start:{date:string,time:string},href:string}):void => {
  //timetable.time_table = value?.table ?? []

  if (value?.id !== undefined && value.id < journy.trips.length) {
    console.log("Removing trips after:", value.id);
    console.log("href: ", value.href);
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const last = journy.trips[journy.trips.length - 1]

  journy.trips.push({
    id:journy.trips.length,
    type:'Line',
    name:'',
    start:{
      date:last.start.date,
      time:value?.start?.time ?? '',
      longitude: last.start.longitude,
      latitude: last.start.latitude
    },
    end:{date:'',time:''},
    kind: last.kind,
    href: value?.href ?? ''
  })

}

const selected_stop = async (value?: changes):Promise<void> => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const trip = journy.trips.find(item => item.id === value?.id)

  if (trip && value?.start !== undefined) {
    trip.end.date = value.start.date;
    trip.end.time = value.start.time;
  }

  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/search",{params:{search:value?.name}})
  const loc = response.data.result.filter((e:{name:string,location:{lat:string,lon:string}})=>e.name.replace(/〔.*〕/g, "") === value?.name)[0].location;

  journy.trips.push({
    id:journy.trips.length,
    type:'Station',
    name:value?.name ?? '',
    start:{
      date:value?.start?.date ?? '',
      time:value?.start?.time ?? '',
      longitude: Number(loc.lon ?? '0') ?? '',
      latitude: Number(loc.lat ?? '0') ?? ''
    },
    end:{date:"",time:""}
  })

  const prev = (value?.id !== undefined) ? journy.trips.find(item => item.id === value.id) : undefined;

  if (prev !== undefined) {
    prev.end.latitude = Number(loc.lat ?? '0') ?? '';
    prev.end.longitude = Number(loc.lon ?? '0') ?? '';
  }


}

const changed_el = (value?: changes):void => {

  const trip = journy.trips.find(item => item.id === value?.id)
  if (trip) {
    trip.name = value?.name ?? ''
    trip.start = value?.start ?? {date:'',time:''}
    trip.end = value?.end ?? {date:'',time:''}
    trip.geometry = value?.geometry ?? trip.geometry
    trip.kind = value?.kind ?? trip.kind
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

  const year = trip?.end.date.split('/')[0] ?? `${now_date.getFullYear()}`
  const month = trip?.end.date.split('/')[1] ?? `${now_date.getMonth() + 1}`
  const day = trip?.end.date.split('/')[2] ?? `${now_date.getDate()}`

  new_date.setFullYear(Number(year), Number(month) - 1, Number(day));
  new_date.setDate(new_date.getDate() + 1);

  journy.trips.push({id:journy.trips.length,type:'Station',name:trip?.name ?? '',start:{date:`${new_date.getFullYear()}/${new_date.getMonth() + 1}/${new_date.getDate()}`,time:'06:00'},end:{date:new_date.toLocaleDateString(),time:new_date.toLocaleTimeString()}})
}

const selected_walk = (value?: {id:number}):void => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    journy.trips = journy.trips.filter(item => item.id <= value.id)
  }

  const trip = journy.trips.find(item => item.id === value?.id)

  if (trip) {
  //  trip.end = trip.start;
    trip.end.date = trip.start.date
    trip.end.time = trip.start.time
    trip.end.latitude = trip.start.latitude
    trip.end.longitude = trip.start.longitude
  }

  journy.trips.push({
    id:journy.trips.length,
    type:'Walk',
    name:'Walk',
    start:trip?.end ?? {date:'',time:''},
    end: {date:'',time:''}}
  )

  journy.trips.push({
    id:journy.trips.length,
    type:'Station',
    name:'',
    start:trip?.start ?? {date:'',time:''},
    end: {date:'',time:''},
    editable:true
  })

  console.log(journy)
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

    var start = `${now_date.getFullYear()}/${value.month}/${value.day}`

    for (const trip of journy.trips) {
      if (trip.type === 'Station') {
        trip.start.date = start;
        trip.end.date = start;
      }
      else if (trip.type === 'Line') {
        trip.start.date = start;
        trip.end.date = start;
      }
      else if (trip.type === 'Stay') {
        start = `${now_date.getFullYear()}/${value.month}/${parseInt(value.day)+1}`
        trip.start.date = start;
        trip.end.date = start;
      }
      else if (trip.type === 'Walk') {
        trip.start.date = start;
        trip.end.date = start;
      }

  }
}
}

const save = async (value?: header) => {
  if (value) {
    journy.header.season = value.season;
    journy.header.month = value.month;
    journy.header.day = value.day;
    journy.header.destination = value.destination;
    journy.header.travelType = value.travelType;
    journy.header.name = value.name;
    journy.name = value.name;

  }
  // This function can be used to save the journey data
  console.log('Saving journey:', journy);

  const response = await axios.post("https://vercel-kv-three.vercel.app/api/save",{id:journy.id, data:JSON.stringify(journy)})

  console.log('Saving journey:', journy);

  journy.id = response.data.id;
  // You can implement the logic to save the journey data here
}

const change_st = async (value?: changes) => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    const trip = journy.trips.find(item => item.id === value.id);
    if (trip) {
      if (value?.end) {
        trip.end.date = value?.end?.date ?? ""
        trip.end.time = value?.end?.time ?? "";
      }
      if (value?.name) {
        trip.name = value.name;
      }
      if(value?.selected){
        trip.selected = value.selected;
      }
      if (value?.start?.latitude !== undefined || value?.start?.longitude !== undefined) {
        trip.start.latitude = value.start.latitude;
        trip.start.longitude = value.start.longitude;

        const prev = journy.trips.find(item => item.id === value.id - 1);


        if (prev&& prev.type === 'Walk') {
          prev.end.latitude = value.start.latitude;
          prev.end.longitude = value.start.longitude;
        }

      }
      journy.trips = journy.trips.filter(item => item.id <= value.id)
      console.log("change_st",journy)
    }
  }
}

const draw = (value?: {id:number, geometry:any}):void =>{
  console.log("called draw")
  console.log("id:",value?.id)
  if (value?.geometry) {
      if (value.geometry.type === 'LineString') {
          const trip = journy.trips.find(item => item.id === value.id);
          if (trip) {
            if (trip.type === 'Walk') {
              if(walk_lines.find(item => item.id === value.id)){
                const index = walk_lines.findIndex(item => item.id === value.id);
                walk_lines[index].geometry = value.geometry;
              }else{
                walk_lines.push({id: value.id, geometry: value.geometry});
              }
            }else if (trip.type === 'Line') {
              if(transport_lines.find(item => item.id === value.id)){
                const index = transport_lines.findIndex(item => item.id === value.id);
                transport_lines[index].geometry = value.geometry;
              }else{
                transport_lines.push({id: value.id, geometry: value.geometry});
              }
            }
          }
      } else if (value.geometry.type === 'Point') {
          if(points.find(item => item.id === value.id)){
            const index = points.findIndex(item => item.id === value.id);
            points[index].geometry = value.geometry;
          }else{
            points.push({id: value.id, geometry: value.geometry});
          }
      }
  }
  //console.log("draw",value);
}

const centering = (value?: {id:number}) => {
  const id = value?.id;
  const trip = journy.trips.find(item => item.id === id);
  if (trip) {
    if (trip.type == "Station"){
      map_center.value = [
        trip.start.latitude ?? map_center.value[0],
        trip.start.longitude ?? map_center.value[1]
      ];
    }else{
      console.log("centering", trip)
      if(trip.start.latitude == undefined || trip.start.longitude == undefined || trip.end.latitude == undefined || trip.end.longitude == undefined){
        map_zoom.value = 8;
        return;
      }
      map_bounds.value = [
        [trip.start.latitude ?? 0, trip.start.longitude ?? 0],
        [trip.end.latitude ?? 0, trip.end.longitude ?? 0]
      ];
      console.log("map_bounds",map_bounds.value)
    }
    
  }
}

const change_walk = (value?: changes):void => {
  if (value?.id !== undefined && value.id < journy.trips.length) {
    const trip = journy.trips.find(item => item.id === value.id);
    if (trip) {
      trip.name = value?.name ?? trip.name
      trip.start = value?.start ?? trip.start;
      trip.end = value?.end ?? trip.end;
      trip.geometry = value?.geometry ?? trip.geometry;
    }
  }
  
}

</script>

<template>
  <Header :header="journy.header" :edit="true" @changed="header_changes" @save="save"/>
  <div class="box">
    <div class="journy">
      <div class="margin"></div>
      <div>
        <template v-for="trip in journy.trips" :key="trip.name">
          <div v-if="trip.type == 'Station'" class="sectioon">
            <Station :trip="trip" :edit="true"
                      @selected="selected_line"
                      @stay="selected_stay"
                      @walk="selected_walk"
                      @change="change_st"
                      @draw="draw"
                      @centering="centering"
            />
          </div>
          <div v-else-if="trip.type == 'Line'" class="sectioon">
            <Line :trip="trip" :edit="true"
                    @selected="selected_stop"
                    @changed="changed_el"
                    @draw="draw"
                    @centering="centering"
            />
          </div>
          <div v-else-if="trip.type == 'Stay'" class="sectioon">
            <Stay/>
          </div>
          <div v-else-if="trip.type == 'Walk'" class="sectioon" >
            <Walk :trip="trip" :edit="true"
              @changed="change_walk"
              @draw="draw"
              @centering="centering"
            />
          </div>
        </template>
        <div class="margin"></div>
      </div>
    </div>
    <div class="map">
    <LMap id="map"
        :zoom="map_zoom"
        :center="map_center"
        :bounds="map_bounds"
        :use-global-leaflet="false"
        v-on:update:bounds="console.log('bounds updated', $event)"
      >
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" ></LTileLayer>
      <LControlZoom position="bottomright"  />
      <LMarker
        v-for="point in points"
        :key="point.id"
        :latLng="point.geometry?.coordinates"
      />
      <LPolyline
        v-for="line in walk_lines"
        :key="line.id"
        :lat-lngs="line.geometry?.coordinates"
        :weight="5"
        dash-array="10,20"
        color="#3388ff"
      />
      <LPolyline
        v-for="line in transport_lines"
        :key="line.id"
        :weight="5"
        :lat-lngs="line.geometry?.coordinates"
        color="#3388ff"
      />
    </LMap>
    </div>

  </div>

</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');

.box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.journy {
  width: 50vw;
  height: 100vh;
  overflow-y: scroll;
}
.map {
  z-index: 0;
  width: 50vw;
  height: 100vh;
}


.time{
  font-family: "Roboto Mono", monospace;
  margin: 0;
  color: #9c9c9c;
  margin-right: 50px;
}
.detail {
    width: 30vw;
    max-width:270px;
    
}
.times{
  width: 20vw;
  display: flex;
  flex-direction: column;
}
.sectioon{
  width: fit-content;
  margin-bottom: 20px !important;
  margin: auto;
  
}
.margin {
  margin-bottom: 20vh;
}
@media (max-width: 500px) {
  .times{
    width: 30vw !important;
  }
  .time{
    margin: auto !important;
  }
  .time .date{
    display: none;
  }
  .detail{
    width: 70vw;
  }
  

  .times svg{
    width: 30vw;
  }

}
@media (max-width: 750px){
  .box{
    flex-direction: column;
  }
  .box .journy{
    height: 50vh;
    width: 100vw;
  }
  .box .map{
    height: 50vh;
    width: 100vw;
  }

}

</style>
