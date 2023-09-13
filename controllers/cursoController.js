const Curso = require('../models/Curso');
const catchAsync = require('../utils/catchAsync');
//Fabrica de funciones
const {updateOne, createOne, getOne, getAll} = require("../controllers/handleFactory");
const AppError = require('../utils/AppError');
//Modulo para la carga de archivos desde el cliente al servidor
const multer = require('multer');
//Modulo para modificar el tamaño de la photo user
const sharp = require('sharp');
const Archivo = require('../utils/archivo');
const Aws = require('../utils/aws')
/*
//Manejar los archivos de imagen
//Disco de la memoria lo usamos si no necesitamos procesamiento de imagenes
const multerStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null,'public/img/users')
    },
    filename: (req,file,cb)=>{
        const extension = file.mimetype.split('/')[1];
        cb(null,`user-${req.user.id}-${Date.now()}.${extension}`)
    }
});*/

//Es mejor manejar la imagen en la memoria
const multerStorage = multer.memoryStorage();
//Comprobar si el archivo subido es una imagen
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('image') ||
     file.mimetype.startsWith('video/mp4')){
        cb(null,true)
    }else{
        //Le pasamos un error
        cb(new AppError("No es una imagen. Porfavor cargue solo imagenes",400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

const uploadCursoImages = upload.fields([
    {name:"imagenCover", maxCount: 1},
    {name:"imagenes", maxCount:3},
    {name:"archivoTemario", maxCount:1},
    {name:"repositorioInformacion", maxCount:10},
    {name:"repositorioInformacionMaterialModificados", maxCount:10},
    {name:"logoDerechoIktan", maxCount:1},
    {name:"logoIzquierdoIktan", maxCount:1},
    {name:"logoFondoIktan", maxCount:1},
    {name:"logoDerechoDC3", maxCount:1},
    {name:"logoIzquierdoDC3", maxCount:1},
    {name:"banner", maxCount:1},
    {name:"trailer", maxCount:1}
])
//upload.single('imagenes') req.file
//upload.array('imagenes',5) req.files

//Procesamiento de imagenes
const tamañoImagenesCurso = catchAsync(async(req,res,next)=>{
    const curse = await Curso.findOne({nombre:req.body.nombre})
    if(curse) return next(new AppError("El nombre del curso ya existe",401))
    console.log(req.files)
    const curso ={nombre:req.body.nombre}
    if(req.files.imagenCover){
        const extension = req.files.imagenCover[0].mimetype.split("/")
        const imagenCover= `ImagenCover-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Imagenes/${imagenCover}`;
        const buffer = req.files.imagenCover[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo() 
        req.body.imagenCover ={url: respuesta.Location, key}
    }
    if(req.files.banner){
        const extension = req.files.banner[0].mimetype.split("/")
        const banner= `Banner-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Imagenes/${banner}`;
        const buffer = req.files.banner[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo() 
        req.body.banner ={url: respuesta.Location, key}
    }
    if(req.files.trailer){
        const extension = req.files.trailer[0].mimetype.split("/")
        const banner= `Trailer-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Videos/Trailer/${banner}`;
        const buffer = req.files.trailer[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo() 
        req.body.trailer ={url: respuesta.Location, key}
    }
    console.log("hola 1")

    if(req.files.logoIzquierdoIktan){
        const extension = req.files.logoIzquierdoIktan[0].mimetype.split("/")
        console.log(extension)
        const logoIzquierdoIktan= `Logo-Izquierdo-Iktan-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Constancias/logos/${logoIzquierdoIktan}`;
        const buffer = req.files.logoIzquierdoIktan[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo()  
        req.body.iktan ={logoIzquierdo:{url: respuesta.Location, key}, 
        logoDerecho:{url:"", key:""},logoFondo:{url:"", key:""},
        capacitadorUno: req.body.capacitadorUno, capacitadorDos: req.body.capacitadorDos, descripcion:req.body.descripcion}
    }
    console.log("hola 2")

    if(req.files.logoDerechoIktan){
        const extension = req.files.logoDerechoIktan[0].mimetype.split("/")
        console.log(extension)
        const logoDerechoIktan= `Logo-Derecho-Iktan-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Constancias/logos/${logoDerechoIktan}`;
        const buffer = req.files.logoDerechoIktan[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo()  
        req.body.iktan.logoDerecho ={url: respuesta.Location, key}
    }
    console.log("hola 3")

    if(req.files.logoFondoIktan){
        const extension = req.files.logoFondoIktan[0].mimetype.split("/")
        const logoFondoIktan= `Logo-Fondo-Iktan-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Constancias/logos/${logoFondoIktan}`;
        const buffer = req.files.logoFondoIktan[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo()  
        req.body.iktan.logoFondo ={url: respuesta.Location, key}
    }
    console.log("hola 4")

    if(req.files.logoIzquierdoDC3){
        const extension = req.files.logoIzquierdoDC3[0].mimetype.split("/")
        const logoIzquierdoDC3= `Logo-Izquierdo-DC3-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Constancias/logos/${logoIzquierdoDC3}`;
        const buffer = req.files.logoIzquierdoDC3[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo()  
        req.body.dc3 ={logoIzquierdo:{url: respuesta.Location, key}, 
        logoDerecho:{url:"", key:""}, capacitador: req.body.capacitador}
        console.log(req.body)
        console.log({logoIzquierdo:{url: respuesta.Location, key}, 
            logoDerecho:{url:"", key:""}, capacitador: req.body.capacitador})

    }
    console.log("hola 5")
    if(req.files.logoDerechoDC3){
        const extension = req.files.logoDerechoDC3[0].mimetype.split("/")
        const logoDerechoDC3= `Logo-Derecho-DC3-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Constancias/logos/${logoDerechoDC3}`;
        const buffer = req.files.logoDerechoDC3[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo()  
        req.body.dc3.logoDerecho ={url: respuesta.Location, key}
    }
    console.log("hola 6")

    if(req.files.archivoTemario){
        const extension = req.files.archivoTemario[0].mimetype.split("/")
        const archivoTemario= `Temario-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Temario/${archivoTemario}`;
        const buffer = req.files.archivoTemario[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo();
        req.body.archivoTemario ={url: respuesta.Location, key}
    }
    console.log("hola 7")

    if(req.files.imagenes){
        req.body.imagenes= []
        await Promise.all( req.files.imagenes.map(async(file,i)=>{
            const extension = file.mimetype.split("/")
            const imagenes= `Imagenes-${req.user.id}-${Date.now()}-${i + 1}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Imagenes/${imagenes}`;
            const respuesta =await new Aws(key,file.buffer).subirArchivo(); 
            req.body.imagenes.push({url:respuesta.Location,key})
        }));
    }
    console.log("hola 8")

    if(req.files.repositorioInformacion){
        const isArray =Array.isArray(req.body.repositorioInformacionNombres)
        const repositorioInformacion = []
        let nombre;
        await Promise.all( req.files.repositorioInformacion.map(async(file,i)=>{
            const extension = file.mimetype.split("/")
            const material= `Material-${req.user.id}-${Date.now()}-${i + 1}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Repositorio de Informacion/${material}`;
            const respuesta =await new Aws(key,file.buffer).subirArchivo(); 
            if(isArray){nombre = req.body.repositorioInformacionNombres[i]}else{nombre =req.body.repositorioInformacionNombres}
            repositorioInformacion.push({
                nombre,
                archivoMaterial: {url:respuesta.Location, key},
            })
        }));
        req.body.repositorioInformacion = repositorioInformacion
    }

    console.log(req.body)
    next();
});



//middelware
//Tours con mejor promedio y mas baratos
const aliasTopCurso =(req,res,next)=>{
    req.query.limit = "5";
    req.query.sort ="-calificacionPromedio,precio";
    req.query.fields = "nombre,precio,descripcion,calificacionPromedio"
    next();
}



//Api, version de la api
//usaremos el formato estandar jsend JSON para enviar la respuesta
const allCursos = getAll(Curso);

const oneCurso = getOne(Curso,{path: "reviews"})

//const createCurso = createOne(Curso);

//const updateCurso = updateOne(Curso);

const deleteCurso = catchAsync(async(req,res,next)=>{
    const curso = await Curso.findById(req.params.id);
    //Se eliminan la imagen del curso
    await new Aws(curso.imagenCover.key).deleteArchivo();
    /*for(var i = 0; i < curso.imagenes.length; i++){
    //Se eliminan la imagenes  del curso
        await new Aws(curso.imagenes[i].key).deleteArchivo();
    }*/
    
    const doc = await Curso.findByIdAndDelete(req.params.id);
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
    
    res.status(204).json({
        status: "Successful",
        data: doc,
        message: "Documento eliminado"
        });});

const createCurso  = catchAsync(async (req,res,next)=>{
    const curso = await Curso.create(req.body);
    //console.log(newDoc.preguntasCerradas[2].respuestaCorrecta)
    res.status(201).json({
        status: "successful",
        data: {data: curso},
    })
});

//Calcular estadisticas sobre los cursos

const getCursoEstadisticas = catchAsync(async(req,res) =>{
    
        //El aggregate es una consulta normal(regular) y tiene etapas las estapas, recibe como parametro un array y dentro van las etapas
        //Manipulqamos los datos en pasos diferentes
        //Los documentos pasan etapa por etapa
        //Match nos permite filtrar determinados documentos
        //Lo usaremos para que seleccione calificaciones >= a 4.5
        //group nos permite agrupar documentos atraves de acumuladores
        //Siempre tenemos que especificar el _id porque queremos agrupar
        //Lo colocamos nulo porque queremos tener todo en un grupo para poder sacar el promedio
        //$avg calcula el promedio
        //$min calcula el minimo
        //$max calcula el maximo
        //$suma
        //$toUpper convierte en mayusculas
        //$ne excepto
        /*
            En la primera capa hacemos la busqueda de lo que queremos eso nos devuelve los documentos
            En la segunda capa agrupamos y realizamos las operaciones que necesitemos
            En la tercera capa clasificamos de menor a mayor o mayor a menor
        */
        const estadisticas =await Curso.aggregate([
            {
                  $match : {calificacionPromedio: {$gte:4.5}}

            },
            {
                $group:{
                    _id:{ $toUpper: "$areaTematica"},
                    cantidadCursos: { $sum: 1},
                    cantidadDeCalificaciones: { $sum: '$cantidadCalificaciones'},
                    calificacionPromedio: { $avg: '$calificacionPromedio'},
                    precioPromedio: { $avg: '$precio'},
                    precioMinimo: {$min : '$precio'},
                    precioMaximo:{$max : '$precio'}
                }
            },
            {
                $sort:{
                    precio:1
                }
            },
            /*
            {
                $match:{
                    _id : {$ne: 'EASY'}
                }
            } */
        ])
        res.status(200).json({
            status: "successful",
            data: estadisticas
        });
});

const getPlanMensual = catchAsync( async(req,res)=>{
    
        const year = req.params.year;
        //$unwind descontruye un campo de matriz
        //Lo que hara sera que destructurara el arreglo y creara un docuemnto por cada fecha que tenga ese arreglo
        //usaremos match para selecionar aquellas fechas del year-01-01 year-12-31
        //Despues agruparemos por mes
        //sacamos la cantidad de tours por mes que hay
        //Agregamos el nombre por cada tour
        //addField se usa para agregar campos
        //Agregamos un campo para mes
        //$project elimina campos
        //En este caso el :id ya no aparecera
        //$sort
        //Ordenaremos los datos en orden decendente  a partir de la cantidad de tour start
        //-1 = descendente, 1 ascendente
        //$limit
        //Nos dara solo 12 documentos
        const plan = await Curso.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group:{
                    _id: {$month: '$startDates'},
                    cantidadCursoStar:{$sum:1},
                    curso: {$push: '$nombre'}

                }
            },
            {
                $addFields:{
                    mes:'$_id'
                }
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort:{
                    cantidadCursoStar: -1
                }
            },{
                $limit:12
            }
        ]);
        res.status(200).json({
            status: "successful",
            data: plan
        })
});

     //Procesamiento de imagenes
     const imagenesCurso = catchAsync(async(req,res,next)=>{
        console.log("FILES")
        console.log(req.files)
        console.log("BODY")
        console.log(req.body)
        const curso = await Curso.findById(req.params.id) 
        const ri=curso.repositorioInformacion;
        const y=[]
        console.log("CURSO")
        console.log(curso)
        console.log("RI")
        console.log(ri)

        console.log("hola Uno")
        if(req.body.repositorioInfoNoModificados){
            const isArray =Array.isArray(req.body.repositorioInfoNoModificados)
            console.log(req.body.repositorioInfoNoModificados)
            if(isArray){
                console.log("222")
                for(let s = 0;s<req.body.repositorioInfoNoModificados.length;s++){
                const repoInfoNoModificados = JSON.parse(req.body.repositorioInfoNoModificados[s])
            if(ri[repoInfoNoModificados[0].posicion].nombre == repoInfoNoModificados[0].nombre ){
                y.push(ri[repoInfoNoModificados[0].posicion])
            }else{
                ri[repoInfoNoModificados[0].posicion].nombre = repoInfoNoModificados[0].nombre
                y.push(ri[repoInfoNoModificados[0].posicion])
            }
            }}else{
                console.log("1111")
                const repoInfoNoModificados = JSON.parse(req.body.repositorioInfoNoModificados)
                if(ri[repoInfoNoModificados[0].posicion].nombre == repoInfoNoModificados[0].nombre){
                    y.push(ri[repoInfoNoModificados[0].posicion])
                }else{
                    ri[repoInfoNoModificados[0].posicion].nombre = repoInfoNoModificados[0].nombre
                    y.push(ri[repoInfoNoModificados[0].posicion])
                }
            }
            console.log(y)
    
        }
        console.log("hola Dos")

        if(req.body.repositorioInfoModificados){
            const isArray =Array.isArray(req.body.repositorioInfoModificados)
            console.log(isArray)
            if(isArray){
                for(let s = 0;s<req.body.repositorioInfoModificados.length;s++){
                    
                const repoInfoModificados = JSON.parse(req.body.repositorioInfoModificados[s])
                console.log(ri[repoInfoModificados[0].posicion].nombre)
                    console.log(req.body.repositorioInformacionNombresModificados[s])
                if((ri[repoInfoModificados[0].posicion].nombre == repoInfoModificados[0].nombre) || (ri[repoInfoModificados[0].posicion].nombre != req.body.repositorioInformacionNombresModificados[s])){
                    console.log(req.files.repositorioInformacionMaterialModificados[repoInfoModificados[0].posicion])

                    const extension = req.files.repositorioInformacionMaterialModificados[s].mimetype.split("/")
                const material= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
                const key = `Cursos/${curso.nombre}/Repositorio de Informacion/${material}`;
                const buffer = req.files.repositorioInformacionMaterialModificados[s].buffer;
                const respuesta =await new Aws(key,buffer).subirArchivo();
                console.log("AA")
                if(req.body.repositorioInformacionNombresModificados[s]){
                    console.log("qwerx")
                    ri[repoInfoModificados[0].posicion].archivoMaterial.url= respuesta.Location
                ri[repoInfoModificados[0].posicion].archivoMaterial.key= key
                ri[repoInfoModificados[0].posicion].nombre= req.body.repositorioInformacionNombresModificados[s]

                }else{
                    ri[repoInfoModificados[0].posicion].archivoMaterial.url= respuesta.Location
                ri[repoInfoModificados[0].posicion].archivoMaterial.key= key
                }
    
                y.push(ri[repoInfoModificados[0].posicion])

                //y.push(ri[repoInfoModificados[0].posicion])
            }
            }}else{
                console.log("www")
                
                console.log(JSON.parse(req.body.repositorioInfoModificados))
                const repoInfoModificados = JSON.parse(req.body.repositorioInfoModificados)
                console.log(ri[repoInfoModificados[0].posicion].nombre)
                console.log(req.body.repositorioInformacionNombresModificados)
                if((ri[repoInfoModificados[0].posicion].nombre == repoInfoModificados[0].nombre)||(ri[repoInfoModificados[0].posicion].nombre != req.body.repositorioInformacionNombresModificados)
                ){
                    console.log(req.files.repositorioInformacionMaterialModificados[0].mimetype.split("/"))
                    const extension = req.files.repositorioInformacionMaterialModificados[0].mimetype.split("/")
                const material= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
                const key = `Cursos/${curso.nombre}/Repositorio de Informacion/${material}`;
                const buffer = req.files.repositorioInformacionMaterialModificados[0].buffer;
                const respuesta =await new Aws(key,buffer).subirArchivo();
                if(req.body.repositorioInformacionNombresModificados){
                    ri[repoInfoModificados[0].posicion].archivoMaterial.url= respuesta.Location
                ri[repoInfoModificados[0].posicion].archivoMaterial.key= key
                ri[repoInfoModificados[0].posicion].nombre= req.body.repositorioInformacionNombresModificados

                }else{
                    ri[repoInfoModificados[0].posicion].archivoMaterial.url= respuesta.Location
                ri[repoInfoModificados[0].posicion].archivoMaterial.key= key
                }
                
    
                y.push(ri[repoInfoModificados[0].posicion])
                }
            }


/*
             for(let s =0;s<req.body.repositorioInfoModificados.length;s++){
    
                ri[req.body.repositorioInfoModificados[s][0].posicion].nombre = 
                req.body.repositorioInformacionNombresModificados[s]
                
                //Se suben a awd
                const extension = req.files.repositorioInformacionMaterialModificados[req.body.repositorioInfoModificados[s][0].posicion].mimetype.split("/")
                const material= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
                const key = `Cursos/${curso.nombre}/Repositorio de Informacion/${material}`;
                const buffer = req.files.repositorioInformacionMaterialModificados[req.body.repositorioInfoModificados[s][0].posicion].buffer;
                const respuesta =await new Aws(key,buffer).subirArchivo();
                req.body.archivoTemario ={url: respuesta.Location, key}
    
                ri[req.body.repositorioInfoModificados[s][0].posicion].archivoMaterial.url= respuesta.Location
                ri[req.body.repositorioInfoModificados[s][0].posicion].archivoMaterial.key= key
    
                y.push(ri[req.body.repositorioInfoModificados[s][0].posicion])
            }*/
    
        }
        console.log("hola Tres")

        if(req.files.repositorioInformacion){
            const isArray =Array.isArray(req.body.repositorioInformacionNombres)
            const repositorioInformacion = []
            let nombre;
            await Promise.all( req.files.repositorioInformacion.map(async(file,i)=>{
                const extension = file.mimetype.split("/")
                const material= `Material-${req.user.id}-${Date.now()}-${i + 1}.${extension[1]}`
                const key = `Cursos/${curso.nombre}/Repositorio de Informacion/${material}`;
                const respuesta =await new Aws(key,file.buffer).subirArchivo(); 
                if(isArray){nombre = req.body.repositorioInformacionNombres[i]}else{nombre =req.body.repositorioInformacionNombres}
                y.push({
                    nombre,
                    archivoMaterial: {url:respuesta.Location, key},
                })
            }));
            //y.push(repositorioInformacion)
        }
        console.log("hola Cuatro")

        if(req.files.imagenCover){
            const extension = req.files.imagenCover[0].mimetype.split("/")
            const imagenCover= `ImagenCover-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Imagenes/${imagenCover}`;
            const buffer = req.files.imagenCover[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo() 
            curso.imagenCover.url = respuesta.Location 
            curso.imagenCover.key = key 
        }
        console.log("hola Cinco")
        if(req.files.banner){
            const extension = req.files.banner[0].mimetype.split("/")
            const banner= `Banner-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Imagenes/${banner}`;
            const buffer = req.files.banner[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo() 
            curso.banner.url = respuesta.Location 
            curso.banner.key = key     }
            console.log("hola Seis")

        if(req.files.archivoTemario){
            const extension = req.files.archivoTemario[0].mimetype.split("/")
            const archivoTemario= `Temario-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Temario/${archivoTemario}`;
            const buffer = req.files.archivoTemario[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo();
            curso.archivoTemario.url = respuesta.Location 
            curso.archivoTemario.key = key 
        }
        console.log("hola Siete")

        if(req.files.trailer){
            const extension = req.files.trailer[0].mimetype.split("/")
            const banner= `Trailer-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Videos/Trailer/${banner}`;
            const buffer = req.files.trailer[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo() 
            curso.trailer.url = respuesta.Location 
            curso.trailer.key = key     }

            console.log("hola Ocho")

        if(req.files.logoIzquierdoIktan){
            const extension = req.files.logoIzquierdoIktan[0].mimetype.split("/")
            console.log(extension)
            const logoIzquierdoIktan= `Logo-Izquierdo-Iktan-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Constancias/logos/${logoIzquierdoIktan}`;
            const buffer = req.files.logoIzquierdoIktan[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo()  
            curso.iktan.logoIzquierdo.url = respuesta.Location
            curso.iktan.logoIzquierdo.key = key
        }
        console.log("hola Nueve")

        if(req.files.logoDerechoIktan){
            const extension = req.files.logoDerechoIktan[0].mimetype.split("/")
            console.log(extension)
            const logoDerechoIktan= `Logo-Derecho-Iktan-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Constancias/logos/${logoDerechoIktan}`;
            const buffer = req.files.logoDerechoIktan[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo()  
            curso.iktan.logoDerecho.url = respuesta.Location
            curso.iktan.logoDerecho.key = key    
        }
        console.log("hola 10")

        if(req.files.logoFondoIktan){
            const extension = req.files.logoFondoIktan[0].mimetype.split("/")
            const logoFondoIktan= `Logo-Fondo-Iktan-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Constancias/logos/${logoFondoIktan}`;
            const buffer = req.files.logoFondoIktan[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo()  
            curso.iktan.logoFondo.url = respuesta.Location
            curso.iktan.logoFondo.key = key     
        }
        console.log("hola 11")

        if(req.files.logoIzquierdoDC3){
            const extension = req.files.logoIzquierdoDC3[0].mimetype.split("/")
            const logoIzquierdoDC3= `Logo-Izquierdo-DC3-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Constancias/logos/${logoIzquierdoDC3}`;
            const buffer = req.files.logoIzquierdoDC3[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo()  
            curso.dc3.logoIzquierdo.url = respuesta.Location
            curso.dc3.logoIzquierdo.key = key    
        }
        console.log("hola 12")

        if(req.files.logoDerechoDC3){
            const extension = req.files.logoDerechoDC3[0].mimetype.split("/")
            const logoDerechoDC3= `Logo-Derecho-DC3-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Constancias/logos/${logoDerechoDC3}`;
            const buffer = req.files.logoDerechoDC3[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo()  
            curso.dc3.logoDerecho.url = respuesta.Location
            curso.dc3.logoDerecho.key = key       
        }
        //curso.repositorioInformacion = undefined
        console.log(curso)
        console.log(y)
        //curso.repositorioInformacion.push( y)
        req.body.curso = curso
        //req.body.curso.repositorioInformacion = undefined
        //req.body.curso.repositorioInformacion = []
        console.log("WWWWWWWWWWWWWWWWWWWWWWWWWWWWPPPPPPPPPP")
        //console.log(req.body.curso)
        //req.body.curso.repositorioInformacion.push(y)
        console.log("WWWWWWWWWWWWWWWWWWWWWWWWWWWW")
        //console.log(req.body.curso)
        console.log("NUEVO BODY")
        req.body.y=y
        next();
    });
    
    const updateCurso = catchAsync(async(req,res,next)=>{
        req.body.curso.evaluacionInicial.activo = req.body.evaluacionInicial
        req.body.curso.evaluacionFinal.activo = req.body.evaluacionFinal
        req.body.curso.repositorioInformacion = undefined
        console.log(req.body.curso.evaluacionFinal)
        req.body.curso.repositorioInformacion = req.body.y
        console.log(req.body.curso.evaluacionInicial)
        req.body.curso.nombre = req.body.nombre
        req.body.curso.resumen = req.body.resumen
        req.body.curso.duracion = req.body.duracion
        req.body.curso.precio = req.body.precio
        req.body.curso.tamañoMaximoGrupo = req.body.tamanoMaximoGrupo
        req.body.curso.areaTematica = req.body.areaTematica
        req.body.curso.fechaInicio = req.body.fechaInicio
        req.body.curso.fechaFinalizacion = req.body.fechaFinalizacion
        req.body.curso.activo = req.body.activo
        req.body.curso.finalizado = req.body.finalizado
        req.body.curso.tipoCurso = req.body.tipoCurso
        req.body.curso.precioDescuento = req.body.precioDescuento
        req.body.curso.iktan.capacitadorUno = undefined
        req.body.curso.iktan.capacitadorUno = req.body.capacitadorUno
        req.body.curso.iktan.capacitadorDos = undefined
        req.body.curso.iktan.capacitadorDos = req.body.capacitadorDos
        req.body.curso.iktan.descripcion = req.body.descripcion
        req.body.curso.dc3.capacitador = undefined
        req.body.curso.dc3.capacitador = req.body.capacitador
        const curso = req.body.curso
        req.body = {}
        req.body = curso
        //console.log("OOOOO")
        //console.log(curso)

        const doc = await Curso.findByIdAndUpdate(req.params.id,req.body,{
            new: true, //Para que nos devuelva el nuevo documento
            runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
        });
        console.log("222")
        //console.log(doc)
        if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
        res.status(201).json({
            status: "successful",
            data: {
                data: doc
            }
        });
    });

    const evaluacionesIniciales = catchAsync(async(req,res,next)=>{
        console.log(req.query.evaluacionInicial)
        const curso =await Curso.find({"evaluacionInicial.link":req.query.evaluacionInicial})
        console.log(curso.length)
        console.log(curso)
    })
module.exports = {allCursos,oneCurso,createCurso,updateCurso,imagenesCurso,deleteCurso, aliasTopCurso, getCursoEstadisticas,
     getPlanMensual, uploadCursoImages, tamañoImagenesCurso, evaluacionesIniciales}













