// const environment = 'development';
const environment = 'production';

let hostName = "https://www.dinamic.io:4000";
if(environment === 'development') {
	hostName = "http://172.16.1.34:4000";
}

let apiUrl = {
	user_session: hostName+"/user/session/add",
	pos_bill_confirm: "/oms/bills",
	pos_login: "/auth/sociallogin"
}

module.exports = apiUrl;