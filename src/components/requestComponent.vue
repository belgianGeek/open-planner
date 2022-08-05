<script>
import LocationOption from './locationOption.vue';
import axios from 'axios';
import router from '../router';

export default {
  name: 'RequestComponent',
  props: {
    isSearchPage: Boolean
  },
  components: {
    LocationOption
  },
  data() {
    return {
      form: {
        applicant_firstname: this.$store.state.connectedUser.firstname,
        applicant_name: this.$store.state.connectedUser.name,
        attachment: false,
        attachment_src: '',
        location_fk: this.$store.state.connectedUser.location_fk,
        comment: '',
        request_date: '',
        status: '',
        user_fk: Number
      },
      sendattachment: true,
      users: []
    }
  },
  methods: {
    async getUsers() {
      this.users = await axios.get(`http://${window.location.hostname}:3000/users`);
    },
    sendRequest() {
      // Check if the request is made from th search page
      if (!this.isSearchPage) {
        delete this.form.user_fk;
      }

      axios.post(`http://${window.location.hostname}:3000/new-request`, this.form)
      .then(res => {
        if (res.status === 200) {
          router.push('/request-success');
        } else {
          console.error('POST request error :-(( : ', err);
        }
      })
      .catch(err => console.error(err));
    },
    setDate() {
      const setDay = date => {
        if (date.getDate() < 10) {
          return `0${date.getDate()}`;
        } else {
          return date.getDate();
        }
      }

      const setMonth = date => {
        if (date.getMonth() < 9) {
          return `0${date.getMonth() + 1}`;
        } else {
          return date.getMonth() + 1;
        }
      }

      this.form.request_date = `${new Date().getFullYear()}-${setMonth(new Date())}-${setDay(new Date())}`;
    }
  },
  beforeMount() {
    this.setDate();
    this.getUsers();
  }
}
</script>

<template>
<section class="inRequests inRequests__step1 flex">
  <span class="inRequests__id hidden">ID</span>
  <form class="inRequests__form flex" action="/new-request" method="post" enctype="multipart/form.data" @submit.prevent="sendRequest()">
    <h2 class="title">
      {{ $t('request.applicant_title') }}
    </h2>
    <span class="inRequests__form__applicantInfo flex">
      <!-- <label class="<% if (!isSearchPage) { %> flex <% } else { %> hidden <% } %>"> -->
      <label class="flex">
        {{ $t('request.location_title') }}
        <select class="inRequests__form__applicantInfo__location input" v-model="form.location_fk" required="true">
          <option value="default">{{ $t('request.location_default') }}</option>
          <LocationOption />
        </select>
      </label>
      <label class="flex">
        {{ $t('request.applicant_name') }}
        <input class="inRequests__form__applicantInfo__name input" type="text" v-model="form.applicant_name" placeholder="{{ $t('request.applicant_name') }}..." required="true">
      </label>
      <label class="flex">
        {{ $t('request.applicant_firstname') }}
        <input class="inRequests__form__applicantInfo__firstname input" type="text" v-model="form.applicant_firstname" placeholder="'{{ $t('request.applicant_firstname') }}..." required="true">
      </label>
    </span>
    <span class="inRequests__form__requestInfo flex">
      <span class="inRequests__form__requestInfo__row1 flex">
        <!-- <% if (isSearchPage) { %> -->
        <label class="flex">
          {{ $t('request.status') }}
          <select class="inRequests__form__requestInfo__row1__status input" type="text" v-model="form.status" placeholder="{{ $t('request.status_placeholder') }}..." required="true">
            <option value="waiting">{{ $t('request.status_waiting') }}</option>
            <option value="wip">{{ $t('request.status_inProgress') }}</option>
            <option value="done">{{ $t('request.status_done') }}</option>
          </select>
        </label>
        <label class="flex" v-if="this.isSearchPage">
          {{ $t('request.assignedWorker') }}
          <select class="inRequests__form__requestInfo__row1__assignedWorker input" v-model="form.user_fk" required="true">
            <option value="default">{{ $t('request.assignedWorker_default') }}</option>
            <option v-for="user in users.data" :key="user.user_id" :value="user.user_id">
              {{ user.name.toUpperCase()  }}, {{ user.firstname }}
            </option>
          </select>
        </label>
        <!-- <% } %> -->
        <label class="flex">
          {{ $t('request.date') }}
          <input class="inRequests__form__requestInfo__row1__requestDate input" v-model="form.request_date" type="date" required="true">
        </label>
        <!-- <% if (!isSearchPage && sendAttachments) { %> -->
        <label class="flex">
          {{ $t('request.attachment') }}
          <input class="inRequests__form__requestInfo__row1__file input" v-bind:src="form.attachment_src" type="file" accept="image/*">
        </label>
      </span>
      <h2 class="title">
        {{ $t('request.subject') }}
      </h2>
      <textarea class="inRequests__form__requestInfo__comment flex" v-model="form.comment" rows="8" cols="80" placeholder="{{ $t('request.subject_placeholder') }}"></textarea>
    </span>
    <span class="inRequests__form__btnContainer flex">
      <button class="inRequests__form__btnContainer__reset btn btn--reset" type="reset">{{ $t('form.reset_generic') }}</button>
      <button class="inRequests__form__btnContainer__submit inRequests__step1__btn btn btn--submit" type="submit">{{ $t('form.submit_generic') }}')</button>
      <!-- <% if (isSearchPage) { %>
      <button class="inRequests__form__btnContainer__hide inRequests__step1__btn btn home-btn flex" type="button">{{ $t('form.back_results') </button>
      <% } %> -->
    </span>
  </form>
  <!-- Only hide the image tag to avoid errors when loading tasks containing attachments -->
  <img v-if="sendattachment" :src="form.attachment_src || '/img/empty.svg'" alt="{{ $t('request.attachment_alt') ">
</section>
</template>

<style lang="scss">
.inRequests {
    padding-left: 6em;
    width: 100%;

    &.absolute {
        .inRequests__form {
            font-size: 0.9em;
            flex-direction: column;
            width: 60%;
            max-height: 80vh;
            flex: 2;
            overflow: auto;
            align-self: baseline;

            &__applicantInfo,
            &__requestInfo__row1 {
                justify-content: space-around;
            }
        }
    }

    &__step1 {
        justify-content: space-around;
        // @include simple-step();

        img {
            object-fit: contain;
            padding: 0 1.5em;
            flex: 1;
        }
    }

    &__title {
        text-decoration: underline;
        font-size: 1.3em;
        width: 100vw;
        text-align: center;
    }

    &__form {
        font-size: 1.05em;
        flex-direction: column;
        width: 60%;
        max-height: 80vh;
        flex: 2;

        label {
            align-self: center;
            flex-direction: column;
            align-items: center;
            font-size: 1em;
        }

        .title {
            padding: 0.5em 0;
            font-size: 1em;
        }

        &__applicantInfo,
        &__requestInfo,
        &_btnContainer {
            justify-content: space-between;
            width: 100%;
            flex-wrap: wrap;
        }

        &__btnContainer {
            margin-top: 2em;
            width: 100%;
            align-self: center;
            justify-content: space-evenly;
            padding-bottom: 2em;

            &__hide {
                margin: 0;
            }
        }

        &__applicantInfo {
            align-items: center;

            &__container {
                flex-direction: column;

                &__autocomplete {
                    // @include autocomplete;
                }
            }
        }

        &__requestInfo {
            flex-direction: column;

            &__row1 {
                justify-content: space-between;
                margin-top: 1em;
                align-items: baseline;
            }

            &__comment {
                @include textarea();
            }
        }

        &__applicantInfo,
        &__requestInfo {
            &__container,
            &__mail {
                width: 45%;
            }
        }
    }
}
</style>
