<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type header } from './types';

const props = defineProps<{
    header: header
    edit: boolean
}>();

const season = ref<string>('')
const month = ref<string>('')
const day = ref<string>('')
const destination = ref<string>('')
const travelType = ref<string>('')
const name = ref<string>('')


onMounted(() => {
    season.value = props.header.season;
    month.value = props.header.month;
    day.value = props.header.day;
    destination.value = props.header.destination;
    travelType.value = props.header.travelType;
    name.value = props.header.name;
});

const emit = defineEmits<{
    (e:'changed',value?:header):void
    (e:'save',value?:header):void
}>()

const changed = (arg?:{type:string, value:string}) => {
  // Handle changes to the header inputs
  if (arg?.type === 'season') {
    season.value = arg.value;
  } else if (arg?.type === 'month') {
    month.value = arg.value;
  } else if (arg?.type === 'day') {
    day.value = arg.value;
  } else if (arg?.type === 'destination') {
    destination.value = arg.value;
  } else if (arg?.type === 'travelType') {
    travelType.value = arg.value;
  }

  name.value = `${season.value}${month.value}/${day.value}${destination.value}${travelType.value}`;

  emit ('changed', {
    season: season.value,
    month: month.value,
    day: day.value,
    destination: destination.value,
    travelType: travelType.value,
    name: name.value
  });
  console.log(`${season.value}${month.value}/${day.value}${destination.value}${travelType.value}`);
  // You can emit an event or call a method to update the state in the parent component
}

const save = () => {
  // Handle saving the header data
  emit('save', {
    season: season.value,
    month: month.value,
    day: day.value,
    destination: destination.value,
    travelType: travelType.value,
    name: name.value
  });
}

</script>

<template>
    <header>
    <div>
      <select v-if ="props.edit" class="season" :value="season" @change="changed({'type':'season', 'value': ($event.target as HTMLSelectElement)?.value ?? 'test'})">
        <option value="春">春</option>
        <option value="夏">夏</option>
        <option value="秋">秋</option>
        <option value="冬">冬</option>
      </select>
      <h3 v-else class="season">{{ props.header.season }}</h3>
      <label v-if ="props.edit">季節</label>
    </div>
    <div>
      <div>
        <input v-if ="props.edit" type= "number" class = "date" :value="month" maxlength="2"  min = "0" @change="changed({'type':'month', 'value': ($event.target as HTMLInputElement)?.value ?? '0'})">
        <h3 v-else class="date">{{ props.header.month }}</h3>
        /
        <input v-if ="props.edit" type= "number" class = "date" :value="day" maxlength="2" min = "0" @change="changed({'type':'day', 'value': ($event.target as HTMLInputElement)?.value ?? '0'})"/>
        <h3 v-else class="date">{{ props.header.day }}</h3>
      </div>
      <label v-if ="props.edit">日時</label>
    </div>
    <div>
      <input v-if ="props.edit" type= "text" class = "destination" :value="destination" @change="changed({'type':'destination', 'value': ($event.target as HTMLInputElement)?.value ?? ''})"/>
      <h3 v-else class="destination">{{ props.header.destination }}</h3>
      <label v-if ="props.edit">目的地</label>
    </div>
    <div>
      <select v-if ="props.edit" class="season" :value="travelType" @change="changed({'type':'travelType', 'value': ($event.target as HTMLSelectElement)?.value ?? ''})">
        <option value="旅行">旅行</option>
        <option value="出張">出張</option>
      </select>
      <h3 v-else class="season">{{ props.header.travelType }}</h3>
      <label v-if ="props.edit">旅行or出張</label>
    </div>
    <div v-if ="props.edit">
      <button @click="save()">Save</button>
    </div>
  </header>
</template>

<style>

header{
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 10vh;
  
  display: flex;
  align-items: center;
  justify-content: start;
  backdrop-filter: blur(10px);
  z-index: 2;

}
header > input{
  display:block;
}
header > div{
  margin-right: 10px;
  margin-left: 10px;
}
select.season{
  display: block ;
  height: 32px;
  padding: 2px;
  box-sizing: content-box;
  font-size: 16pt;
}
input.date{
  width: 30pt;
  height: 24pt;
  font-size: 16pt;
}
h3.date{
  display: inline-block;
  width: 30pt;
  height: 24pt;
  font-size: 16pt;
}
input.destination{
  display:block;
  height: 24pt;
  font-size: 16pt;
}
</style>
