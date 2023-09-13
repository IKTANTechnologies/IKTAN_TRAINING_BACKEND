const mongoose = require('mongoose');
const Curso = require('./Curso');
const Modulo = require("./Modulo")
const tareaSchema= mongoose.Schema({
    modulo:{
    
            type: mongoose.Schema.ObjectId,
            //Siempre se hace referencia al nombre de la coleccion y no al modelo
            ref: 'Modulos',
            required: [true, "Un modulo debe de tener un curso"]
    },
    tema:{
        type: String,
        trim: true,
        minlength: [4, "Eĺ tema de la tarea debe de tener minimo 4 caracteres"],
        maxlength: [300, "Eĺ tema de la tarea debe de tener maximo 300 caracteres"],
        required: [true, "Un tarea debe de tener un tema"]
    },
    titulo:{
        type: String,
        required : [true,"Una tarea debe de tener un titulo"],
        trim: true,
        minlength: [4, "El titulo de la tarea debe de tener como minimo 4 caracteres"],
        maxlength: [300, "Eĺ titulo de la tarea debe de tener como maximo 300 caracteres"]
    },
    instruccion:{
        type: String,
        required : [true,"Una tarea debe de tener una instruccion"],
        trim: true,
        minlength: [4, "La instruccion de la tarea debe de tener como minimo 4 caracteres"],
        maxlength: [300, "La instruccion de la tarea debe de tener como maximo 300 caracteres"]
    },
    formatoEntrega:{
        type: String,
        required : [true,"Una tarea debe de tener un formato de entrega"],
        trim: true,
        minlength: [3, "El formato de entrega de la tarea debe de tener como minimo 4 caracteres"],
        maxlength: [300, "Eĺ formato de entrega de la tarea debe de tener como maximo 300 caracteres"]
    },
    materiales:[{
        material: {
            titulo:{
                type: String,
                trim: true,
                minlength: [4, "El nombre del material de la tarea debe de tener como minimo 4 caracteres"],
                maxlength: [300, "El nombre del material de la tarea debe de tener como maximo 300 caracteres"]
            },
            url:{type: String},
            key:{type: String}
        } 
    }],
    activo:{
        type: Boolean,
        default: true
    }
})
tareaSchema.post('save',async function(){
    console.log(this.modulo)
    console.log(this._id)
    const modulo = await Modulo.findById(this.modulo)
    console.log(modulo)
    let tarea = []
    tarea =modulo.tareas;
    tarea.push(this._id)
    console.log(tarea)
    if(modulo) {
        const doc = await Modulo.findByIdAndUpdate(this.modulo,  {
            tareas: tarea
        });
    }
})

const Tarea = mongoose.model("Tareas", tareaSchema);

module.exports = Tarea;