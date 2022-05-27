<script>
import axios from 'axios';
import LocaleSwitcher from '@/components/localeSwitcher.vue';
import router from '../router';

export default {
  name: 'Sidebar',
  components: {
    LocaleSwitcher
  },
  methods: {
    logout() {
      axios.delete('http://localhost:3000/logout')
        .then(() => {
          console.log('Bye !');
          router.push('/login');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}
</script>

<template>
<span class="header__menu">
  <nav class="menu flex">
    <label class="menu__label">Menu</label>
    <hr>
    <!-- <% if (!isSearchPage) { %> -->
    <span class="menu__item searchLink flex">
      <a class="flex" href="/search?lang=lang" rel="noreferrer">
        <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="arcs">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="arcs">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p class="menu__item__legend hide">{{ $t('sidebar.search') }}</p>
      </a>
    </span>
    <!-- <% if (allowPasswordUpdate && user.type !== 'admin') { %> -->
    <span class="menu__item accountLink flex">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f8f4f4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f8f4f4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <p class="menu__item__legend hide">{{ $t('sidebar.account') }}</p>
    </span>
    <!-- <% } %>
      <% if (user.type !== 'guest') { %> -->
    <span class="menu__item exportsLink flex">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21" />
        <path d="M16 16l-4-4-4 4" />
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21" />
        <path d="M16 16l-4-4-4 4" />
      </svg>
      <p class="menu__item__legend hide">{{ $t('sidebar.export') }}</p>
    </span>
    <!-- <% } %>
      <% if (user.type === 'admin') { %> -->
    <span class="menu__item importLink flex">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8M12 19.8V12M16 17l-4 4-4-4" />
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8M12 19.8V12M16 17l-4 4-4-4" />
      </svg>
      <p class="menu__item__legend hide">{{ $t('sidebar.import_users') }}</p>
    </span>
    <span class="menu__item usersLink flex">
      <router-link to="/users">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      <p class="menu__item__legend hide">{{ $t('sidebar.manage_users') }}</p>
      </router-link>
    </span>
    <span class="menu__item locationsLink flex">
      <router-link to="/locations">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
      </svg>
      <p class="menu__item__legend hide">{{ $t('sidebar.manage_locations') }}</p>
      </router-link>
    </span>
    <span class="menu__item settingsLink flex">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f8f4f4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
        </path>
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f8f4f4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
        </path>
      </svg>
      <p class="menu__item__legend hide">{{ $t('settings.title') }}</p>
    </span>
    <!-- <% } %>
      <% } else { %> -->
    <span class="menu__item homeLink flex">
      <a class="flex" href="/?lang=lang" rel="noreferrer">
        <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
          <path d="M9 22V12h6v10M2 10.6L12 2l10 8.6" />
        </svg>
        <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
          <path d="M9 22V12h6v10M2 10.6L12 2l10 8.6" />
        </svg>
        <p class="menu__item__legend hide">{{ $t('sidebar.home') }}</p>
      </a>
    </span>
    <!-- <% } %> -->
    <span class="menu__item aboutLink flex">
      <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <p class="menu__item__legend hide">{{ $t('sidebar.about') }}</p>
    </span>
    <span class="menu__item logoutLink flex">
      <form class="logoutLink__form flex" action="http://localhost:3000/logout" method="post" @submit.prevent="logout()">
        <svg class="menu__item__icon shown" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9" />
        </svg>
        <svg class="menu__item__icon hide" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9" />
        </svg>
        <button class="menu__item__legend btn hide" type="submit">{{ $t('sidebar.log_out') }}</button>
      </form>
    </span>
    <label class="lang flex">
      {{ $t('sidebar.lang_title') }}
      <hr>
      <span class="lang__container flex">
        <LocaleSwitcher />
      </span>
    </label>
  </nav>
</span>
</template>

<style lang="scss">
.header {
    svg {
        cursor: pointer;
    }

    &__menu,
    .menu {
        position: absolute;
        height: 100vh;
        width: 4em;
        top: 0;
        left: 0;
        z-index: 1;
    }

    &__menu {
        cursor: pointer;
    }

    .menu {
        background-color: opacify($translucent-black, 0.3);
        background-color: black;
        padding: 0 1em;
        flex-direction: column;
        box-sizing: content-box;
        @include align(flex-start, center);
        @include box-shadow;
        overflow-y: auto;

        .hide {
            opacity: 0;
            width: 0;
        }

        .lang {
            flex-direction: column;
            position: relative;
            top: 2em;

            &__container {
                justify-content: space-between;
                font-size: 3.5em;
                flex-direction: column;
            }
        }

        &:hover {
            width: 22em;
            transition: width 250ms ease-in-out;

            ol {
                display: flex;
            }

            .shown {
                opacity: 0;
                width: 0;
            }

            .hide {
                opacity: 1;
                transition: opacity 400ms ease-in-out;
            }

            button,
            p.hide {
                font-size: inherit;
            }

            p.hide {
                width: 70%;
            }

            svg.hide {
                width: 30%;
            }

            .lang__container {
                flex-direction: row;
                width: 50%;
            }
        }

        form {
            width: 100%;
        }

        hr {
            width: 80%;
        }

        &__item {
            .test {
                opacity: 0;
            }

            padding: 0.5em 0;
            margin: 0.5em;

            button,
            p {
                width: 0;
                font-size: 0;
            }
        }

        &__item,
        &__item a,
        .lang {
            text-decoration: none;
            font-size: 1em;
            width: 100%;
            @include align(flex-start, center);
            box-sizing: border-box;
        }

        &__item,
        &__item li {
            cursor: pointer;

            &__icon {
                width: 100%;
            }

            &__legend {
                &.btn {
                    padding: 0;
                    background: none;
                    width: auto;
                }
            }
        }

        &__item.searchLink {
            a {
                font-size: 1em;
                text-decoration: none;
                padding: 0;
                margin: 0;
            }
        }

        &__item.settingsLink {
            &:hover {
                svg {
                    transform: rotate(-360deg);
                    transition: transform 1500ms;
                }
            }
        }

        &__label {
            padding-top: 1em;
            font-size: 1em;
        }
    }
}
</style>
