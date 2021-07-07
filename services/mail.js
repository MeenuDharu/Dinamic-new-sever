const nodemailer = require('nodemailer');
const mail = require("../config/mail");

exports.sendMailTo = function(jsonData, callback) {

    let transporter = nodemailer.createTransport({
        // host: mail.host,            
        // port: 465,
        // secure: false,
        // auth: {
        //     user: mail.username,
        //     pass: mail.password
        // },
        // tls: { rejectUnauthorized: false }
        host: 'lin.ezveb.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        transportMethod: 'SMTP',
        auth: {
            user: mail.username,
            pass: mail.password
        }
    });

    let mailOptions = {
        from: mail.send_from,
        to: jsonData.sendTo,
        subject: jsonData.subject,
        html: jsonData.body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(!err && info) {
            callback(null, info);
        }
        else {
            callback(err, 'Mail send failed');
        }
    });

}

exports.c_sendMailTo = function(jsonData, callback) {

    let transporter = nodemailer.createTransport({
        host: mail.host,            
        port: 25,
        secure: false,
        auth: {
            user: mail.c_username,
            pass: mail.c_password
        },
        tls: { rejectUnauthorized: false }
    });

    let mailOptions = {
        from: mail.c_send_from,
        to: jsonData.sendTo,
        subject: jsonData.subject,
        html: jsonData.body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(!err && info) {
            callback(null, info);
        }
        else {
            callback(err, 'Mail send failed');
        }
    });

}