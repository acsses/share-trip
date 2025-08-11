<script setup lang="ts">
import { reactive,onMounted } from 'vue';

import Station from '../components/Station.vue';
import Line from '../components/Line.vue';
import Stay from '../components/Stay.vue';
import Header from '../components/Header.vue';
import Walk from '../components/Walk.vue';
import { type Trip} from  '../components/types'

import axios from 'axios'


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



</script>

<template>
  <Header :header="journy.header" :edit="false"/>
  <div class="margin"></div>
  <div>
    <template v-for="trip in journy.trips" :key="trip.name">
      <div v-if="trip.type == 'Station'" class="section">
        <Station :trip="trip" :edit="false"/>
      </div>
      <div v-else-if="trip.type == 'Line'" class="section">
        <Line :trip="trip" :edit="false" />
      </div>
      <div v-else-if="trip.type == 'Stay'" class="section">
        <Stay/>
      </div>
      <div v-else-if="trip.type == 'Walk'" class="section">
        <Walk :trip="trip"/>
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

  svg{
    width: 30vw;
  }

}
</style>
