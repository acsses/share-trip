<script setup lang="ts">
import { ref,onMounted } from 'vue';
import axios from 'axios'
import { type TimeTable, type changes, type Trip } from  './types'

const props = defineProps<{
    trip: Trip
    edit: boolean
}>();

const emit = defineEmits<{
    (e:'selected',value?:changes):void,
    (e:'changed',value?:changes):void
}>()

const name = ref<string>('')

const hour = ref<string>('')

const minute = ref<string>('')

const timetable = ref<TimeTable>()



//const timetable = ref<{hour?:string,minutes?:{minutes:string,name:string,link:string}[]}[]>([])
const minutes = ref<{minutes:string,name:string,link:string}[]>([])
const train_stops = ref<{station?:string,time?:string,link?:string}[]>([])

onMounted(async () => {
  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/time",{params:{href:props.trip.href}})

  timetable.value = response.data.result;

  if (!timetable.value || timetable.value.length === 0) {
    console.error('Start time is not defined');
    return;
  }
  name.value = props.trip.name
  hour.value = String(Number(props.trip.start?.time.split(':')[0] ?? ''))
  minutes.value = timetable.value?.find(item => item.hour === hour.value)?.minutes ?? [];
  const minute_selected = props.trip.start?.time.split(':')[1] ?? ''
  const selected_train = minutes.value.find(item => item.minutes === minute_selected && item.name == props.trip.name);
  minute.value = selected_train?.link ?? '';
  if(minute.value && minute.value !== ''){
    const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/train",{params:{href:minute.value}})

    train_stops.value = response.data.result
  }

  console.log(props.trip.kind)
  
})

//timetable.value = props.time_table

const selcted_hour = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  hour.value = target.value;
  const selected_hour = timetable.value?.find(item => item.hour === target.value);
  minutes.value = selected_hour?.minutes ?? [];
}

const selected_train = async (event: Event) => {
  const target = event.target as HTMLSelectElement;

  const selected_train = minutes.value.find(item => item.link === target.value);


  name.value = selected_train?.name ?? '';

  var hours = hour.value.length==1 ? "0"+hour.value : hour.value;

  emit('changed',{
    id:props.trip.id,
    start: {
      date: props.trip.start.date,
      time: hours+":"+selected_train?.minutes,
    },
    
    name: name.value
  })

  const response = await axios.get("https://timetable-api-jp-acsses-projects.vercel.app/api/table/train",{params:{href:target.value}})

  train_stops.value = response.data.result

}

const selected = (event: Event):void => {
  const target = event.target as HTMLSelectElement;

  const value = JSON.parse(target.value)

  //timetable.value = value ?? []
  emit('selected',{id:props.trip.id,name:value.station,start:{date:props.trip.start.date,time:value.time}})
}
</script>

<template>
  <div class="Line">
    <div class="times">
      <h3 class="time"><span class="date">{{ props.trip.start.date }}</span> {{ props.trip.start.time }}</h3>
      <svg viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="Pattern_R" x="0" y="0" viewBox="0,0,25,10" width="1" height=".2">
            <line x1="10" y1="0" x2="10" y2="10" stroke="white" stroke-width="2" class = "icon-path"/>
            <line x1="20" y1="0" x2="20" y2="10" stroke="white" stroke-width="2" class = "icon-path"/>
            <line x1="5" y1="5" x2="25" y2="5" stroke="white" stroke-width="2" class = "icon-path"/>
          </pattern>
          <pattern id="Pattern_F" x="0" y="0" viewBox="0,0,30,10"width="1" height=".25">
            <path d="M 15,9 A 4.5 4.5 0 0 1 15 0 " stroke="white"  stroke-width="1" fill="none" class = "icon-path"/>
          </pattern>
          <pattern id="Pattern_P" x="0" y="0" viewBox="0,0,30,10" width="1" height=".2">
            <line x1="10" y1="0" x2="10" y2="10" stroke="white" stroke-width="2" class = "icon-path"/>
            <line x1="25" y1="0" x2="25" y2="10" stroke="white" stroke-width="2" class = "icon-path"/>
            <line x1="17.5" y1="0" x2="17.5" y2="5" stroke="white" stroke-width="2" class = "icon-path"/>
          </pattern>
        </defs>
        <rect fill="url(#Pattern_R)" width="100%" height="40" v-if="props.trip.kind  == 'R'"/>
        <rect fill="url(#Pattern_F)" width="100%" height="40" v-else-if="props.trip.kind  == 'F'"/>
        <rect fill="url(#Pattern_P)" width="100%" height="40" v-else-if="props.trip.kind  == 'P'"/>
        <rect fill="url(#Pattern_R)" width="100%" height="40" v-else />
      </svg>
      <h3 class="time"><span class="date">{{ props.trip.end?.date ?? '' }}</span> {{ props.trip.end?.time ?? '' }}</h3>
    </div>
    <div class="detail">
      <div v-if="props.edit">
        <select @change="selcted_hour" :value="hour">
          <template v-for="item in timetable" :key="item.hour">
              <template v-if="Number(item.hour) >= Number(props.trip.start?.time.split(':')[0])">
                  <option :value="item.hour">{{ item.hour }}</option>
              </template>
          </template>
        </select>
        <select @change="selected_train" :value="minute">
              <template v-if="Number(hour) == Number(props.trip.start?.time.split(':')[0])">
                  <template v-for="train in minutes" :key="train.link">
                      <template v-if="Number(train.minutes) >= Number(props.trip.start?.time.split(':')[1])">
                          <option :value="train.link">{{ train.minutes + ": "+train.name }}</option>
                      </template>
                      <template v-else>
                      </template>
                  </template>
              </template>
              <template v-else>
                  <option v-for="train in minutes" :key="train.link" :value = "train.link">{{ train.minutes + ": "+train.name }}</option>
              </template>
        </select>
      </div>
      <h4>{{ name }}</h4>
      <div v-if="props.edit">
        <select @change="selected">
          <option value="">   </option>
          <template v-for="station in train_stops" :key="station.link">

              <template v-if="Number(station.time?.split(':')[0] ?? 0) == Number(hour) && Number(station.time?.split(':')[1] ?? 0) >= Number(props.trip.start?.time.split(':')[1])">
                  <option :value = "JSON.stringify({'time':station.time,'station':station.station})">{{ station.station }}</option>
              </template>
              <template v-else-if="Number(station.time?.split(':')[0] ?? 0) > Number(hour)">
                  <option :value = "JSON.stringify({'time':station.time,'station':station.station})">{{ station.station }}</option>
              </template>
          </template>
        </select>
      </div>
    </div>

  </div>
</template>

<style scoped>

.Line {
  display: flex;
  align-items: top;
}
.Line select{
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
.Line select:focus{
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
  outline: none;

  transition: 0.25s
}
.times{
    height: 125px;
    justify-content: space-between;
}
.Line .detail {
    height: 125px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
.time {
    margin: 0;
    color: #9c9c9c;
    margin-right: 50px;
}
</style>
