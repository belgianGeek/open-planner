<script>
import axios from 'axios';

  export default {
    name: 'UserDetail',
    data() {
      return {
        user_id: this.$route.params.id,
        username: '',
        userFirstname: '',
        userGender: '',
        userType: '',
        userMail: ''
      }
    },
    methods: {
      getUserDetails() {
        // TODO: Add user ID variable
        axios.get(`http://${window.location.hostname}:3000/user/${this.user_id}`)
          .then(userDetails => {
            console.log(userDetails);
            this.userName = userDetails.data[0].name;
            this.userFirstname = userDetails.data[0].firstname;
            this.userGender = userDetails.data[0].gender;
            this.userType = userDetails.data[0].type;
            this.userMail = userDetails.data[0].email;
          })
          .catch(err => console.trace(err));
      }
    },
    mounted() {
      this.getUserDetails();
    }
  }
</script>

<template>
  <span>User ID : {{ this.user_id }}</span>
  <span>Username : {{ this.userName }}</span>
  <span>User firstname : {{ this.userFirstname }}</span>
  <span>User mail address : {{ this.userMail }}</span>
  <span>User gender : {{ this.userGender }}</span>
  <span>User role : {{ this.userType }}</span>
</template>
