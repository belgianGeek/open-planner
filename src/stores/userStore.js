import { defineStore } from 'pinia';

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export default defineStore('user', {
  state: () => ({
    connectedUser: {}
  }),
  getters: {
    getUserData: (state, payload) => {
      state.connectedUser = payload;
    }
  }
});

// export default createStore({
//   state: {
//     connectedUser: {},
//     date: new Date().toISOString().substr(0,10)
//   },
//   mutations: {
//     RETRIEVE_USER_DATA(state, payload) {
//       state.connectedUser = payload;
//     }
//   },
//   actions: {
//   },
//   modules: {
//   }
// })
