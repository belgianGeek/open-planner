<script>
import Sidebar from '@/components/sidebar.vue';

export default {
  name: 'Header',
  components: {
    Sidebar
  }
}
</script>

<template>
<header class="header">
  <span class="header__container flex">
    <img class="header__container__icon returnIcon hidden" alt="header_icon_alt')" title="header_icon_alt" src="/img/return.svg">
    <span class="header__container__msg hidden">header_icon_alt</span>
  </span>
  <Sidebar />
</header>
</template>

<style lang="scss">
.header {
    position: fixed;
    top: 0;
    left: 0;
    height: 10vh;
    @include align(space-between, center);
    z-index: 2;

    &__container {
        align-items: center;
        position: sticky;
        top: 0.55em;
        left: 7em;
        font-size: 1em;
        padding: 0.5em;
        border-radius: 0.5em;
        background-color: rgba(0, 0, 0, 0.8);
        @include box-shadow;
        align-self: flex-start;

        &__icon {
            margin-right: 1.5em;
            cursor: pointer;
        }
    }
}
</style>
