<script>
// import axios from 'axios';

export default {
  name: 'Export',
  data() {
    return {}
  },
  methods: {}
}
</script>

<template>
<!-- <% if (user.type !== 'guest') { %> -->
<span class="export hidden">
  <span class="export__child flex">
    <h2 class="export__child__title title">export.title</h2>
    <section class="export__child__container flex">
      <form class="export__child__container__format flex">
        <h3 class="title">Format</h3>
        <label class="export__child__container__format__csv">
          <input class="export__child__container__format__csv__input input radio" name="DBformat" type="radio" value="csv">
          export.csv
        </label>
        <label class="export__child__container__format__pgsql">
          <input class="export__child__container__format__pgsql__input input radio" name="DBformat" type="radio" value="pgsql">
          export.postgres
        </label>
      </form>
      <span class="export__child__container__btnContainer flex">
        <button class="export__child__container__btnContainer__btn btn btn--submit" type="button">export.btn</button>
        <button class="export__child__container__btnContainer__btn btn btn--reset" type="button">form.cancel_generic</button>
      </span>
    </section>
  </span>
</span>
<span class="import hidden">
  <span class="import__child flex">
    <h2 class="import__child__title title">import.title</h2>
    <section class="import__child__container flex">
      <form action="/upload" method="post" class="import__child__container__file flex" enctype="multipart/form.data">
        <label class="import__child__container__file__upload">
          import.select_file :
          <input class="import__child__container__file__upload__input input" name="dataUpload" type="file">
          import.template_01 <a href="/template">import.template_02</a>
        </label>
        <span class="import__child__container__notification flex"></span>
        <span class="import__child__container__btnContainer flex">
          <button class="import__child__container__btnContainer__btn btn btn--submit" type="submit">import.btn</button>
          <button class="import__child__container__btnContainer__btn btn btn--reset" type="button">form.cancel_generic</button>
        </span>
      </form>
    </section>
  </span>
</span>
</template>

<style lang="scss">
.export,
.import {
  &__child {
    width: 50%;
    height: 50%;
    background: rgba(0,0,0,0.8);
    flex-direction: column;
    border-radius: 0.5em;
    @include box-shadow;

    &__title {
      text-align: center;
      font-size: 1.1em;
    }

    &__container {
      flex: 1;
      justify-content: center;
      flex-direction: column;

      &__btnContainer {
        width: 100%;
        align-self: flex-end;
        justify-content: space-evenly;
        align-items: flex-end;
        padding-bottom: 1em;

        &__btn {
          margin-top: 0;
        }
      }
    }
  }
}

.export {
  &__child {
    &__container {
      &__format {
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 0 2em;
        font-size: 1em;

        &__csv,
        &__pgsql {
          align-items: center;

          &__input {
            margin-right: 0.5em;
          }
        }
      }
    }
  }
}

.import {
  &__child {
    &__container {
      &__file {
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 0 2em;
        font-size: 1em;
        justify-content: space-evenly;
        align-items: center;

        &__upload {
          align-items: center;

          &__input {
            margin-right: 0.5em;
          }
        }
      }

      &__notification {
        width: max-content;
        padding: 1em;
        border-radius: 0.5em;
        font-style: italic;

        &.notificationFailure,
        &.notificationSuccess {
          animation: fade 3000ms 3000ms both;
        }

        &.notificationFailure {
          background-color: red;
          color: black;
        }

        &.notificationSuccess {
          background-color: lightgreen;
          color: darkgreen;
        }
      }
    }
  }
}
</style>
