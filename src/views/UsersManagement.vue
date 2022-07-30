<script>
import Header from '@/components/header.vue';
import Notification from '@/components/notification.vue';

export default {
  name: 'UsersManagement',
  components: {
    Header,
    Notification
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
<Notification />
<section class="flex users">
  <span class="flex users__header">
    <h2 class="title users__header__title">{{ $t('users.subject') }}</h2>
    <button class="btn home-btn users__header__addBtn" type="button">{{ $t('users.add_title') }}</button>
  </span>
  <span class="users__container"></span>
</section>
</template>

<style lang="scss">
.users {
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
