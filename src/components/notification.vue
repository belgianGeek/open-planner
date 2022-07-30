<script>
export default {
  name: 'Notification',
  data() {
    return {}
  },
  methods: {}
}
</script>

<template>
<span class="notification hidden">
  <img class="notification__icon" src="/img/thumbs-up.svg" alt="Notification icon">
  <p class="notification__msg"></p>
</span>
</template>

<style lang="scss">
.notification {
    position: absolute;
    top: 80%;
    right: -60vw;
    border-radius: 0.5em;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    padding: 0.5em;
    z-index: 5;

    &__msg {
        margin-left: 1em;
    }
}

.notification.flex {
    animation: slide 5s cubic-bezier(0,.53,0,.98);
}

.notificationInfo {
    background-color: $electric-blue;
}

.notificationSuccess {
    background-color: $green;
}

.notificationFailure {
    background-color: $red;
}

.notificationMail {
    background-color: $orange;
}
</style>
