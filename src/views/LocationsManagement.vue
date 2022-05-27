<script>
import axios from 'axios';
import Header from '@/components/header.vue';
import Notification from '@/components/notification';

export default {
  name: 'LocationsManagement',
  components: {
    Header,
    Notification
  },
  beforeMount() {
    this.getLocations();
  },
  data() {
    return {
      locations: []
    }
  },
  methods: {
    async getLocations() {
      this.locations = await axios.get('http://localhost:3000/locations');
    }
  }
}
</script>

<template>
<div class="backgroundColor"></div>
<Header />
<Notification />
<section class="flex locations">
  <span class="flex locations__header">
    <h2 class="title locations__header__title">{{ $t('locations.subject') }}</h2>
    <button class="btn home-btn locations__header__addBtn" type="button">{{ $t('locations.add_title') }}</button>
  </span>
  <span class="locations__container">
    <span
      v-for="(location, index) in locations.data"
      :key="location.location_id"
      class="locations__container__header__item"
      :class="'locations__container__header__item__' + index + 1"
    >
    <span>
      {{ location.location.id }}
    </span>
    <span>
      {{ location.location.name }}
    </span>
  </span>
  </span>
</section>
</template>

<style lang="scss">
.locations {
    flex-direction: column;
    width: 100%;
    height: 80%;
    align-items: center;

    &__header {
        width: 80%;
        align-items: baseline;

        &__addBtn {
            margin: 0;
            height: max-content;
        }

        &__title {
            font-family: 'Lobster Two', cursive;
            font-size: 2em;
            text-align: center;
            flex: 1;
        }
    }

    &__container {
        width: 60%;
        height: 80%;
        justify-content: flex-start;
        overflow: auto;
        @include box-shadow;
        @include tabContainer(80%);

        &__row__item--email {
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>
