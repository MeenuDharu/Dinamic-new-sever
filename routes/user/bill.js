const mongoose = require('mongoose');
const router = require('express').Router();
const request = require('request');
const tableMetadata = require("../../models/table_metadata");
const payment = require("../../models/payment");
const paymentTemp = require("../../models/payment_temp");
const apiService = require('../../services/api');
const Insta = require('instamojo-nodejs');
const instaService = require("../../config/instamojo");
const mailService = require("../../services/mail");
const Razorpay = require('razorpay');
const table = require("../../models/table");
const gateway = require("../../models/pay_gateway_details");
const branch = require("../../models/branch");
/* Bill Confirm */
router.post("/confirm", function(req, res) {
    console.log("base url *****************",req.body );
    let billOptions = {
        method: 'put',
        body: req.body,
        json: true,
        url: req.body.dinamic_details.pos_base_url+apiService.pos_bill_confirm,
        headers: {
            Authorization: req.headers['authorization'],
            'Content-Type': 'application/json'
        }
    };
    // POS bill confirm
    request(billOptions, function (err, response) {
        console.log("))(*&^", response.statusCode , "#$%^&*", response.body);    
        if(!err && response.body.status && (response.statusCode==201 || response.statusCode==200))
        {
            // close session
            tableMetadata.updateOne(
            { table_id: mongoose.Types.ObjectId(req.body.dinamic_details.table_id), status: 'active' },
            { $set: { status: 'completed' } }, function(err, response) {
                console.log("response bill..........", response)
                if(!err && response) {
                    res.json({ status: true });
                }
                else {
                    res.json({ status: false, error: err, message: "Failure" });
                }
            });
        }
        else {       
            console.log("response of status.....",response.status)
            res.status(response.status).json(response.body);
        }
    });
});

// proceedtopay
router.post("/proceedtopay", function(req, res) {
    console.log("payment body............", req.body.cart_total);
    const amount = parseInt((req.body.cart_total.replace(',','')))
   
    console.log("payment amount............", amount);
    let orderAmount = ((amount).toFixed(2))*1;

    //let orderAmount1 = ((req.body.amount).toFixed(2))*1;
    let razorOrderAmt = parseInt(amount*100);
    console.log('razorOrderAmt...................', razorOrderAmt)
    gateway.findOne({pos_branch_id: req.body.pos_branch_id}, function(err, response)
    {
        console.log("response payment...........",response)
        let instance = new Razorpay({
            "key_id" : response.key_id,
            "key_secret" : response.key_secret
        });

        let options = {
            amount: razorOrderAmt,
            currency: 'INR',
            receipt: req.body.order_number,
            payment_capture: '1'
        };
        instance.orders.create(options, function(err, orderData) {
            if(!err && orderData) {
                let sendData = {
                    razorpay_response: orderData,
                    order_number: req.body.order_number,
                    order_id: req.body.bill_id,
                    currency: 'INR',
                    amount: orderAmount
                };
                res.json({ status: true, data: sendData });
            }
            else {
                callback(err, "Order creation error");
            }
        });

    })

  
});

// getpaymentrequeststatus

router.post("/getpaymentrequeststatus/:branch_id/:id", function(req, res) {

    // console.log("payment request id", req.body.payment_request_id);

    // Insta.setKeys(instaService.api_key, instaService.auth_key);
    // Insta.isSandboxMode(true);

    // Insta.getPaymentRequestStatus(req.body.payment_request_id, function(err, response) {

    //     //  console.log(response);
    //     res.json({ status: true, data: response });
    // });
    // let instance = new Razorpay({
    //     "key_id" : "rzp_test_CQibMXqHAMXLLN",
    //     "key_secret" : "Rh85oX5onypUtFsbdvSMkUQT"
    // });

    console.log("params........",req.params.id)
    console.log("params2........",req.params.branch_id);

        gateway.findOne({pos_branch_id:req.params.branch_id}, function(err, response)
    {
        if(!err && response){ 
        let instance = new Razorpay({
            "key_id" : response.key_id,
            "key_secret" : response.key_secret
        });
        instance.payments.fetch(req.body.razorpay_payment_id, function(err, orderData) {
            console.log("payment Status...........", orderData)
            if(!err && orderData) {                
               // res.json({ status: true, data: orderData });
                payment.updateOne(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $set: { payment_status: 'success', payment_details:orderData } }, function(err, response) {
                        console.log("response bill..........", response)
                        if(!err && response) {
                        res.writeHead(301, {Location: orderData.notes.userBaseURL+"/#/checkout/payment-confirm?payment_id="+req.params.id});
                        res.end();
                        }
                        else {
                        // res.json({ status: false, error: err, message: "Failure" });
                        }
                    });

               // res.writeHead(301, {Location: "localhost:4200/#/checkout/checkout/payment-confirm?type=giftcard&order_id="+couponDetails._id});
                                                  //  res.end();
            }
            else {
              //  res.json({ status: false, error: err });
                payment.updateOne(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $set: { payment_status: 'failed', payment_details:orderData } }, function(err, response) {
                        console.log("response bill..........", response)
                        if(!err && response) {
                            res.writeHead(301, {Location: orderData.notes.userBaseURL+"/#/checkout/payment-confirm?payment_id="+req.params.id});
                            res.end();
                        }
                        else {
                           // res.json({ status: false, error: err, message: "Failure" });
                        }
                    });

            }
        });
    }
    else
    {
        res.json({ status: false, error: err });    
    }
    })

    
 

});

// save payment_details

router.post("/payment_details", function(req, res){
    console.log("payment details....", req.body);

    let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+req.body.user_name+",</p><p>Your order "+req.body.order_id+" placed at Char has been confirmed.</p><p>Your payment of Rs. "+req.body.amount+" made on ---------------- has been processed successfully. Your order will be ready for pickup shortly.</p><p>Thank for using DiNAMIC. A revolution in digital interaction.</p></body></html>";
    //let bodyContent = "<!DOCTYPE html><html><body><p>Hi "+req.body.user_name+",</p><p>Your order "+req.body.order_id+" placed at Char has been confirmed.</p><p>Your payment of Rs. "+req.body.payment_details.amount+" made on "+req.body.payment_details.created_at+" has been processed successfully. Your order will be ready for pickup shortly.</p><p>Thank for using DiNAMIC. A revolution in digital interaction.</p></body></html>";
    let sendData = {
        sendTo: req.body.email,
        subject: 'ORDER CONFIRMED',
        body: bodyContent
    };
    // mailService.sendMailTo(sendData, function(err, response) {
    //    console.log("response..........", response)
    // });
            
            let newPayment = new payment(req.body);
            newPayment.save(function(err,response){
                if(!err && response) {
                    console.log(response);
                    res.json({ status: true, message: "payment details saved successfully.", payment_details: response });
                }else{
                    console.log(response);
                    res.json({ status: false, error: err, message: "payment Failed" });
                }   
        
            })
})

router.post("/get_payment_details/", function(req, res){
    console.log("payment details....", req.body);
    payment.findOne({_id:mongoose.Types.ObjectId(req.body.id)}, function(err, response)
    {  
        console.log("response get payment details........", response)      
        if(!err && response){ 
            res.json({ status: true, data: response });
            
        }
        else
        {
            res.json({ status: false, error: err }); 
        }
    })

})






module.exports = router;