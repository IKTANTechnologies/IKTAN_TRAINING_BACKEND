const mongoose = require('mongoose');
const Curso = require('./Curso')
const moduloSchema= mongoose.Schema({
    curso:{
        type: mongoose.Schema.ObjectId,
        ref: 'Cursos',
        required: [true, "Un modulo debe de tener un curso"]
    },
    idCurso:{
        type: String
    },
    nombre:{
        type: String,
        required : [true,"Un modulo debe de tener un nombre"],
        trim: true,
        minlength: [2, "Eĺ nombre del modulo debe de tener minimo 2 caracteres"],
        maxlength: [300,"La descripcion debe de tener como maximo 300 caracteres"],
    },
    numero:{
        type:Number,
        required: [true, "Un modulo debe de tener un numero"],
        min: [1,"El numero del modulo como minimo es uno"],
        max: [50, "El numero del modulo como maximo es 50"],
    },
    fechaInicio:{
        type: Date,
        required:[true,"Un modulo debe de tener un fecha de inicio"]
    },
    imagenCover:{
        url:{type: String},
        key:{type: String}
    },
    descripcionCard:{
        type: String,
        required: [true,"Un modulo debe de tener una descripcion card"],
        minlength: [2,"La descripcion debe de tener como minimo 2 caracteres"],
        maxlength: [800,"La descripcion debe de tener como maximo 300 caracteres"],
        trim: true,
    },
    archivoTemario:{
        url:{type: String},
        key:{type: String}
    },
    materiales: [
        {
            nombre:{
                type: String,
                trim: true,
                required: [true, "Los materiales debe de tener un nombre"],
                minlength: [2, "El nombre de los materiales deben de tener como minimo 2 caracteres"],
                maxlength: [300, "El nombre de los materiales deben de tener como maximo 300 caracteres"]
            },
            archivoMaterial:{
                url:{type: String},
                key:{type: String}
            }
        }
    ],
    reunion:{
        nombre:{
            type: String,
            required:[true,"La reunion debe de tener un nombre"],
            minlength:[2,"El nombre de la reunion debe de tener como minimo 2 caracteres"],
            maxlength: [300,"El nombre de la reunion debe de tener como maximo 300 caracteres"],
            trim: true,
        },
        link:{
            type: String
        }
    },
    tareas:[{
        tarea:{
            type: mongoose.Schema.ObjectId,
            ref: "Tarea"}
    }],
    puntosTotal:{
        type: Number
    },
    activo: {
        type:Boolean,
        default: true,
    } 
})

moduloSchema.pre(/^find/, function(next){
    this.populate({
        path: 'curso',
        select: '-modulos'
    })
    next();
})

moduloSchema.pre(/^find/, function(next){
  
    this.populate({
        path: 'tareas'
    })
    next();
})

moduloSchema.post('save',async function(){
    const curso = await Curso.findById(this.curso);
    if(!curso.modulos){
        await Curso.findByIdAndUpdate(this.curso,{
            modulos:[this._id]
        })    
    }else{
        const modulos = [];
        curso.modulos.forEach(element => {
            modulos.push(element)
        });
        modulos.push(this._id);
        await Curso.findByIdAndUpdate(this.curso,{modulos}) 
    }
})





const Modulo = mongoose.model("Modulos", moduloSchema);

module.exports = Modulo;