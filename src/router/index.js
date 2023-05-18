import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import RequestVue from "../views/RequestVue.vue";
import axios from "axios";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/about",
      name: "About",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/About.vue"),
    },
    {
      path: "/locations",
      name: "locations.manage",
      component: () => import("../views/LocationsManagement.vue"),
      props: true,
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/new-request",
      name: "home.new_request",
      component: RequestVue,
    },
    {
      path: "/request-success",
      name: "request-success",
      component: () => import("../views/RequestSuccess.vue"),
    },
    {
      path: "/users",
      name: "users.manage",
      component: () => import("../views/UsersManagement.vue"),
      props: true,
    },
    {
      path: "/user/:id",
      name: "users.details",
      component: () => import("../views/UserDetail.vue"),
    },
  ],
});

export default router;

router.beforeEach(async (start, destination) => {
  if (start.name === "Login") {
    try {
      const checkToken = await axios.post(
        `http://${window.location.hostname}:3000/api/checkAuth`,
        {
          token: localStorage.getItem("planner_authToken")
        }
      );

      if (checkToken.data === 'Token verification succeeded') {
        router.push('/');
      }
    } catch (err) {
      console.log(`Token verification failed : ${err}`);
    }
  }
});
