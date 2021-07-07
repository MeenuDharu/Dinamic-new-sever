const mongoose = require('mongoose');
const router = require('express').Router();
const request = require('request');
const apiService = require('../../services/api');
const table = require("../../models/valet");


router.post("/valet", (req, res) => {  
   console.log("valet...................",req.body); 
});