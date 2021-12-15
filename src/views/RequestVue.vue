<script>
import Header from '@/components/header.vue';
import Notification from '@/components/notification';
import RequestComponent from '@/components/requestComponent.vue';

export default {
  name: 'RequestVue',
  components: {
    Header,
    Notification,
    RequestComponent
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<template>
    <div class="backgroundColor"></div>
    <Header />
    <RequestComponent />
    <Notification />
</template>

<style lang="scss">
.home {
  width: 100%;
  height: 80%;
  justify-content: space-evenly;
  flex-direction: column;
  align-items: center;

  * {
    height: max-content;
  }

  &__btnContainer {
    width: 100vw;
    justify-content: space-evenly;
  }

  .greetings, &__mainTitle {
    font-family: 'Lobster Two', cursive;
  }

  .greetings {
    font-size: 2.5em;
  }

  &__mainTitle {
    font-size: 2em;
    margin-top: 0;
  }

  &__title {
    font-size: 1.2em;
  }
}
</style>
