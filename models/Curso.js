const mongoose = require('mongoose');
const slugify = require('slugify');

const cursoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "Un curso debe de tener un nombre"],
        unique: true, 
        trim: true,
        minlength: [3, "El nombre del curso debe de tener como minimo 3 caracteres"],
        maxlength: [300,"El nombre del curso debe de tener como maximo 300 caracteres"],
        //validate: [validator.isAlpha,"El nombre del tour solo puede contener letras"]
    },
    duracion:{ 
        type: Number,
        required: [true, "Un curso debe de tener una duracion"],
        min: [1, "La duracion minima de un curso es de 1 hora"],
        max: [100, "La duracion maxima de un tour es de 100 horas"]
    },
    resumen:{
        type: String,
        required: [true,"Un curso debe de tener una descripcion"],
        minlength: [3, "El resumen debe de tener como minimo 50 caracteres"],
        maxlength: [3000, "El resumen debe de tener como maximo 1000 caracteres"],
        trim: true
    },
    fechaInicio:{
        type: Date,
        //required: true,
    },
    fechaFinalizacion:{
        type: Date,
        //required: true,
    },
    precio: {
        type: Number,
        required: [true,"Un curso debe de tener un precio"]
    },
    //Precio con Descuento
    precioDescuento:{
        type: Number,
    },
    tamanoMaximoGrupo:{ //Tamaño del grupo
        type: Number,
        required: [true,"Un curso debe de tener el tamaño del grupo"],
        min: [5,"El tamaño de un grupo minimo es de 5"],
        max: [50,"El tamaño maximo de un grupo es de 50"]
    },
    areaTematica:{
        type: String,
        required: [true, "Un curso debe de tener un area tematica"],
        minlength: [3,"La area tematica debe de tener como minimo 3 caracteres"],
        maxlength: [60,"La area tematica debe de tener como minimo 60 caracteres"],
    },
    calificacionPromedio: { //Se creara un campo para el promedio de la calificacion y un campo para la cantidad de calificaciones sera un modelo completamente diferente
        type: Number,
        default: 5.0,
        min: [1,"La calificacion minima debe de ser de 1.0"],
        max: [5, "La calificacion maxima debe de ser 5.0"],
        set: val => Math.round(val*10)/10
    },
    cantidadCalificaciones:{
        type: Number,
        default: 0,
    },
    //Diferentes fechas cuando se dara el curso en todo el año
    startDates:[Date],
    slug: String,
    imagenCover:{
        url:{
            type: String,
            default: "https://geekflare.com/wp-content/uploads/2021/09/520401-pure-black-background-wallpaper.jpg"
        },
        key:{
            type: String,
        }
    },
    banner:{
        url:{
            type: String,
            default: "https://geekflare.com/wp-content/uploads/2021/09/520401-pure-black-background-wallpaper.jpg"
        },
        key:{
            type: String,
        }
    },
    trailer:{
        url:{
            type: String,
            default: "https://geekflare.com/wp-content/uploads/2021/09/520401-pure-black-background-wallpaper.jpg"
        },
        key:{
            type: String,
        }
    },
    imagenes: [{
        url:{
            type: String,
        },
        key:{
            type: String,
        }
    }],
    tipoCurso:{
        type:String,
        required: [true, "Un curso debe de tener un tipo curso"],
        enum: ["En linea", "Aprende a tu ritmo"],
    },
    evaluacionInicial: {
        link:{
            type: String,
            default: "0"
        },
        activo:{
            type: Boolean,
            default: true
        }     
    },
    evaluacionFinal:{
        link:{
            type: String,
            default: "0"
        },
        activo:{
            type: Boolean,
            default: true
        }   
    },
    repositorioInformacion: [
        {
            nombre:{
                type: String,
                trim: true,
                minlength: [2, "El nombre de  un archivo deben de tener como minimo 2 caracteres"],
                maxlength: [300, "El nombre de un archivo deben de tener como maximo 300 caracteres"]
            },
            archivoMaterial:{
                url:{type: String},
                key:{type: String}
            },
        }
    ],
    archivoTemario:{
        url:{type: String},
        key:{type: String}
    },
    modulos:[
        {
            type: mongoose.Schema.ObjectId,
            //Siempre se hace referencia al nombre de la coleccion y no al modelo
            ref: 'Modulos'
        }
    ],
    //sera el tiempo en que el usuario crea un curso
    createAt:{
        type: Date,
        default: Date.now(),
        select: false
    },
    
    //Campo secreto y no queremos que se muestre
    cursoSecreto: {
        type: Boolean,
        default: false
    },
    activo:{
        type: Boolean,
        default: true
    },
    finalizado:{
        type: Boolean,
        default: false
    },

    iktan:{
        logoIzquierdo:{
            url:{type: String},
            key:{type: String}
        },
        logoDerecho:{
            url:{type: String},
            key:{type: String}
        },
        logoFondo:{
            url:{type: String},
            key:{type: String}
        },
        capacitadorUno:
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Usuarios',
            required: [true,"Un curso debe de tener un capacitador Uno en las constancias de IKTAN"]
        },
        capacitadorDos:
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Usuarios',
            required: [true,"Un curso debe de tener un capacitador Dos en las constancias de IKTAN"]
        },
        descripcion:{
            type: String,
            required: [true,"Un curso debe de tener una descripcion"],
            minlength: [3, "La descirpcion debe de tener como minimo 50 caracteres"],
            maxlength: [500, "La descripcion debe de tener como maximo 500 caracteres"],
            trim: true
        },    },
    dc3:{
        logoIzquierdo:{
            url:{type: String},
            key:{type: String}
        },
        logoDerecho:{
            url:{type: String},
            key:{type: String}
        },
        capacitador:
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Usuarios',
            required: [true,"Un curso debe de tener un capacitador en las DC-3"]
        },
    },
    linkComprarCurso: String
},
//Este apartado solo es para que cuando se manden los datos agregue las propiedades virtuales
//Pero laspropiedades virtuales jamas se almacenan hacen el procedimiento aqui y se mandan
    {
        toJSON:{virtuals: true},
        toObject:{virtuals:true}
    }
);

//CREACION DE INDICES
//Los indices son bien importantes ya que cuando hacemos una query se busca por todos los documento y si utilizamos indices en un campo
//Solo lo busca por indices si buscabas 2 documentos y existen 10 solo escaneara 2 documento, pero sin los incices
//Digamos que existen 100 documentos debe de escanear los 100 documento y luego encontrar lo que solicita
//Afecta mucho al performance
//tourSchema.index({price: 1});
//Indices compuestos, cuando en la query se buscan por 2 campos
cursoSchema.index({precio:1}, {calificacionPromedio:-1});
cursoSchema.index({slug:1});
/*
//VIRTUAL PROPIEDADES
cursoSchema.virtual('DuracionSemanas').get(function(){
    return this.duration/7
}); */

//asignando reseñas populate
cursoSchema.virtual('reviews',{
    ref: 'reviews',
    foreignField: "curso",
    localField: "_id"
})
//MIDDLEWARE DOCUMENT
//Antes de que se guarde en la base de datos hazme esto
//Se ejecuta antes del comando create() y save() pero no en insertMany
cursoSchema.pre('save', function(next){
//Le asignaremos al documento una propiedad
this.slug = slugify(this.nombre,{  lower: true })
next();
})
/*
cursoSchema.pre("save",async function(next){
    const curso = this;
    const producto = createProductoStripe(curso);
    const precio =asignarPrecioProductoStripe(curso);
    const link = createLinkPagoProducto(curso);
    const respuestas = await Promise.all([producto,precio,link]);
    console.log(respuestas);

});*/
/*
//Incrustando capacitadores por ID
cursoSchema.pre('save',async function(next){
    const capacitadoresPromesas = this.capacitadores.map(async id=>await User.findById(id))
    this.capacitadores = await Promise.all(capacitadoresPromesas)
    next();
}) */

//QUERY MIDDLEWARE
//Para practica en nuestro squema tenemos un apartado llamado cursoSecret y nadie lo puede ver
cursoSchema.pre(/^find/,function(next){
    //Cuando se haga una busqueda me vas a buscar todos los tours exepto los que tengan un cursoSecret en true
    this.find({cursoSecreto:{$ne: true}})
    this.tiempoDeConsulta = Date.now();
    next();
})
//Para el populate en donde todos los id que tengamos en  capacitadores se nos deplegara su info cuando hagamos la consulta
cursoSchema.pre(/^find/, function(next){
    
    this.populate({
        path: 'iktan.capacitadorUno',
        select: '-__v -contraseñaActualizadaAt'
    })
    this.populate({
        path: 'iktan.capacitadorDos'
    })
    this.populate({
        path: 'dc3.capacitador'
    })
    this.populate({
        path: 'modulos'
    })
    next();
})

cursoSchema.post(/^find/,function(docs,next){
    console.log(`Se tardo: ${Date.now() - this.tiempoDeConsulta} milisegundos`)
    //console.log(docs)
    next();
})


//AGGREGATION MIDDLEWARE
/*
tourSchema.pre('aggregate', function(next){
    //Con this.pipeline() podemos acceder a todo el objeto que esta en aggregate qu eya tenemos configurado
    //El metodo unshift() agregara un nuevo dato a una matriz
    this.pipeline().unshift({
        //Que coincida con $match
        $match:{ tourSecreto: {$ne: true}}
    })
    //console.log(this.pipeline())
    next();
})*/

const Curso =  mongoose.model('Cursos', cursoSchema);
module.exports = Curso;
