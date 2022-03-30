<script>
import Export from '@/components/exportComponent';
import Header from '@/components/header.vue';
import Notification from '@/components/notification';
import router from '../router';

export default {
  name: 'Home',
  components: {
    Export,
    Header,
    Notification
  },
  beforeMount() {
    if (this.$store.state.connectedUser.user_id === undefined) {
      router.push('/login');
    }
  },
  computed: {},
  data() {
    return {}
  },
  methods: {},
  mounted() {}
}
</script>

<template>
<div class="backgroundColor"></div>
<Header />
<main class="wrapper flex">
  <section class="home flex">
    <h1 class="home__mainTitle">instanceName</h1>
    <p class="greetings">{{ $t('greetings') }} {{ this.$store.state.connectedUser.firstname }} !</p>
    <h2 class="home__title title">{{ $t('home.call_to_action') }}</h2>
    <span class="home__btnContainer flex">
      <router-link to="/new-request" class="home__btnContainer__newRequest btn home-btn">{{ $t('home.new_request') }}</router-link>
      <button class="home__btnContainer__search btn home-btn" type="button" name="button">
        <a href="/search">{{ $t('home.show_requests') }}</a>
      </button>
    </span>
  </section>
  <!-- <% if (user.type === 'admin') { %>
        <%- include('users', {
          classname: 'users',
          subject: __('users.subject'),
          title: __('users.add_title')
        }); %>
        <%- include('users', {
          classname: 'locations',
          subject: __('locations.subject'),
          title: __('locations.add_title')
        }); %>
        <%- include('register', {
          registerClass: 'hidden',
          locations: locations
        }); %>
        <%- include('addLocation'); %>
      <% } %> -->
</main>
<Notification />
<Export />
<!-- <%- include('settings'); %>
    <% } %>
    <% if (user.type !== 'admin' && allowPasswordUpdate) { %>
      <%- include('register', {
        registerClass: 'hidden',
        locations: locations
      }); %>
    <% } %>
    <%- include('about'); %>
    <%- include('contextMenu'); %>
    <%- include('confirmation'); %>
    <%- include('scripts'); %> -->
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

        a {
            text-decoration: none;
        }
    }

    &__mainTitle,
    .greetings {
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
