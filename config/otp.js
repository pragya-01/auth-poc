
const axios = require('axios');
const express = require('express');

async function makePostRequest() {

    let payload = { email: "i@gmail.com", type: "VERIFICATION" };
    let res = await axios.post('http://node-otp-service.herokuapp.com/api/v1/email/otp', payload);

    let data = res.data;
    //console.log(data);
    return data;

}
let ver_key;
let data = makePostRequest();
//console.log(data);
data.then( res => {
    console.log(res.Details);
})

