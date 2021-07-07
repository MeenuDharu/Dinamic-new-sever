const config = {
    development: {
        // credentials: 'mongodb://172.16.1.252/dinamic_admin'
        // credentials: 'mongodb://dine_admin:Dinamic*1@151.106.7.18:27017/dinamic_admin'
        credentials: 'mongodb://dine_admin:Dinamic*1@fabloe.in:27017,151.106.7.74:27017/dinamic_admin?replicaSet=mongodineamik&readPreference=nearest'

    },
    production: {
        // credentials: 'mongodb://dine_admin:Dinamic*1@122.15.146.119:27017/dinamic_admin'
        credentials: 'mongodb://dine_admin:Dinamic*1@fabloe.in:27017,151.106.7.74:27017/dinamic_admin?replicaSet=mongodineamik&readPreference=nearest'
    }
};

module.exports = config;