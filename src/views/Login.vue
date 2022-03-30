<script>
import axios from 'axios';
import LocaleSwitcher from '@/components/localeSwitcher';
import router from '../router';

export default {
  name: 'Login',
  components: {
    LocaleSwitcher
  },
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login(event) {
      event.preventDefault();
      axios.post('http://localhost:3000/login', {
        email: this.email,
        password: this.password
      })
        .then(res => {
          console.log(res.data);
          this.$store.commit('RETRIEVE_USER_DATA', res.data.user);
          router.push('/');
        })
        .catch(err => {
          console.log(err);
          router.push('/login');
        })
    }
  }
}
</script>

<template>
<header class="loginHeader flex">
  <LocaleSwitcher />
</header>
<main class="wrapper loginWrapper flex">
  <h1 class="title home__mainTitle">instanceName</h1>
  <form class="login flex" @submit="login">
    <h1 class="title home__mainTitle">login.title</h1>
    <label class="flex">
      login.mail
      <input v-model="email" class="input" type="email" name="email" placeholder="login.mail" required>
    </label>
    <label class="flex">
      login.passwd
      <input v-model="password" class="input" type="password" name="password" placeholder="form.passwd_generic" required>
    </label>
    <button class="btn home-btn" type="submit">login.btn</button>
    <!-- if (typeof messages != 'undefined' && messages.error) {
      <p class="warning">messages.error</p>
      } -->
  </form>
</main>
</template>

<style lang="scss" media="screen">
.login {
    flex-direction: column;
    border-radius: 0.5em;
    background-color: $translucent-black;
    padding: 2em;
    width: 30%;
    align-items: center;
    justify-content: space-between;
    min-height: 40vh;
    @include box-shadow;

    label {
        width: 100%;
        justify-content: space-between;
        align-items: baseline;

        .input {
            width: 60%;
        }
    }
}

.loginHeader {
    position: absolute;
    bottom: 0.7em;
    right: 2vw;
    font-size: 1em;
    width: 12em;
}
</style>
