<script setup lang="ts">
import { reactive,onMounted,ref } from 'vue';

import Station from '../components/Station.vue';
import Line from '../components/Line.vue';
import Stay from '../components/Stay.vue';
import Header from '../components/Header.vue';
import Walk from '../components/Walk.vue';
import { type Trip} from  '../components/types'

import axios from 'axios'
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

const now_date = new Date();

journy.trips.push({id:0,type:'Station',name:'京都',start:{date:`${now_date.getFullYear()}/${now_date.getMonth() + 1}/${now_date.getDate()}`,time:'08:30'},end:{date:'',time:''},kind:"R"})

onMounted(async () => {
  if (isNaN(props.id)) {
    console.log('No ID provided');
    return;
  }
  console.log(`Fetching data for ID: ${props.id}`);
  const response = await axios.get(`https://vercel-kv-three.vercel.app/api/get/${props.id}`)
  console.log(response.data)
  if (response.data) {
    console.log(response.data.data[0])
    const data = JSON.parse(response.data.data[0].data);
    console.log(data)
    journy.id = response.data.id;
    journy.name = data.name;
    journy.header = data.header;
    journy.trips = data.trips;
    console.log(journy);
  } else {
    console.log('No data found for the given ID');
  }
})
console.log(props.id)

const draw = (value?: {id:number, geometry:any}):void =>{
  console.log("called draw")
  if (value?.geometry) {
      if (value.geometry.type === 'LineString') {
          const trip = journy.trips.find(item => item.id === value.id);
          if (trip) {
            if (trip.type === 'Walk') {
              walk_lines.push({id: value.id, geometry: value.geometry});
            }else if (trip.type === 'Line') {
              transport_lines.push({id: value.id, geometry: value.geometry});
            }
          }
      } else if (value.geometry.type === 'Point') {
          points.push({id: value.id, geometry: value.geometry});
      }
  }
  console.log("draw",value);
}

const marker_click = (value: {id:number}) =>{
  console.log("marker clicked")
  const target = document.getElementById(String(value.id));
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

const centering = (value?: {id:number}) => {
  const id = value?.id;
  const trip = journy.trips.find(item => item.id === id);
  if (trip) {
    map_center.value = [
      trip.start.latitude ?? map_center.value[0],
      trip.start.longitude ?? map_center.value[1]
    ];
  }
}

</script>

<template>
  <Header :header="journy.header" :edit="false"/>
  <div class="box">
    <div class="journy">
      <div class="margin"></div>
        <div>
          <template v-for="trip in journy.trips" :key="trip.name">
            <div v-if="trip.type == 'Station'" class="section">
              <Station :trip="trip" :edit="false"
                @draw="draw"
                @centering="centering"
                :id="trip.id"
              />
            </div>
            <div v-else-if="trip.type == 'Line'" class="section">
              <Line :trip="trip" :edit="false" @draw="draw" />
            </div>
            <div v-else-if="trip.type == 'Stay'" class="section">
              <Stay/>
            </div>
            <div v-else-if="trip.type == 'Walk'" class="section">
              <Walk :trip="trip" @draw="draw"/>
            </div>
          </template>
        </div>
    </div>
    <div class="map">
    <LMap id="map" :zoom="8" :center="map_center" :use-global-leaflet="false">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" ></LTileLayer>
      <LControlZoom position="bottomright"  />
      <LMarker
        v-for="point in points"
        :key="point.id"
        :latLng="point.geometry?.coordinates"
        @click="marker_click({id: point.id})"
      />
      <LPolyline
        v-for="line in walk_lines"
        :key="line.id"
        :lat-lngs="line.geometry?.coordinates"
        color="#3388ff"
      />
      <LPolyline
        v-for="line in transport_lines"
        :key="line.id"
        :lat-lngs="line.geometry?.coordinates"
        color="#3388ff"
      />
    </LMap>
    </div>
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
.section {
  width: fit-content;
  margin-bottom: 20px;
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
