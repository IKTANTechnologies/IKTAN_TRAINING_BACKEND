const Tarea = require('../models/Tarea');
//const catchAsync = require('../utils/catchAsync')
const catchAsync = require('../utils/catchAsync')
const {deleteOne, updateOne, createOne, getOne, getAll} = require('../controllers/handleFactory')
const AppError = require('../utils/AppError')
const multer = require('multer');
const Curso = require('../models/Curso');
const Aws = require('../utils/aws');
const Modulo = require('../models/Modulo');
//Es mejor manejar la imagen en la memoria
const multerStorage = multer.memoryStorage();
//Comprobar si el archivo subido es una imagen
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        //Le pasamos un error
        cb(new AppError("No es una imagen o archivo pdf. Porfavor cargue solo imagenes",400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

const uploadMateriales = upload.fields([
    {name:"repositorioInformacion", maxCount:10},
    {name:"repositorioInformacionMaterialModificados", maxCount:10}
])

//Cuando se crea una tarea el numero del modulo debe de venir en el body con el id del curso
/*
    Fronted la estructura de como se van a mandar los datos 
    {
        curso,
        numeroModulo,
        tema,
        titulo,
        instruccion,
        formatoEntrega,
        imagenes[0,1,2]
    }
*/
const subirMateriales = catchAsync(async(req,res,next)=>{
    console.log(req.body)
    const modulo =await Modulo.findById(req.body.modulo);   
    if(!modulo) return next(new AppError("No existe el modulo",404));
    if(!req.files.repositorioInformacion) return next(new AppError("Agregue los materiales",404));

    if(req.files.repositorioInformacion){
        const isArray =Array.isArray(req.body.repositorioInformacionNombres)
        const repositorioInformacion = []
        let nombre;
        await Promise.all( req.files.repositorioInformacion.map(async(file,i)=>{
            const extension = file.mimetype.split("/")
            const fileName= `Material-${req.user.id}-${Date.now()}-${i + 1}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${modulo.numero}/Tareas/${req.body.titulo}/${fileName}`;
            const respuesta =await new Aws(key,file.buffer).subirArchivo(); 
            if(isArray){nombre = req.body.repositorioInformacionNombres[i]}else{nombre =req.body.repositorioInformacionNombres}
            repositorioInformacion.push({
                material:{
                    titulo: nombre,
                    url: respuesta.Location, 
                    key
                }
            })
        }));
        req.body.materiales = repositorioInformacion
    }
    next();
});

const createTarea = createOne(Tarea);

const allTarea = getAll(Tarea);

const oneTarea = getOne(Tarea);

const deleteTarea = catchAsync(async(req,res,next)=>{
    const tarea = await Tarea.findById(req.params.id);
    console.log(tarea)
    const modulo = await Modulo.findById(tarea.modulo);
    const arrayTareas=[]
    const x = modulo.tareas
    x.map((el)=>{
        if(el.id === req.params.id){
        }else{
            arrayTareas.push(el)
        }
    })
    modulo.tareas= arrayTareas
    const modul = await Modulo.findByIdAndUpdate(tarea.modulo,modulo,{
        new: true, //Para que nos devuelva el nuevo documento
        runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
    });    
    const doc = await Tarea.findByIdAndDelete(req.params.id);
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));

    res.status(204).json({
        status: "Successful",
        data: doc,
        message: "Documento eliminado"
        });
});
//const updateTarea = updateOne(Tarea);

 //Procesamiento de imagenes
 const archivosTarea = catchAsync(async(req,res,next)=>{
    const modulo =await Modulo.findById(req.body.modulo);   
    if(!modulo) return next(new AppError("No existe el modulo",404));
    console.log("FILES")
    console.log(req.files)
    console.log("BODY")
    console.log(req.body)
    const tarea = await Tarea.findById(req.params.id) 
    const ri=tarea.materiales;
    const y=[]
    console.log("Tarea")
    console.log(tarea)
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
        if(ri[repoInfoNoModificados[0].posicion].material.titulo == repoInfoNoModificados[0].nombre ){
            y.push(ri[repoInfoNoModificados[0].posicion])
        }else{
            ri[repoInfoNoModificados[0].posicion].material.titulo = repoInfoNoModificados[0].nombre
            y.push(ri[repoInfoNoModificados[0].posicion])
        }
        }}else{
            console.log("1111")
            const repoInfoNoModificados = JSON.parse(req.body.repositorioInfoNoModificados)
            if(ri[repoInfoNoModificados[0].posicion].material.titulo == repoInfoNoModificados[0].nombre){
                y.push(ri[repoInfoNoModificados[0].posicion])
            }else{
                ri[repoInfoNoModificados[0].posicion].material.titulo = repoInfoNoModificados[0].nombre
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
            console.log(ri[repoInfoModificados[0].posicion].material.titulo)
            if((ri[repoInfoModificados[0].posicion].material.titulo == repoInfoModificados[0].nombre) || (ri[repoInfoModificados[0].posicion].material.titulo != req.body.repositorioInformacionNombresModificados[s])){
                console.log(req.files.repositorioInformacionMaterialModificados[repoInfoModificados[0].posicion])

                const extension = req.files.repositorioInformacionMaterialModificados[s].mimetype.split("/")
            const fileName= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${modulo.numero}/Tareas/${req.body.titulo}/${fileName}`;
            const buffer = req.files.repositorioInformacionMaterialModificados[s].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo();
            console.log("AA")
            if(req.body.repositorioInformacionNombresModificados[s]){
                console.log("qwerx")
                ri[repoInfoModificados[0].posicion].material.url= respuesta.Location
            ri[repoInfoModificados[0].posicion].material.key= key
            ri[repoInfoModificados[0].posicion].material.titulo= req.body.repositorioInformacionNombresModificados[s]

            }else{
                ri[repoInfoModificados[0].posicion].material.url= respuesta.Location
            ri[repoInfoModificados[0].posicion].material.key= key
            }

            y.push(ri[repoInfoModificados[0].posicion])
            //y.push(ri[repoInfoModificados[0].posicion])
        }
        }}else{
            console.log("www")
            
            console.log(JSON.parse(req.body.repositorioInfoModificados))
            const repoInfoModificados = JSON.parse(req.body.repositorioInfoModificados)
            console.log(ri[repoInfoModificados[0].posicion].material.titulo)
            console.log(req.body.repositorioInformacionNombresModificados)
            if((ri[repoInfoModificados[0].posicion].material.titulo == repoInfoModificados[0].nombre)||(ri[repoInfoModificados[0].posicion].material.titulo != req.body.repositorioInformacionNombresModificados)
            ){
                console.log(req.files.repositorioInformacionMaterialModificados[0].mimetype.split("/"))
                const extension = req.files.repositorioInformacionMaterialModificados[0].mimetype.split("/")
            const material= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${modulo.numero}/Tareas/${req.body.titulo}/${material}`;
            const buffer = req.files.repositorioInformacionMaterialModificados[0].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo();
            if(req.body.repositorioInformacionNombresModificados){
                ri[repoInfoModificados[0].posicion].material.url= respuesta.Location
            ri[repoInfoModificados[0].posicion].material.key= key
            ri[repoInfoModificados[0].posicion].material.titulo= req.body.repositorioInformacionNombresModificados

            }else{
                ri[repoInfoModificados[0].posicion].material.url= respuesta.Location
            ri[repoInfoModificados[0].posicion].material.key= key
            }
            

            y.push(ri[repoInfoModificados[0].posicion])
            }
        }

    }
    console.log("hola Tres")

    if(req.files.repositorioInformacion){
        const isArray =Array.isArray(req.body.repositorioInformacionNombres)
        let nombre;
        await Promise.all( req.files.repositorioInformacion.map(async(file,i)=>{
            const extension = file.mimetype.split("/")
            const material= `Material-${req.user.id}-${Date.now()}-${i + 1}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${modulo.numero}/Tareas/${req.body.titulo}/${material}`;
            const respuesta =await new Aws(key,file.buffer).subirArchivo(); 
            if(isArray){nombre = req.body.repositorioInformacionNombres[i]}else{nombre =req.body.repositorioInformacionNombres}
            y.push({
                material:{
                    titulo: nombre,
                    url: respuesta.Location, 
                    key
                }
            })
        }));
        //y.push(repositorioInformacion)
    }
   
    req.body.tarea = tarea
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

const updateTarea = catchAsync(async(req,res,next)=>{
    console.log(req.body)
    req.body.tarea.materiales = undefined
    req.body.tarea.materiales = req.body.y
    req.body.tarea.titulo = req.body.titulo
    req.body.tarea.tema = req.body.tema
    req.body.tarea.instruccion = req.body.instruccion
    req.body.tarea.formatoEntrega = req.body.formatoEntrega
    req.body.tarea.activo = req.body.activo
    req.body.tarea.modulo = undefined
    req.body.tarea.modulo = req.body.modulo

    const tarea = req.body.tarea
    req.body = {}
    req.body = tarea
    //console.log("OOOOO")
    //console.log(curso)

    const doc = await Tarea.findByIdAndUpdate(req.params.id,req.body,{
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


module.exports = {uploadMateriales, subirMateriales,createTarea, allTarea,deleteTarea, updateTarea, archivosTarea,oneTarea}