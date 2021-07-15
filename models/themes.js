const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({    
    theme: {
        pos_rest_id: { 
            type: String,
            default: ""
        },
        isDefaultTheme: { 
            type: Boolean, 
            default: true 
        },
        navbarColor: { 
            type: String, 
            default: "#232323" 
        },
        navbarText: { 
            type: String,
            default: "#ffffff",
        },
        primaryButtonColor: { 
            type: String,
            default: "#69499b"
        },
        primaryButtonText: { 
            type: String,
            default: "ffffff" 
        },
        secondaryButtonColor: { 
            type: String,
            default: "#ffcf34"
        },
        secondaryButtonText: { 
            type: String,
            default: "#ffffff"
        },
        disabledButtonColor: { 
            type: String,
            default: "#616161"
        },
        disabledButtonText: { 
            type: String,
            default: "#ffffff"
        },
        spinnerColor: { 
            type: String,
            default: "#232323"
        },
    },
    homepage: {
        pos_rest_id: { 
            type: String,
            default: ""
        },
        isDefaultHomepage: { 
            type: Boolean,
            default: true
        },
        header: { 
            type: String,
            default: "Welcome"
        },
        subHeader: { 
            type: String,
            default: "Start by selecting your desired option"
        },
        headerStatus: { 
            type: Boolean,
            default: true
        },
        billHeader: { 
            type: String,
            default: "View Bill"
        },
        billSubheader: { 
            type: String,
            default: "No orders placed"
        },
        billImage: { 
            type: String,
            default: "/uploads/default/billImage.svg" 
        },
        billStatus: { 
            type: Boolean,
            default: true
        },
        helpHeader: { 
            type: String,
            default: "Need Help?" 
        },
        helpSubheader: { 
            type: String,
            default: "Call a Waiter" 
        },
        helpImage: { 
            type: String,
            default: "/uploads/default/helpImage.svg" 
        },
        helpStatus: { 
            type: Boolean,
            default: true 
        },
        vehicleHeader: { 
            type: String,
            default: "Call for Vehicle" 
        },
        vehicleSubheader: { 
            type: String,
            default: "Valet Parking" 
        },
        vehicleImage: { 
            type: String,
            default: "/uploads/default/vehicleImage.svg" 
        },
        vehicleStatus: { 
            type: Boolean,
            default: true 
        },
        offerHeader: { 
            type: String,
            default: "View Offers"
        },
        offerSubheader: { 
            type: String,
            default: "No offers available"
        },
        offerImage: { 
            type: String,
            default: "/uploads/default/offerImage.svg"
        },
        offerStatus: { 
            type: Boolean,
            default: true 
        },
        exitHeader: { 
            type: String,
            default: "Exit"
        },
        exitSubheader: { 
            type: String,
            default: "Scan again" 
        },
        exitImage: { 
            type: String,
            default: "/uploads/default/exitImage.svg" 
        },
        exitStatus: { 
            type: Boolean,
            default: true 
        },
    },
    isDefault: { 
        type: Boolean,
        default: true
    },
    pos_rest_id: { 
        type: String,
        default: ""
    },
    created_on: { 
        type: Date,
        default: Date.now() 
    }
})

module.exports = mongoose.model('themes', themeSchema);