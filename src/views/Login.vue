<script>
import LocaleSwitcher from '@/components/localeSwitcher';

export default {
  name: 'Login',
  components: {
    LocaleSwitcher
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<template>
<header class="loginHeader flex">
  <LocaleSwitcher />
</header>
<main class="wrapper loginWrapper flex">
  <h1 class="title home__mainTitle">instanceName</h1>
  <form class="login flex" action="/login" method="post">
    <h1 class="title home__mainTitle">login.title</h1>
    <label class="flex">
      login.mail
      <input class="input" type="email" name="email" placeholder="login.mail" required>
    </label>
    <label class="flex">
      login.passwd
      <input class="input" type="password" name="password" placeholder="form.passwd_generic" required>
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
