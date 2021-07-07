

const mongoose = require('mongoose');
var request = require('request');
const router = require('express').Router();
const emailexistence = require("email-existence");
// const verifier = require('email-verify');
// const infoCodes = verifier.infoCodes;
const bcrypt = require("bcrypt-nodejs");
const saltRounds = bcrypt.genSaltSync(10);
const userList = require("../../models/user");
const tableMetadata = require("../../models/table_metadata");
const mailService = require("../../services/mail");
const valet = require('../../models/valet');
var moment = require('moment');
const table = require("../../models/table");
const gateway = require("../../models/pay_gateway_details");
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = [
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.google.com/m8/feeds',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
];
// const SCOPES = [
//     'https://www.googleapis.com/auth/user.emails.read',
//     'https://www.googleapis.com/auth/user.phonenumbers.read',
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile'
// ];
// const TOKEN_PATH = 'token.json';

//Google oAuth credentials

const CLIENT_ID = '94459536193-f5inpoca49ka15f2fnl3df77u2ki45ms.apps.googleusercontent.com';
const CLIENT_SECRET = '41hfLZy2gp3AdkqKRPbWwPlf';
const REDIRECT_URI = 'http://localhost:4200/social/authentication';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);

const Razorpay = require('razorpay');

//Google oAuth credentials


// social login - Google people API
router.post("/loginWithGoogle", (req,resp) => {    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      resp.json({ authUrl: authUrl, oAuth: oAuth2Client});     

})

router.post("/check_mobile_social_login", (req, res) => {

    let email = req.body.email;

    console.log('body....', req.body);

    userList.findOne({email:email, company_id:req.body.company_id}, function(err, response){
        if(!err && response){ 
            console.log("response mob ", response)
            res.json({ status: true, data:response, message:'Emailid already Exist.'  });
           
        }else{
            console.log("response mob err", response)
            res.json({ status: false, message: "not exist" });
        }
    })

});


router.post("/check_mobile_login", (req, res) => {

    // let email = req.body.email;
 
     console.log('body....', req.body);
 
     userList.findOne({mobile:req.body.mobile}, function(err, response){
         if(!err && response){ 
             console.log("response mob ", response);
             console.log(response.company_id + "===" + req.body.company_id)
             if(response.company_id && response.company_id === req.body.company_id)
             {                 
                if(response.activation === true)
                {
                   userList.findOneAndUpdate({ mobile: req.body.mobile },
                   { $set: { user_type: req.body.user_type } }, function(err, response) {
                       if(!err && response) {
                           console.log("response req...........", response)
                           res.json({ status: true, customer_id:response._id, data:response });
                       }
                   })
                 
                }
                else
                {
                    userList.deleteOne({ _id: mongoose.Types.ObjectId(response._id) }, function(err, response) {
                        if(!err && response) {
                            res.json({ status: false, message: "not exist" });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Failure" });
                        }
                    });
                  
                }
             }
             else
             {
            let signupdata
            if(response.user_id)
            {
                signupdata =
                {
                   social_user:response.social_user,
                   email_confirmed:true,
                   activation:true,
                   mob_status:true,
                   user_id : response.user_id,
                   social_unique_id:response.social_unique_id,
                   name:response.name,
                   email:response.email,
                   mobile:response.mobile,
                   photo_url:response.photo_url,
                   third_party_provider:response.third_party_provider,
                   password:response.password,
                   count:0,                   
                   company_id:req.body.company_id,
                   branch:{branch_id:req.body.branch_id},
                }    
            }
            else
            {

                signupdata =
                {                 
                   email_confirmed:true,
                   activation:true,
                   mob_status:true,                  
                   name:response.name,
                   email:response.email,
                   mobile:response.mobile,                  
                   password:response.password,
                   count:0,
                   company_id:req.body.company_id,
                   branch:{branch_id:req.body.branch_id},
                }  
                
               
            }
            userList.findOne({mobile:req.body.mobile, company_id:req.body.company_id}, function(err, response){
                if(!err && response && response.activation === true) {
                    console.log("response mob err", response)
                    res.json({ status: true, customer_id:response._id, data:response });
                }
                else
                {
                    let newCustomers = new userList(signupdata);
                    newCustomers.save(function(err, response) {
                        console.log("error save.........", err)
                        if(!err && response) {
                            res.json({ status: true, customer_id:response._id, data:response });
                        }
                        else
                        {
                            res.json({ status: false, customer_id:response._id, err:err });  
                        }
                    })
                }
            })
           
            
             }
            
           
            
         }else{
             console.log("response mob err", response)
             res.json({ status: false, message: "not exist" });
         }
     })
 
 });

router.post("/googleoAuthValidation", (req,res) => {
    let google_api_code = req.body.code;

    oAuth2Client.getToken(google_api_code, (err, token) => {
		if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);    
        
         listConnectionNames(oAuth2Client, token).then( result => {
            res.json({token: token, connections: result, oAuth: oAuth2Client});
         })

      });    
      
 })

// social login - Google people API

/* Email Validation for Castemo - Hari*/
router.get("/validateEmail", (req, res) => {
    let email = req.query.email;
    // console.log(email);
    emailexistence.check(email, function(err, response) {

        if(!err && response){            
         
            res.json({ status: true, message: "valid email" });
       
        }else{
            res.json({ status: false, error: err, message: "Invalid email" });
        }

    });
});


router.post("/validateEmailSent", (req, res) => {   
    
    let sendData = {
        sendTo: req.body.email,
        subject: req.body.subject,
        body: req.body.message
    };    

    mailService.c_sendMailTo(sendData, function(err, response) {

        if(!err && response){       
         
            res.json({ status: true, message: "Mail sent Successfully." });
       
        }else{
            res.json({ status: false, error: err, message: "Invalid email" });
        }

    });
});

/* Email Validation for Castemo - Hari*/

/* User Signup */
router.post("/signup", (req, res) => {
    console.log("Signup Body...........", req.body)
    req.body.otp = randomNumber();
    req.body.otp_status = 'send';
    let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+req.body.name+",</p><p>Welcome to <b>DiNAMIC!</b></p><p>This is your OTP. Use it to complete your registration.</p><p><b>"+req.body.otp+"<b></p></body></html>";
    let sendData = {
        sendTo: req.body.email,
        subject: 'Welcome to DiNAMIC!',
        body: bodyContent
    };


    // verifier.verify('mmohan.meenu@gmail.com', { timeout: 6000 }, function( err, info ){
    //     console.log("Verifier........",info, 'err...........', err);
    //     if( err ) console.log(err);
    //     else{
    //       console.log( "Success (T/F): " + info.success );
    //       console.log( "Info: " + info.info );
      
    //       //Info object returns a code which representing a state of validation:
      
    //       //Connected to SMTP server and finished email verification
    //       console.log(info.code === infoCodes.finishedVerification);
      
    //       //Domain not found
    //       console.log(info.code === infoCodes.domainNotFound);
      
    //       //Email is not valid
    //       console.log(info.code === infoCodes.invalidEmailStructure);
      
    //       //No MX record in domain name
    //       console.log(info.code === infoCodes.noMxRecords);
      
    //       //SMTP connection timeout
    //       console.log(info.code === infoCodes.SMTPConnectionTimeout);
      
    //       //SMTP connection error
    //       console.log(info.code === infoCodes.SMTPConnectionError)
    //     }
    //   });

    req.body.OTPdatetime = moment().format();
//    emailexistence.check(req.body.email, function(err, response) {
//     //     console.log("response..........", response)
//         if(!err && response)
//         {
            userList.findOne({  mobile: req.body.mobile , company_id:req.body.company_id }, function(err, response) {
                if(!err && response) {      
                    if(response.activation) {
                        res.json({ status: false, error: err, message: "Mobile or email already exist" });
                    }
                    else {
                        req.body.password = bcrypt.hashSync(req.body.password, saltRounds);
                        req.body.created_on = new Date();
                        req.body.email_confirmed = false;
                        // UPDATE
                        userList.findOneAndUpdate({ mobile: req.body.mobile , company_id:req.body.company_id },
                        { $set: req.body }, function(err, response) {
                            if(!err && response) {
                                let customerId = response._id;
                                // EMAIL
                                mailService.sendMailTo(sendData, function(err, response1) {
                                    let mailerStatus;
                                   if(!err && response1) {
                                    mailerStatus = 'Mail Sent'
                                }
                                
                                else {
                                    mailerStatus = 'Mail Sent Failed'
                                }
                                        let smsOptions = {
                                            method: 'get',    
                                            url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+req.body.otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',                                                                               
                                        };

                                        if(req.body.smsType === 'production')
                                        {
                                            if(req.body.mobile){
                                                request(smsOptions, function (err, response) {
                                                    console.log({
                                                        status: 0,
                                                        message: "Error getting Order details",
                                                        error: response
                                                      });
                                                    if (!err && response.statusCode == 200) {
                                                        // console.log("response....", response); 
                                                    }else{
                                                        console.error({
                                                            status: 0,
                                                            message: "Failure",
                                                            error: err
                                                          });
                                                    }
                                                })
                                            }
                                      
                                            res.json({ status: true, customer_id: customerId, data:response, smsType:'Production', mailerStatus : mailerStatus, OTP:req.body.otp });
                                        }
                                        else
                                        {
                                           res.json({ status: true, customer_id: customerId, data:response,smsType:'development', mailerStatus : mailerStatus, OTP:req.body.otp });
                                        }

                                       
                                    
                                });

                               
                            }
                            else {
                                res.json({ status: false, error: err, message: "Unable to register" });
                            }
                        });
                    }
                }
                else {
                    // INSERT
                    req.body.email_confirmed = false;

                    let newCustomers = new userList(req.body);
                    newCustomers.save(function(err, response) {
                        console.log("error save.........", err)
                        if(!err && response) {
                            let customerId = response._id;
                            // EMAIL
                            mailService.sendMailTo(sendData, function(err, response1) {
                                let mailerStatus;
                                if(!err && response1) {
                                 mailerStatus = 'Mail Sent'
                             }
                             
                             else {
                                 mailerStatus = 'Mail Sent Failed'
                             }

                                    let smsOptions = {
                                        method: 'get',    
                                        url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+req.body.otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',                                                                               
                                    };
                                    if(req.body.smsType === 'production')
                                    {
                                        if(req.body.mobile){
                                            request(smsOptions, function (err, response) {
                                                console.log({
                                                    status: 0,
                                                    message: "Error getting Order details",
                                                    error: response
                                                  });
                                                if (!err && response.statusCode == 200) {
                                                    // console.log("response....", response); 
                                                }else{
                                                    console.error({
                                                        status: 0,
                                                        message: "Failure",
                                                        error: err
                                                      });
                                                }
                                            })
                                        }
                                       console.log("signupdata...............",{ status: true, customer_id: customerId, data:response, smsType:'Production', mailerStatus:mailerStatus, OTP:req.body.otp })
                                        res.json({ status: true, customer_id: customerId, data:response, smsType:'Production', mailerStatus:mailerStatus, OTP:req.body.otp });
                                    }
                                    else
                                    {
                                        console.log("signupdata...............",{ status: true, customer_id: customerId, data:response,smsType:'development', mailerStatus:mailerStatus, OTP:req.body.otp  })
                                       res.json({ status: true, customer_id: customerId, data:response,smsType:'development', mailerStatus:mailerStatus, OTP:req.body.otp  });
                                    }

                                
                            });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Unable to register" });
                        }
                    });
                }
            });
//         }                
//        else {
//            res.json({ status: false, error: err, message: "Invalid email" });
//        }
//    });
});

/* Signup OTP Validate */
router.post("/otp_validate", function(req, res) {

    console.log("OTP Body.............", req.body)
    userList.findOne({ _id: mongoose.Types.ObjectId(req.body.customer_id), otp: req.body.otp, otp_status: { $ne: 'expired'} }, function(err, response) {

        console.log("OTP response..........", response)
        if(!err && response != null) {

            console.log("OTP response..........", response)
            // var now  = "04/09/2013 15:00:00";
            const now = moment().format();
            console.log("OTP Date Time", now )
            var then =response.OTPdatetime;
            var a = moment('2016-06-06T21:03:55');//now
            var b = moment('2016-05-06T20:03:55');
            console.log(response.OTPdatetime,"------", now)
            const c = moment(now).diff(moment(response.OTPdatetime), 'minutes');
            console.log("c------", c);
            if(c <= 10)
            {
                userList.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.customer_id), otp: req.body.otp, otp_status: { $ne: 'expired'} },
                { $set: { activation: true } }, function(err, response) {
                    if(!err && response) {
                        let sendData = {
                            id: response._id,
                            name: response.name,
                            email: response.email,
                            mobile: response.mobile,
                            email_confirmed: response.email_confirmed,
                            provider: 'Dinamic',
                            status: true
                        };      
            
                        res.json(sendData);
                    }
                    else {
                        res.json({ status: false, error: err, message: "Invalid OTP" });
                    }
                });
            } 
            else
            {
                res.json({ status: false, error: err,  message: "OTP Expired" });
            }
   
        }
        else{
            console.log("error...........")
            res.json({ status: false, error: err, message: "Invalid OTP" });
        }
    });

   
});

/* Social OTP Validate */
router.post("/social_otp_validate", function(req, res) {
    
    console.log("req.body.......",req.body)
    userList.findOne({ _id: mongoose.Types.ObjectId(req.body.customer_id), otp: req.body.otp, otp_status: { $ne: 'expired'} }, function(err, response) {

        console.log("OTP response..........", response)
        if(!err && response) {
            console.log("OTP response..........", response)
            // var now  = "04/09/2013 15:00:00";
            const now = moment().format();
            console.log("OTP Date Time", now )
            var then =response.OTPdatetime;
            var a = moment('2016-06-06T21:03:55');//now
            var b = moment('2016-05-06T20:03:55');
            console.log(response.OTPdatetime,"------", now)
            const c = moment(now).diff(moment(response.OTPdatetime), 'minutes');
            console.log("c------", c)

            if(c <= 10)
            {
            userList.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.customer_id), otp: req.body.otp, otp_status: { $ne: 'expired'} },
            { $set: { mob_status: true, otp_status:'verified', otp:'null' } }, function(err, response) {
            if(!err && response) {
                let sendData = {
                    id: response._id,
                    name: response.name,
                    email: response.email,
                    mobile: response.mobile,
                    email_confirmed: response.email_confirmed,
                    provider: 'Dinamic',
                    status: true
                };      

                res.json(sendData);
            }
            else {
                res.json({ status: false, error: err, message: "Invalid OTP" });
            }
            });
            }
            else
            {
                res.json({ status: false, error: err,  message: "OTP Expired" });
            }
        }
        else {
            res.json({ status: false, error: err, message: "Invalid OTP" });
        }

    });

});
router.post("/mob_otp_validate", function(req, res) {


    userList.findOneAndUpdate({ email: req.body.email, otp: req.body.otp, otp_status: { $ne: 'expired'} },
    { $set: { activation: true } }, function(err, response) {
        if(!err && response) {
            let sendData = {
                id: response._id,
                name: response.name,
                email: response.email,
                mobile: response.mobile,
                email_confirmed: response.email_confirmed,
                provider: 'Dinamic'
            };      

            res.json({ status: true, customer_details: sendData });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid OTP" });
        }
    });
});


router.post("/check_mobile_number_exist", function(req, res){
    let mobile = req.body.mobile;
    console.log("mobile..................", mobile);
    userList.find({ mobile: mobile,company_id:req.body.company_id, activation: true}, function(err, response){
        if(!err && response){   
            if(response.length){
                res.json({ status: true, error: err, message: "Mobile number is already Exist.", data: response });
            }else{
                res.json({ status: false, error: err, message: "Mobile number is not Exist." });
            }         
           
        }else{
            res.json({ status: false, error: err, message: "error occured." });
        }
    })
})

router.post("/otp_expired", function(req, res) {

    userList.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.customer_id)},
    { $set: {otp_status: 'expired'}}, function(err, response){
        if(!err && response){
            res.json({ status: true, message: "OTP status successfully updated." });
        }else{
            res.json({ status: false, error: err, message: "OTP update failed." });
        }
    })

})

// router.post("/resend_otp", function(req,res){
//     let new_otp = randomNumber();
//     console.log("response",req.body)
//     userList.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.customer_id)},
//     { $set: {otp: new_otp, otp_status: 'send'}}, function(err,response){
//         if(!err && response){
//             console.log("response",response)
//             let smsOptions = {
//                 method: 'get',                                      
//                 url: 'https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=f1HkUAPbVaK&MobileNo=91'+req.body.mobile+'&SenderID=DNAMIC&Message=Welcome to DiNAMIC. Your OTP is '+new_otp+'.&ServiceName=TEMPLATE_BASED',   
//             };
//             console.log(req.body)
//             if(req.body.mobile){
//                 request(smsOptions, function (err, response) {
//                     console.log({
//                         status: 0,
//                         message: "Error getting Order details",
//                         error: response
//                       });
//                     if (!err && response.statusCode == 200) {
//                         console.log("response....", response); 
//                     }else{
//                         console.error({
//                             status: 0,
//                             message: "Failure",
//                             error: err
//                           });
//                     }
//                 })
//             }

//             res.json({ status: true, message: "OTP resend successfully." });
//         }else{
//             res.json({ status: false, error: err, message: "OTP sent failed." });
//         }
//     })
// })



/** send OTP */
router.post("/resend_otp", function(req,res){
    let new_otp = randomNumber();
    console.log("response",req.body, "new_otp",new_otp );
    userList.findOneAndUpdate({email: req.body.email},
    { $set: {otp: new_otp, otp_status: 'send'}}, function(err,response){
        if(!err && response){
         console.log("response-------------------",response);
            let smsOptions = {
              method: 'get',                                      
              //  url: 'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=DNAMIC&Message=Welcome to DiNAMIC. Your OTP is '+new_otp+'.&ServiceName=TEMPLATE_BASED',   
              url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+new_otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',   
            };
           console.log(req.body)
            if(req.body.mobile){
                request(smsOptions, function (err, response) {
                    console.log({
                        status: 0,
                        message: "Error getting Order details",
                        error: response,
                        err: err
                      });
                    if (!err && response.statusCode == 200) {
                     //   console.log("response....", response); 
                     console.log("message sent")
                    }else{
                        console.error({
                            status: 0,
                            message: "Failure",
                            error: err
                          });
                    }
                })
            }

            res.json({ status: true, message: "OTP resend successfully." });
        }else{
            res.json({ status: false, error: err, message: "OTP sent failed." });
        }
    })
})

/** send OTP */
router.post("/send_otp", function(req,res){
    let new_otp = randomNumber();
    console.log("response",req.body, "new_otp",new_otp )

    userList.findOneAndUpdate({email: req.body.email},
    { $set: {otp: new_otp, otp_status: 'send'}}, function(err,response){
        if(!err && response){
         console.log("response",response)
            let smsOptions = {
                method: 'get',                                      
              //  url: 'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=DNAMIC&Message=Welcome to DiNAMIC. Your OTP is '+new_otp+'.&ServiceName=TEMPLATE_BASED',   
              url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+new_otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',   
            };
           console.log(req.body)
            if(req.body.mobile){
                request(smsOptions, function (err, response) {
                    console.log({
                        status: 0,
                        message: "Error getting Order details",
                        error: response,
                        err: err
                      });
                    if (!err && response.statusCode == 200) {
                     //   console.log("response....", response); 
                     console.log("message sent")
                    }else{
                        console.error({
                            status: 0,
                            message: "Failure",
                            error: err
                          });
                    }
                })
            }

            res.json({ status: true, message: "OTP send successfully.",otp: new_otp });
        }else{
            res.json({ status: false, error: err, message: "OTP sent failed." });
        }
    })
})

/* User Login */
router.post("/login", function(req, res) {
    userList.findOne({ $and: [ 
        { activation: true },
        { $or: [ { mobile: req.body.username }, { email: req.body.username } ] }
    ] }, function(err, response) {
        if(!err && response) {
            response.comparePassword(req.body.password, async function(err, isMatch) {
                if(!err && isMatch) {
                    let sendData = {
                        id: response._id,
                        name: response.name,
                        email: response.email,
                        mobile: response.mobile,
                        email_confirmed: response.email_confirmed,
                        provider: 'Dinamic'
                    };
                    res.json({ status: true, customer_details: sendData });
                }
                else {
                    res.json({ status: false, error: err, message: "Password does not match" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid user" });
        }
    });
});

/* User Login Email check*/
router.post("/login_email", function(req, res) {
    userList.findOne({ $and: [ 
        { activation: true },
        { $or: [ { mobile: req.body.username }, { email: req.body.username } ], company_id:req.body.company_id }
    ] }, function(err, response) {
        if(!err && response) {
            // response.comparePassword(req.body.password, async function(err, isMatch) {
                // if(!err && isMatch) {
                    let sendData = {
                        id: response._id,
                        name: response.name,
                        email: response.email,
                        mobile: response.mobile,
                        email_confirmed: response.email_confirmed,
                        provider: 'Dinamic'
                    };
                    res.json({ status: true, message: "User Exist" });
                // }
                // else {
                //     res.json({ status: false, error: err, message: "Password does not match" });
                // }
            // });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid user" });
        }
    });
});

/* Forgot Request */
router.post("/forgot_request", function(req, res) {
    userList.findOne({ email: req.body.email, activation: true }, function(err, response) {
        if(!err && response) {
            let token = randomString()+new Date().valueOf()+randomString();
            let recoveryLink = "http://localhost:4200/index/#/password-recovery/"+token;
            let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+response.name+",</p><p>We have received a password change request from your DiNAMIC account.</p><p>Click on the link to reset your password.</p><p>"+
            recoveryLink+"</p></body></html>";
            let sendData = {
                sendTo: req.body.email,
                subject: "Password Recovery",
                body: bodyContent
            };
            mailService.sendMailTo(sendData, function(err, response) {
                if(!err && response) {
                    userList.updateOne({ email: req.body.email, activation: true },
                    { $set: { temp_token: token, forgot_request_on: new Date() } }, function(err, response) {
                        if(!err) {
                            res.json({ status: true, message: "Email sent successfully" });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Failure" });
                        }
                    });
                }
                else {
                    res.json({ status: false, error: err, message: "Email can't send" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid user" });
        }
    });
});

/* Validate forgot request */
router.post("/validate_forgot_request", function(req, res) {
    userList.findOne({ temp_token: req.body.temp_token }, function(err, response) {
        if(!err && response) {
            // duration validation 60 minutes
            let timeStamp = ((response.forgot_request_on).getTime() + (60*60000));
            let currentTime = new Date().valueOf();
            if(timeStamp > currentTime) {
                res.json({ status: true, message: "success" });
            }
            else {
                res.json({ status: false, error: err, message: "Link expired" });
            }
        }
        else {
            // res.json({ status: false, error: err, message: "Invalid user" });
            res.json({ status: false, error: err, message: "Link expired" });
        }
    });
});

/* Update password */
router.post("/update_pwd", function(req, res) {
    userList.findOne({ temp_token: req.body.temp_token }, function(err, response) {
        if(!err && response) {
            // duration validation 60 minutes
            let userData = response;
            let timeStamp = ((response.forgot_request_on).getTime() + (60*60000));
            let currentTime = new Date().valueOf();
            if(timeStamp > currentTime) {
                let newPwd = bcrypt.hashSync(req.body.password, saltRounds);
                userList.updateOne({ temp_token: req.body.temp_token },
                { $set: { password: newPwd, temp_token: null } }, function(err, response) {
                    if(!err)
                    {
                        let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+userData.name+",</p><p>Your <b>DiNAMIC</b> account's password was recently updated.</p></body></html>";
                        let sendData = {
                            sendTo: userData.email,
                            subject: "Password Updated",
                            body: bodyContent
                        };
                        mailService.sendMailTo(sendData, function(err, response) {
                            res.json({ status: true });
                        });
                    }
                    else {
                        res.json({ status: false, error: err, message: "Failure" });
                    }
                });
            }
            else {
                res.json({ status: false, error: err, message: "Link expired" });
            }
        }
        else {
            res.json({ status: false, error: err, message: "Link expired" });
        }
    });
});

/* User Logout */
router.post("/logout", function(req, res) {
    tableMetadata.findOneAndUpdate({
        table_id: mongoose.Types.ObjectId(req.body.dinamic_table_id), status: 'active',
        "user_list._id": mongoose.Types.ObjectId(req.body.dinamic_session_id)
    },
    { $set: { "user_list.$.status": 'completed' } }, function(err, response) {
        if(!err && response) {
            tableMetadata.findOne({
                table_id: mongoose.Types.ObjectId(req.body.dinamic_table_id), status: 'active', "user_list.status": "active"
            }, function(err, response) {
                if(!err && !response) {
                    tableMetadata.findOneAndUpdate(
                    { table_id: mongoose.Types.ObjectId(req.body.dinamic_table_id), status: 'active' },
                    { $set: { status: 'completed' } }, function(err, response) {
                        if(!err) {
                            res.json({ status: true });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Failure" });
                        }
                    });
                }
                else {
                    res.json({ status: true });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Failure" });
        }
    });
});

/* Email Confirmation*/
router.post("/email_confirmation", function(req, res) {

    userList.findOne({ _id: mongoose.Types.ObjectId(req.body.user) }, function(err, response) {
        if(!err && response) {
            let userid = response._id;
            let recoveryLink = req.body.userBaseURL+"#/confirm_user_email/"+userid;
            // let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+response.name+",</p><p>Thank you.</p><p>Click on the link to confirm your email.</p><p>"+
            // recoveryLink+"</p></body></html>";

            let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+req.body.name+
            ",</p><p>Welcome to <b>DiNAMIC!</b></p><p>Get ready to have an experience worth remembering. That means instant access, unlimited service, advanced order customization, and access to quick service options.</p><p>Please click the below link to complete your registration process.</p><p>"+
            recoveryLink+"</p></body></html>";

            let sendData = {
                sendTo: response.email,
                subject: "Welcome to DiNAMIC!",
                body: bodyContent
            };
            mailService.sendMailTo(sendData, function(err, response) {
                if(!err && response) {
                    res.json({ status: true, message: "Email sent successfully" });
                }
                else {
                    res.json({ status: false, error: err, message: "Email can't send" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid user" });
        }
    });
});

// user_email_confirmed

router.post("/user_email_confirmed", function(req, res) { 

    userList.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.userId)},
    { $set: { email_confirmed: true}}, function(err,response){
        if(!err && response){
            res.json({ status: true, message: "Email confirmation updated successfully." });
        }else{
            res.json({ status: false, error: err, message: "Failed" });
        }
    })

});

router.post("/save_social_user", function(req, res) {   
    req.body.otp = randomNumber();
    req.body.otp_status = 'sent'; 
    req.body.OTPdatetime = moment().format();
    const now = moment().format();
            console.log("OTP Date Time", now )
    userList.findOne({  mobile: req.body.mobile , company_id:req.body.company_id }, function(err, response){
        if(!err && response){   
            console.log("response mob1............", response);
                    
            userList.findOneAndUpdate({mobile:req.body.mobile},{$set: { otp: req.body.otp, otp_status: req.body.otp_status,OTPdatetime: req.body.OTPdatetime }}, function(err, response){
                if(!err && response){ 
                    let smsOptions = {
                        method: 'get',                                      
                        //  url: 'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=DNAMIC&Message=Welcome to DiNAMIC. Your OTP is '+new_otp+'.&ServiceName=TEMPLATE_BASED',   
                        url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+req.body.otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',   
                      };
                    //  console.log(req.body)
                    let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+response.name+",</p><p>Welcome to <b>DiNAMIC!</b></p><p>This is your OTP <b>"+req.body.otp+"<b></p></body></html>";
                    let sendData = {
                        sendTo: response.email,
                        subject: 'Welcome to DiNAMIC!',
                        body: bodyContent
                    };
                   
                    mailService.sendMailTo(sendData, function(err, response1) {
                       let  mailerStatus;
                        console.log("response email........", response1, "error........", err)
                       
                               if(!err && response1) {
                                console.log("response email1........", response1);
                                mailerStatus = "Mail Sent"
                               }
                               else
                               {
                                mailerStatus = "Mail Sent failed"
                               }
                               if(req.body.smsType === 'production')
                               {
                                  if(req.body.mobile){
                                      request(smsOptions, function (err, response) {
                                          console.log({
                                              status: 0,
                                              message: "Error getting Order details",
                                              error: response,
                                              err: err
                                            });
                                          if (!err && response.statusCode == 200) {
                                           //   console.log("response....", response); 
                                           console.log("message sent")
                                          }else{
                                              console.error({
                                                  status: 0,
                                                  message: "Failure",
                                                  error: err
                                                });
                                          }
                                      })
                                  }
                                  res.json({ status: true, customer_id: response._id, data:response, smsType:'Production', mailerStatus : mailerStatus, OTP : req.body.otp });
                               }
                               else
                               {
                                  res.json({ status: true, customer_id: response._id, data:response,smsType:'development', mailerStatus : mailerStatus, OTP : req.body.otp });
                               }

                            });                  
                   
                   
                }else{
                    res.json({ status: false, data: "No records found" });
                }
            })

        }else{
            communStatus:any = {};
            let newCustomers = new userList(req.body);
            
            newCustomers.save(function(err, response) {
                console.log("response..............", response)
                if(!err && response) {
                    console.log('social user details....', req.body);
                    let customerId = response._id;
                   
                    //  console.log(req.body)
                    let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+response.name+",</p><p>Welcome to <b>DiNAMIC!</b></p><p>This is your OTP <b>"+req.body.otp+"<b></p></body></html>";
                    let sendData = {
                        sendTo: response.email,
                        subject: 'Welcome to DiNAMIC!',
                        body: bodyContent
                    };
                    mailService.sendMailTo(sendData, function(err, response1) {
                        let  mailerStatus;
                         console.log("response email........", response1, "error........", err)
                        
                                if(!err && response1) {
                                 console.log("response email1........", response1);
                                 mailerStatus = "Mail Sent"
                                }
                                else
                                {
                                 mailerStatus = "Mail Sent failed"
                                }

                                let smsOptions = {
                                    method: 'get',                                      
                                    //  url: 'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=DNAMIC&Message=Welcome to DiNAMIC. Your OTP is '+new_otp+'.&ServiceName=TEMPLATE_BASED',   
                                    url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+req.body.otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',   
                                  };
                                  console.log("smstype..........", req.body.smsType)
                                if(req.body.smsType === 'production')
                                {
                                    console.log("production....................")
                                   if(req.body.mobile){
                                       request(smsOptions, function (err, response) {
                                           console.log({
                                               status: 0,
                                               message: "Error getting Order details",
                                               error: response,
                                               err: err
                                             });
                                           if (!err && response.statusCode == 200) {
                                            //   console.log("response....", response); 
                                            console.log("message sent")
                                           }else{
                                               console.error({
                                                   status: 0,
                                                   message: "Failure",
                                                   error: err
                                                 });
                                           }
                                       })
                                   }
                                  this.communStatus = { smsType:'Production', mailerStatus:maillerStatus }
                               }
                               else
                               {
                                console.log("development....................")
                                this.communStatus = { smsType:'development', mailerStatus:maillerStatus };
                               }

                            })
                            console.log("Communication status..........",this.communStatus )
                            res.json({ status: true, customer_id: customerId, data:response, otp:req.body.otp, commStat:this.communStatus });       
                }
                else {
                    console.log(err);
                    res.json({ status: false, error: err, message: "Unable to register" });
                }
            });
        }
    })
    
})




router.post("/update_existing_user", function(req, res) {   
    
    
    req.body.OTPdatetime = moment().format();
    const now = moment().format();
            console.log("OTP Date Time", now );
            
            if(req.body.type === 'sentotp')
            {
              req.body.otp = randomNumber();
              
                userList.findOneAndUpdate({_id:mongoose.Types.ObjectId(req.body.customer_id), company_id:req.body.company_id, 'branch.branch_id': req.body.branch_id},{$set: { otp: req.body.otp, otp_status: req.body.otp_status,OTPdatetime: req.body.OTPdatetime}}, function(err, response){

                  
                    if(!err && response){ 
                        let smsOptions = {
                            method: 'get',  
                            url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+req.body.otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',                                                                               
                          };
                        //  console.log(req.body)                    
                        let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+response.name+",</p><p>Welcome to <b>DiNAMIC!</b></p><p>This is your OTP <b>"+req.body.otp+"<b></p></body></html>";
                        let sendData = {
                            sendTo: response.email,
                            subject: 'Welcome to DiNAMIC!',
                            body: bodyContent
                        };
                       
                        mailService.sendMailTo(sendData, function(err, response1) {
                            console.log("response email........", response1, "error........", err)
                           
                                   if(!err && response1) {
                                    console.log("response email1........", response1);
                                    mailerStatus = "Mail Sent"
                                   }
                                   else
                                   {
                                    mailerStatus = "Mail Sent failed"
                                   }
                                   if(req.body.smsType === 'production')
                                   {
                                      if(req.body.mobile){
                                          request(smsOptions, function (err, response) {
                                              console.log({
                                                  status: 0,
                                                  message: "Error getting Order details",
                                                  error: response,
                                                  err: err
                                                });
                                              if (!err && response.statusCode == 200) {
                                               //   console.log("response....", response); 
                                               console.log("message sent")
                                              }else{
                                                  console.error({
                                                      status: 0,
                                                      message: "Failure",
                                                      error: err
                                                    });
                                              }
                                          })
                                      }
                                      res.json({ status: true, customer_id: response._id, data:response, smsType:'Production', mailerStatus : mailerStatus, OTP : req.body.otp });
                                  }
                                  else
                                  {
                                     res.json({ status: true, customer_id: response._id, data:response,smsType:'development', mailerStatus : mailerStatus, OTP : req.body.otp  });
                                  }




                            });
    

                         
                        
                        
                    }else{
                        userList.findOneAndUpdate({_id:mongoose.Types.ObjectId(req.body.customer_id), company_id:req.body.company_id},{$set: { otp: req.body.otp, otp_status: req.body.otp_status,OTPdatetime: req.body.OTPdatetime, 'branch.branch_id': req.body.branch_id}}, function(err, response){
                            if(!err && response){ 
                                let smsOptions = {
                                    method: 'get',                                      
                                    url:'http://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=YYPN9lBliwW&MobileNo=91'+req.body.mobile+'&SenderID=SISOTP&Message=Your OTP is '+req.body.otp+'. Thank you for Enquiring with us.&ServiceName=TEMPLATE_BASED',                                                                               
                                  };
                                 console.log(req.body)

                                 let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+response.name+",</p><p>Welcome to <b>DiNAMIC!</b></p><p>This is your OTP <b>"+req.body.otp+"<b></p></body></html>";
                                 let sendData = {
                                     sendTo: response.email,
                                     subject: 'Welcome to DiNAMIC!',
                                     body: bodyContent
                                 };
                                 mailService.sendMailTo(sendData, function(err, response1) {
                                    console.log("response email........", response1, "error........", err)
                                   
                                           if(!err && response1) {
                                            console.log("response email1........", response1);
                                            mailerStatus = "Mail Sent"
                                           }
                                           else
                                           {
                                            mailerStatus = "Mail Sent failed"
                                           }

                                           if(req.body.smsType === 'production')
                                           {
                                              if(req.body.mobile){
                                                  request(smsOptions, function (err, response) {
                                                      console.log({
                                                          status: 0,
                                                          message: "Error getting Order details",
                                                          error: response,
                                                          err: err
                                                        });
                                                      if (!err && response.statusCode == 200) {
                                                       //   console.log("response....", response); 
                                                       console.log("message sent")
                                                      }else{
                                                          console.error({
                                                              status: 0,
                                                              message: "Failure",
                                                              error: err
                                                            });
                                                      }
                                                  })
                                              }
                                              res.json({ status: true, customer_id: response._id, data:response, smsType:'Production', mailerStatus : mailerStatus, OTP : req.body.otp });
                                          }
                                          else
                                          {
                                             res.json({ status: true, customer_id: response._id, data:response,smsType:'development', mailerStatus : mailerStatus, OTP : req.body.otp });
                                          }
                                   
                                        })

                               
                              

                            }
                            else
                            {
                                res.json({ status: false, data: "No records found" });
                            }
                        })

                       
                    }
                })
            }

            else if(req.body.type === 'otpverify')
            {
                console.log("verify body.........",req.body)
                userList.findOne({ _id: mongoose.Types.ObjectId(req.body.customer_id), otp: req.body.otp, otp_status: { $ne: 'expired'} }, function(err, response) {

                    console.log("OTP response..........", response)
                    if(!err && response) {
                        console.log("OTP response..........", response)
                        // var now  = "04/09/2013 15:00:00";
                        const now = moment().format();
                        console.log("OTP Date Time", now )
                        var then =response.OTPdatetime;
                        var a = moment('2016-06-06T21:03:55');//now
                        var b = moment('2016-05-06T20:03:55');
                        console.log(response.OTPdatetime,"------", now)
                        const c = moment(now).diff(moment(response.OTPdatetime), 'minutes');
                        console.log("c------", c)
            
                        if(c <= 10)
                        {    
                       userList.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(req.body.customer_id), otp: req.body.otp, company_id:req.body.company_id, otp_status: { $ne: 'expired'}, 'branch.branch_id': req.body.branch_id },
    {
        $set: { mob_status: true,activation:true,otp_status:req.body.otp_status, otp:'null',user_type:req.body.user_type },
        $inc: { count: 1, 'branch.$.count': 1 }
    }, function(err, response) {
                        if(!err && response) {
                            let sendData = {
                                id: response._id,
                                name: response.name,
                                email: response.email,
                                mobile: response.mobile,
                                user_type:req.body.user_type,
                                email_confirmed: response.email_confirmed,
                                provider: 'Dinamic',
                                status: true,
                                otp_status:'verified'
                            };      
            
                            res.json({status:true, data:response});
                        }
                        else {
                            res.json({ status: false, error: err, message: "Invalid OTP" });
                        }
                        });
                        }
                        else
                        {
                            res.json({ status: false, error: err,  message: "OTP Expired" });
                        }
                    }
                    else {
                        res.json({ status: false, error: err, message: "Invalid OTP" });
                    }
            
                });
            
            }
            

     
    
})


router.post("/update_social_user", function(req, res) {   

    userList.findOne({email:req.body.email}, function(err, response){
        if(!err && response){ 
            console.log("response mob ", response);
                    
            userList.findOneAndUpdate({email:req.body.email},{$set: { activation: req.body.activation}}, function(err, response){
                if(!err && response){ 
                    res.json({ status: true, customer_id: response._id });
                }else{
                    res.json({ status: false, data: "No records found" });
                }
            })

        }else{
                    console.log(err);
                    res.json({ status: false, error: err, message: "Unable to register" });
        }
    })
    
})

router.post("/insta_webhook", function(req, res){
    console.log(req.body);
    res.json({ status: true, message: "webhook captured..." });
})

router.post("/razor_order_api", function(req, res){
    console.log("body.....", req.body);
    table.findOne({access_code:req.body.access_code}, function(err, response)
    {

        if(!err && response){ 

        gateway.findOne({branch_id:mongoose.Types.ObjectId(response.branch_id)}, function(err, response)
    {
        if(!err && response){ 
            var instance = new Razorpay({
                key_id: response.key_id,
                key_secret: response.key_secret
              })
        
            var options = {
                amount: 1000,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "order_rcptid_11",//
                payment_capture: '1'
              };        
              instance.orders.create(options, function(err, order) {
                console.log(order);
                res.json({ status: true, data: order });
              });
        }else{
            res.json({ status: false, data: "No records found" });
        }  
   
        })   
        }
        else{
            res.json({ status: false, data: "No records found" });
        } 
})
   
})

router.post("/payment_gateway_details", function(req, res){
    console.log("body.....", req.body);
    table.findOne({access_code:req.body.access_code}, function(err, response)
    {
        console.log("response paymentdetails............", response)
        gateway.findOne({branch_id:mongoose.Types.ObjectId(response.branch_id)}, function(err, response)
    {
        console.log("response paymentdetails1............", response)
        if(!err && response){            
                res.json({ status: true,  key_id: response.key_id, key_secret: response.key_secret, data : response});
             
        }else{
            res.json({ status: false, data: "No records found" });
        }  
   
})   
   
})
   
})




router.post("/payu_api", function(req, res){
    console.log("body.....", req.body);    

    let payUOptions = {           
        headers: {'content-type' : 'application/x-www-form-urlencoded'},                               
        url: 'https://test.payu.in/_payment',   
        body: JSON.stringify(req.body)
    };

    request.post(payUOptions, function (err, response) {
        console.log('err....', err);
        console.log('response...', response.body);
        if(!err && response) {
            res.json({ status: true, message: "payu success...", data: response.body });
        }else{
            res.json({ status: false, message: "payu failure...", err: err });
        }
    })
  
})

router.post("/validate_qr", function(req, res){
    console.log("body validate qr.....", req.body);  
      
    valet.findOneAndUpdate({qrcode_link: req.body.qr, status: 'inactive', pos_branch_id:req.body.pos_branch_id},{$set: {current_user_details: req.body.userDetails}},{ new : true }, function(err, response){
        if(!err && response){ 
             console.log("response of validate qr......", response)
            res.json({ status: true, data: response });

        }else{
            res.json({ status: false, data: "No records found" });
        }
    })

})

router.post("/cancel_valet", function(req, res){
    console.log("body.....", req.body);   

    valet.findOneAndUpdate({ _id : mongoose.Types.ObjectId(req.body._id)},{$set: { status: 'inactive', current_user_details: {}}},{ new : true }, function(err, response){
        if(!err && response){ 
            console.log("cancel response.....", response )
            res.json({ status: true, data: response });
        }else{
            console.log("cancel Error response.....", response )
            res.json({ status: false, data: "No records found" });
        }
    })
})

router.post("/update_valet_status", function(req, res){
    console.log("body.....", req.body);

    if(req.body.valet_status != 'delivered' && req.body.valet_status != 'awaiting' ){
        valet.findOneAndUpdate({ _id : req.body.valet_id},{$set: { valet_status : req.body.valet_status }},{ new : true }, function(err, response){
            if(!err && response){ 
                res.json({ status: true, data: response });
            }else{
                res.json({ status: false, data: "No records found" });
            }
        })
    }
    else if(req.body.valet_status === 'awaiting')
    {
        valet.findOneAndUpdate({ _id : req.body.valet_id},{$set: { status : 'active', valet_status : req.body.valet_status, pos_valet_id : req.body.pos_valet_id }},{ new : true }, function(err, response){
            if(!err && response){ 
                res.json({ status: true, data: response });
            }else{
                res.json({ status: false, data: "No records found" });
            }
        })
    }
    else{
        valet.findOneAndUpdate({ _id : req.body.valet_id},{$set: { valet_status : req.body.valet_status, current_user_details : {}, pos_valet_id:'', status : 'inactive' }},{ new : true }, function(err, response){
            if(!err && response){ 
                res.json({ status: true, data: response });
            }else{
                res.json({ status: false, data: "No records found" });
            }
        })
    }

 
})


// update valet delivery time

router.post("/update_valet_delivery", function(req, res){
    console.log("body.....", req.body);
        valet.findOneAndUpdate({ qrcode_link : req.body.valet_id, status:'active'},{$set: { delivery_time : req.body.delivery_time, delay:req.body.delay, rdate:req.body.rdate }},{ new : true }, function(err, response){
            if(!err && response){ 
                res.json({ status: true, data: response });
            }else{
                res.json({ status: false, data: "No records found" });
            }
        })
    

 
})

// get_valet_details

router.post("/get_valet_details", function(req, res){
    console.log("body.....", req.body);   

        valet.findOne({ pos_branch_id:req.body.pos_branch_id,"current_user_details.dinamic_user_id": req.body.dinamic_user_id, status: 'active' }, function(err, response){
            console.log("valet response1............",response)
            if(!err && response){ 
                res.json({ status: true, data: response });
                console.log("get true data.........")
            }else{
                res.json({ status: false, data: "No records found" });
                console.log("get false data.........")
            }
        })
   
})

router.post("/get_valet_details_STATUS", function(req, res){
    console.log("body.....", req.body);   

        valet.findOne({ pos_branch_id:req.body.pos_branch_id,"current_user_details.dinamic_user_id": req.body.dinamic_user_id }, function(err, response){
            console.log("valet response1............",response)
            if(!err && response){ 
                res.json({ status: true, data: response });
                console.log("get true data.........")
            }else{
                res.json({ status: false, data: "No records found" });
                console.log("get false data.........")
            }
        })
})

router.post("/razor_rose_webhook", function(req, res){
    console.log(req.body);
    res.json({ status: true, message: "Rose webhook captured..." });
})

router.post("/compress_images", function(req, res){
    console.log(req.body);
    let img_arr = [
        'https://yourstore.io/api/uploads/images/products/5d30013a5c83a702392c4c8b-product-1569671172994-721071.jpeg',
        'https://yourstore.io/api/uploads/images/products/5d30013a5c83a702392c4c8b-product-1569671172992-974205.jpeg'
    ];

    // var compress_images = require('compress-images'), INPUT_path_to_your_images, OUTPUT_path;
 
    // INPUT_path_to_your_images = 'uploads/5d30013a5c83a702392c4c8b-product-1569671172994-721071.jpg';
    // OUTPUT_path = 'build/img/';
    
    // compress_images(INPUT_path_to_your_images, 
    //                 OUTPUT_path, 
    //                 {compress_force: false, statistic: true, autoupdate: true}, false,
    //                 {jpg: {engine: 'mozjpeg', command: ['-quality', '10']}},
    //                 {png: {engine: 'pngquant', command: ['--quality=5-10']}},
    //                 {svg: {engine: 'svgo', command: '--multipass'}},
    //                 {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}},
    //                 function(error, completed, statistic){
    //                     console.log('-------------');
    //                     console.log(error);
    //                     console.log(completed);
    //                     console.log(statistic);
    //                     console.log('-------------');                                   
    //                 });

    const sharp = require('sharp');
    var sizeOf = require('image-size');

    sizeOf('uploads/5d30013a5c83a702392c4c8b-product-1569671172994-721071.jpg', function (err, dimensions) {        
        let width = Math.floor((dimensions.width * (15 / 100)));
        let height = Math.floor(dimensions.height * (15 / 100));

        console.log( width, height);

         sharp('uploads/abstract-1294642_960_720.png')        
        .resize(width, height)
        .toFile('build/img/abstract-1294642_960_720_s.png', (err, info) => { 
            console.log("info...", info);
            console.log("errrr...", err);
        })   
      });       


    console.log('image array length...', img_arr.length);
    res.json({ status: true, message: "Compression completed successfully..." });
})

//save payment_details

router.post("/razorpay_webhook/:branch_id", function(req, res){      
   console.log("params of webhook........",req.params.branch_id); 
     exports.razorpay_webhook = (req, res) => {
        console.log("razorpay_webhook Data.............",res); 
        gateway.findOne({pos_branch_id:req.params.branch_id, status:active}, function(err, response)
        {
            console.log("gateway Data.............",response); 
            if(!err && response)
            {
                console.log("gateway Data.............",response);   
            let gatewayDetails = response;  
            let signature = req.get('x-razorpay-signature');
            let validSignature = Razorpay.validateWebhookSignature(JSON.stringify(req.body), signature,req.params.branch_id);
            console.log("validSignature1.............",validSignature);
            console.log("signature........",req.params.branch_id); 
            if(validSignature) {
                console.log("validSignature2.............",validSignature);
                let orderData = req.body.payload.payment.entity;
                orderData.webhook = true;
 		        console.log("order Data........",orderData); 
                // COMPLETED
                if(orderData.status === 'captured') {
                        let paymentId = orderData.id;                       
                        let orderId = payment_request_id;
                        // payment details
                        let paymentData = {};
                        paymentData.payment_method = "Razorpay";
                        paymentData.order_id =  orderData.id;
                        paymentData.payment_details = orderData;
                        paymentTemp.create(paymentData, function(err, response) { });
                        // payment.updateOne(
                        // { payment_request_id : paymentId },
                        // { $set: { payment_status: 'success', payment_details:orderData } }, function(err, response) {
                        //     console.log("response bill..........", response)
                        //     if(!err && response) {


                               

                        // //     let data =  {
                        // //     "payment_details"  : {
                        // //         "bill_id": billId,
                        // //         "status" : paymentStatus
                        // //     }
                        // //     }

                        // //   let resOptions = { method: 'patch', url:  "https://web.dinamic.io/api/wh/payment", data : data };
                        //         res.json({ status: true });
                        //     }
                        //     else {
                        //   res.json({ status: false, error: err, message: "Failure" });
                        //     }
                        // });
                }
                else {
                    console.log("payment Status.............",orderData.status);
                    res.json({ status: false, message: 'Payment '+orderData.status });
                }
            }
            else {
                console.log("validSignature failed.............",validSignature);
                res.json({ status: false, message: "Invalid signature" });
            }
        }
        else {
            console.log("gateway Data error.............",response);   
            res.json({ status: false, message: "Invalid branch" });
        }
        })


    }

})


module.exports = router;

function randomNumber() {
  let text = "";
  let possible = "0123456789";
  for(let i=0; i<6; i++)
  {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function randomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i=0; i<4; i++)
  {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


function listConnectionNames(auth, token) {
    return new Promise((resolve, reject) => {
        console.log("Google....", google);
        
        const service = google.people({version: 'v1', auth});

        service.people.get({
            resourceName: 'people/me',
            // requestMask:{
            //     includeField: 'phoneNumbers'
            // },
            key: 'AIzaSyBArugRKy2tGTUGLI13ZhWfLwDusKJCadw',
            personFields: 'addresses,emailAddresses,names,phoneNumbers'
        }, (err, res) => {
            if(err){
                console.error('The API returned an error: ' + err);
            }else{
                if(res){
                    resolve(res.data);
                }
            }
        })

        // service.people.connections.list({
        //   resourceName: 'people/me',
        //   pageSize: 10,
        //   personFields: 'names,emailAddresses,phoneNumbers',
        // }, (err, res) => {
        //   if (err) return console.error('The API returned an error: ' + err);
        //   const connections = res.data.connections;
        //   if (connections) {            
        //       resolve(connections);           
        //   } else {
        //     console.log('No connections found.');
        //   }
        // });
    });
 
  }