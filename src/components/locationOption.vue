<script>
import axios from 'axios';

export default {
  name: 'LocationOption',
  data() {
    return {
      locations: this.getLocations()
    }
  },
  methods: {
    async getLocations() {
      this.locations = await axios.get('http://localhost:8000/');
      console.log(this.locations);
    }
  }
}
</script>

<template>
  <option
    v-for="item of locations.data"
    :key="item.location_id"
    :value="item.location_id"
  >{{ item.location_name }}</option>
</template>
