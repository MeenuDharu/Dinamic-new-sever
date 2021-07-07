const mongoose = require('mongoose');
const router = require('express').Router();
var twilio = require('twilio');

const accountSid = 'AC432b056685d8eebb8759dcae8572a37b'; // Your Account SID from www.twilio.com/console
const authToken = 'ed3a6c7d651be2926df91f8e8333a1d5';   // Your Auth Token from www.twilio.com/console

router.post("/twilio", function(req, res) {

    var client = new twilio(accountSid, authToken);

    // client.incomingPhoneNumbers
    // .create({
    //    phoneNumber: '+15005550006',
    //    voiceUrl: 'http://demo.twilio.com/docs/voice.xml'
    //  })
    // .then(incoming_phone_number => console.log(incoming_phone_number.phoneNumber));

    client.calls
      .create({
         url: 'http://demo.twilio.com/docs/voice.xml',
         to: '+919677838548',
         from: '+15005550006'
       })
      .then(call => console.log(call.sid));

});

module.exports = router;