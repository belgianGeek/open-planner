<script>
import router from '../router';

  export default {
    name: 'RequestSuccess',
    data() {
      return {
        timer: null
      }
    },
    methods: {
      cancelTimeout() {
        clearTimeout(this.timer);
      },
      redirectToHomePage() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          router.push('/');
        }, 1000 * 5);
      }
    },
    mounted() {
      this.redirectToHomePage();
    }
  };

</script>

<template>
  <div class="confirmation__body flex">
    <img src="/img/homer.png" :alt="$t('confirmation.img_alt')">
    <article>
      <p class="confirmation__body__msg">{{ $t('confirmation.body_msg') }}</p>
      <p class="confirmation__body__comment">{{ $t('confirmation.body_comment') }}</p>
      <router-link
        to="/new-request"
        class="confirmation__body__cancel"
        @click="cancelTimeout"
      >{{ $t('confirmation.body_cancel') }}</router-link>
    </article>
  </div>
</template>

<style lang="scss">
.confirmation {
  &__body {
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
    font-size: 1.3em;

    article {
      text-align: center;
    }

    &__cancel {
      text-decoration: underline;
      font-style: italic;
      cursor: pointer;
    }
  }
}
</style>
