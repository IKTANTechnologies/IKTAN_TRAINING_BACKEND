const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    curso:{
        type: mongoose.Schema.ObjectId,
        ref: 'Cursos',
        required: [true,"Un booking debe de tener un curso"]
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: [true,"Un booking debe de tener un usuario"]
    },
    precio:{
        type: Number,
        required: [true,"Un booking debe de tener un precio"]
    },
    cantidad:{
        type: Number,
        required: [true,"Un booking debe de tener una cantidad"]
    },
    createdAT:{
        type: Date,
        default: Date.now()
    },
    pagado:{
        type: Boolean,
        default: true
    }

})

bookingSchema.pre(/^find/,function(next){
    this.populate({
        path: 'curso',
    })
    this.populate({
        path: 'user'
    })
    next();
})
const Booking = mongoose.model("booking", bookingSchema);

module.exports = Booking;