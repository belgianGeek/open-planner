<template>
  <div class="card mt-3">
      <div class="card-body">
          <div class="card-title">
              <h3>Chat Group</h3>
              <hr>
          </div>
          <div class="card-body">
              <div class="messages" v-for="(msg, index) in messages" :key="index">
                  <p><span class="font-weight-bold">{{ msg.user }}: </span>{{ msg.message }}</p>
              </div>
          </div>
      </div>
      <div class="card-footer">
          <form @submit.prevent="sendMessage">
              <div class="gorm-group">
                  <label for="user">User:</label>
                  <input type="text" v-model="user" class="form-control">
              </div>
              <div class="gorm-group pb-3">
                  <label for="message">Message:</label>
                  <input type="text" v-model="message" class="form-control">
              </div>
              <button type="submit" class="btn btn-success">Send</button>
          </form>
      </div>
  </div>
</template>

<script>
// import socket from "socket.io-client/dist/socket.io.js";
import { io } from "socket.io-client";

const socket = io("ws://localhost:3000/", {});

socket.on("connect", () => {
  console.log(`connect ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log("disconnect");
});
export default {
    data() {
        return {
            user: '',
            message: '',
            messages: [],
            // io : new socket({
            //   connection: 'http://localhost:3000'
            // })
        }
    },
    methods: {
        sendMessage(e) {
            e.preventDefault();

            // this.io.emit('SEND_MESSAGE', {
            //     user: this.user,
            //     message: this.message
            // });
            // this.message = ''
        }
    },
    mounted() {
        // console.log(this.io);
    }
}
</script>

<style>
</style>
