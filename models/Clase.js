const mongoose = require("mongoose")

const claseSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required:[true,"Una clase debe de tener un nombre"],
        minlength:[3,"El nombre de la clase debe de tener como minimo 3 caracteres"],
        maxlength:[300,"El nombre de la clase debe de tener como minimo 300 caracteres"]
    },
    descripcion:{
        type:String,
        required:[true,"Una clase debe de tener una descripcion"],
        minlength:[3,"La descripcion de la clase debe de tener como minimo 3 caracteres"],
        maxlength:[300,"La descripcion de la clase debe de tener como minimo 300 caracteres"]
    },
    actividad:{
        nombre:{
            type:String,
            required:[true,"Una clase debe de tener una actividad"],
            minlength:[3,"El nombre de la actividad debe de tener como minimo 3 caracteres"],
            maxlength:[300,"El nombre de la actividad debe de tener como minimo 300 caracteres"]
        },
        url:{
            type:String,
        },
        key:{
            type:String,
        },
    },
    video:{
        url:{
            type:String,
        },
        key:{
            type:String,
        },
    },
})

const Clase = mongoose.model("Clases", claseSchema)
module.exports = Clase