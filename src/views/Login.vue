<script>
// import axios from 'axios';
import LocaleSwitcher from '@/components/localeSwitcher';
// import router from '../router';

export default {
  name: 'Login',
  components: {
    LocaleSwitcher
  },
  data() {
    return {
      socket: {},
      email: '',
      loginError: '',
      password: ''
    }
  },
  methods: {
    login(event) {
      // const displayLoginError = err => {
      //   this.loginError = err;
      // };

      this.sendMessage(JSON.stringify({
          message: "Hello there !",
          email: this.email,
          password: this.password
        }));

      event.preventDefault();
      // axios.post('http://localhost:3000/login', {
      //     email: this.email,
      //     password: this.password
      //   })
      //   .then(res => {
      //     if (res.data.user) {
      //       this.$store.commit('RETRIEVE_USER_DATA', res.data.user);
      //       router.push('/');
      //     } else {
      //       displayLoginError(res.data.info.message);
      //     }
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     router.push('/login');
      //   })
    },
    waitForOpenConnection: function() {
        // We use this to measure how many times we have tried to connect to the websocket server
        // If it fails, it throws an error.
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 10
            const intervalTime = 200

            let currentAttempt = 0
            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval)
                    reject(new Error('Maximum number of attempts exceeded.'));
                } else if (this.socket.readyState === this.socket.OPEN) {
                    clearInterval(interval)
                    resolve()
                }
                currentAttempt++
            }, intervalTime)
        })
    },
    sendMessage: async function(message) {
        // We use a custom send message function, so that we can maintain reliable connection with the
        // websocket server.
        if (this.socket.readyState !== this.socket.OPEN) {
            try {
                await this.waitForOpenConnection(this.socket)
                this.socket.send(message)
            } catch (err) { console.error(err) }
        } else {
            this.socket.send(message)
        }
    }
  },
  async mounted() {
    // Calculate the URL for the websocket. If you have a fixed URL, then you can remove all this and simply put in
    // ws://your-url-here.com or wss:// for secure websockets.
    const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
    const port = ':3000';
    const echoSocketUrl = socketProtocol + '//' + window.location.hostname + port + '/login'

    // Define socket and attach it to our data object
    this.socket = await new WebSocket(echoSocketUrl);

    // When it opens, console log that it has opened. and send a message to the server to let it know we exist
    this.socket.onopen = () => {
      console.log('Websocket connected.');
      this.connectedStatus = 'Connected';
      this.socket.send('connection');
    }

    // When we receive a message from the server, we can capture it here in the onmessage event.
    this.socket.onmessage = (event) => {
      // We can parse the data we know to be JSON, and then check it for data attributes
      let parsedMessage = JSON.parse(event.data);
      // If those data attributes exist, we can then console log or show data to the user on their web page.
      console.log(parsedMessage);
      if (typeof parsedMessage.message !== "undefined" && parsedMessage.message == "hello") {
        this.message = parsedMessage.message;
        console.log('We have received a message from the server!')
      }
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
    <p class="warning" v-if="loginError !== ''">{{ loginError }}</p>
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
