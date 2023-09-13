const mongoose = require('mongoose');

const constanciaSchema = new mongoose.Schema({
    curso:{
        type: mongoose.Schema.ObjectId,
        ref: 'Cursos',
        required: [true,"Una constancia debe de tener un curso"],
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: [true,"Una constancia debe de tener un usuario"],
    },
    folio:{
        type: String,
        unique: true
    },
    constancias:{
        iktanUrl:{
            type: String,
            required: true,
        },
        dc3Url:{
            type: String,
            required: true,
        },
    },
    createdAT:{
        type: Date,
        default: Date.now()
    },
})

constanciaSchema.pre(/^find/,function(next){
    this.populate({
        path: 'curso',
    })
    this.populate({
        path: 'user',
    })
    next();
})

function generarRandom(num) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let resultado = "";
    let ch;
    while (resultado.length < num){
        ch = characters.charAt(Math.floor(Math.random() * charactersLength));
        if (!resultado.includes(ch)){
            resultado += ch;
        }
    }
    return resultado;
}


const Constancia = mongoose.model("Constancias", constanciaSchema);

module.exports = Constancia;