const mongoose = require('mongoose');
const router = require('express').Router();
const request = require('request');
const apiService = require('../../services/api');
const table = require("../../models/table");
const dbConfig = require('./../../config/database');

// WEB APP
router.post("/web/restaurant_details", function(req, res) {
 console.log("body....", req.body);

console.log("testing ---------------");
    table.aggregate([
        { $match:
            { access_code: req.body.code, status: 'active' }
        },
        { $lookup:
            {from: "restaurants", localField: "restaurant_id", foreignField: "_id", as: "restaurant"}
        }
    ], function(err, response) {
      console.log("response --------------",response);
      console.log("error --------------",err)
        if(!err && response[0])
        {
            // update scan count
            if(req.body.id==='q') {
                table.updateOne({ _id: response[0]['_id'] }, { $inc: { qr_count: +1 } }, function(err, response) {});
            }
            else if(req.body.id==='n') {
                table.updateOne({ _id: response[0]['_id'] }, { $inc: { nfc_count: +1 } }, function(err, response) {});
            }
            let baseURL = req.body.baseURL
          
            // DiNAMIC restaurant details
            let dineData = {             
                pos_base_url: baseURL,
                //restaurant_id: response[0]['restaurant'][0]['_id'],
                branch_id: response[0]['branch_id'],
                table_type: response[0]['type'],
                table_id: response[0]['_id']
            };

            console.log("base URL......", baseURL)
            // POS restautant details
            let resOptions = { method: 'get', url: baseURL+response[0]['table_api'] };
            // let resOptions = { method: 'get', url: 'https://web.dinamic.io/api/'+response[0]['table_api'] };
            console.log("resoption...", resOptions)

            
            request(resOptions, function (err, response) {
            console.log("get response1..........",response);
            console.log("get response..........",response.statusCode);
                if(!err && response.body && response.statusCode==200) {
                    let restaurantData = JSON.parse(response.body);
                    restaurantData.dinamic_details = dineData;
                    res.status(response.statusCode).json(restaurantData);
                }
                else {
                    res.status(response.statusCode).json(response.body);
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid Table" });
        }
    });
});

// MOBILE APP
router.post("/mobile/restaurant_details", function(req, res) {
    table.aggregate([
        { $match:
            { access_code: req.body.code, status: 'active' }
        },
        { $lookup:
            {from: "restaurants", localField: "restaurant_id", foreignField: "_id", as: "restaurant"}
        }
    ], function(err, response) {
        if(!err && response[0])
        {
            // update scan count
            if(req.body.id==='q') {
                table.updateOne({ _id: response[0]['_id'] }, { $inc: { qr_count: +1 } }, function(err, response) {});
            }
            else if(req.body.id==='n') {
                table.updateOne({ _id: response[0]['_id'] }, { $inc: { nfc_count: +1 } }, function(err, response) {});
            }

            // DiNAMIC restaurant details
            let dineData = {
                pos_base_url: response[0]['restaurant'][0]['base_url'],
                restaurant_id: response[0]['restaurant'][0]['_id'],
                branch_id: response[0]['branch_id'],
                table_type: response[0]['type'],
                table_id: response[0]['_id']
            };

            // POS restautant details
            let resOptions = { method: 'get', url: response[0]['restaurant'][0]['base_url']+response[0]['table_api'] };
            request(resOptions, function (err, response) {
                if(!err && response.body && response.statusCode==200)
                {
                    let restaurantData = JSON.parse(response.body);
                    restaurantData.dinamic_details = dineData;

                    // POS social login
                    let posData = {};
                    if(dineData.table_type=="location") {
                        posData = {
                            branch_id: restaurantData.branch_details[0]._id,
                            floor_id: restaurantData.table_detail.floor_id,
                            table_id: restaurantData.table_detail._id,
                            customer_details: req.body.customer_details
                        };
                    }
                    else {
                        let orderId = orderIdGenerator();
                        restaurantData.dinamic_order_id = orderId;
                        posData = {
                            branch_id: restaurantData.branch_details[0]._id,
                            order_id: orderId,
                            customer_details: req.body.customer_details
                        };
                    }
                    let posOptions = { method: 'post', body: posData, json: true, url: dineData.pos_base_url+apiService.pos_login };
                    request(posOptions, function (err, response) {
                        if(!err && response.body.status && response.statusCode==200)
                        {
                            restaurantData.dinamic_token = response.body.token;

                            //DiNAMIC session
                            let sessionData = {
                                dinamic_details: dineData,
                                customer_details: req.body.customer_details
                            };
                            let sessionOptions = { method: 'post', body: sessionData, json: true, url: apiService.user_session };
                            request(sessionOptions, function (err, response) {
                                if(!err && response.body.status && response.statusCode==200)
                                {
                                    restaurantData.dinamic_points = response.body.reward_points;
                                    restaurantData.dinamic_session_id = response.body.dinamic_session_id;
                                    res.status(response.statusCode).json(restaurantData);
                                }
                                else {
                                    res.status(response.statusCode).json(response.body);
                                }
                            });
                        }
                        else {
                            res.status(response.statusCode).json(response.body);
                        }
                    });
                }
                else {
                    res.status(response.statusCode).json(response.body);
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid Table" });
        }
    });
});

module.exports = router;

function orderIdGenerator() {
    let now = new Date();
    let timestamp = now.getFullYear().toString();
    timestamp += (now.getMonth() < 9 ? '0' : '') + now.getMonth().toString();
    timestamp += (now.getDate() < 10 ? '0' : '') + now.getDate().toString();
    timestamp += (now.getHours() < 10 ? '0' : '') + now.getHours().toString();
    timestamp += (now.getMinutes() < 10 ? '0' : '') + now.getMinutes().toString();
    timestamp += (now.getSeconds() < 10 ? '0' : '') + now.getSeconds().toString();
    timestamp += (now.getMilliseconds() < 10 ? '0' : '') + now.getMilliseconds().toString();
    return `TA${timestamp}`;
}