<script>
import axios from 'axios';
import Header from '@/components/header.vue';
import Notification from '@/components/notification.vue';

export default {
  name: 'UsersManagement',
  components: {
    Header,
    Notification
  },
  data() {
    return {
    userContainerHeaders: [],
      users: []
    }
  },
  methods: {
    getHeaderTitles() {
      for (const column of Object.keys(this.users.data[0])) {
          switch (column) {
            case 'name':
              this.userContainerHeaders.push(this.$t('form.name_generic'));
              break;
            case 'firstname':
              this.userContainerHeaders.push(this.$t('form.firstname_generic'));
              break;
            case 'email':
              this.userContainerHeaders.push(this.$t('form.mail_generic'));
              break;
            case 'location':
              this.userContainerHeaders.push(this.$t('form.location_generic'));
              break;
            case 'password':
              this.userContainerHeaders.push(this.$t('login.passwd'));
              break;
            case 'type':
              this.userContainerHeaders.push(this.$t('register.account_type'));
              break;
        }
      }
    },
    getUserType() {
      for (const user of this.users.data) {
        switch (user.type) {
          case 'guest':
            user.type = this.$t('account_type.guest');
            break;
          case 'user':
            user.type = this.$t('account_type.user');
            break;
          case 'admin':
            user.type = this.$t('account_type.admin');
            break;
          default:
            user.type;
        }
      }
    },
    async refreshUsersList() {
      this.users = await axios.get(`http://${window.location.hostname}:3000/users`);
      this.getUserType();
      this.getHeaderTitles();
    }
  },
  beforeMount() {
    this.refreshUsersList();
  }
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
  <span class="users__container">
    <span class="users__container__header flex">
      <span
        v-for="header in userContainerHeaders"
        :class="[header.match('mail') ? 'flex2' : '']"
        class="users__container__header__item">{{ $t(header) }}</span>
    </span>
    <span v-for="(user, index) in users.data" class="flex users__container__row" :class="'users__container__row--' + index">
      <span class="users__container__row__item users__container__row__item--id hidden">{{ user.user_id }}</span>
      <span class="users__container__row__item users__container__row__item--name">{{ user.name.replace(/\'\'/g, "'") }}</span>
      <span class="users__container__row__item users__container__row__item--firstname"> {{ user.firstname.replace(/\'\'/g, "'") }}</span>
      <a
        :href="'mailto:' + user.email"
        class="users__container__row__item users__container__row__item--email flex2">{{ user.email }}</a>
      <span class="users__container__row__item users__container__row__item--location">{{ user.location_name !== null ? user.location_name : 'Aucune' }}</span>
      <span class="users__container__row__item users__container__row__item--type">{{ user.type }}</span>
    </span>
  </span>
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
