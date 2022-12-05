<script>
  export default {
    name 'UserDetail',
    data() {
      return {
        user_id: '',
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
        axios.get(`http://${window.location.hostname}:3000/user/3`)
          .then(userDetails => {
            this.user_id = userDetails.user_id;
            this.userName = userDetails.name;
            this.userFirstname = userDetails.firstname;
            this.userGender = userDetails.gender;
            this.userType = userDetails.type;
            this.userMail = userDetails.mail;
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
