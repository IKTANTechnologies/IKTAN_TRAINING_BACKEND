const  { createOne, getAll, updateOne,deleteOne } = require('../controllers/handleFactory');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const Modulo = require("../models/Modulo");
const Curso = require('../models/Curso');
const Aws = require('../utils/aws');
const Archivo = require('../utils/archivo')
const sharp = require('sharp');
//Es mejor manejar la imagen en la memoria
const multerStorage = multer.memoryStorage();
//Comprobar si el archivo subido es una imagen
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        //Le pasamos un error
        cb(new AppError("No es una imagen o un pdf. Porfavor cargue solo imagenes",400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

const uploadModuloArchivos = upload.fields([
    {name: "materiales", maxCount: 5},
    {name: "imagenCover", maxCount: 1},
    {name: "archivoTemario", maxCount: 1},
    {name:"repositorioInformacion", maxCount:10},
    {name:"repositorioInformacionMaterialModificados", maxCount:10},
])
//!FALTA QUE CUANDO SE AGREGUE UN MODULO EL CURSO SE ACTUALIZE E INCLUYA EL ID
const subirArchivos= catchAsync(async(req,res,next)=>{
    req.body.reunion ={nombre: req.body.reunionNombre, link: req.body.reunionLink}
    console.log(req.body)
    console.log("HOLA 1")
    const curso =await Curso.findById(req.body.curso)
    if(!curso) return next(new AppError("El curso no existe, intente con otro y consulte a soporte",404));
    if(!req.body.numero) return next(new AppError("Falta el numero del modulo",404));
    if(curso.modulos){
        curso.modulos.forEach(element => {
            if(element.numero == req.body.numero ) return next(new AppError("El numero del modulo ya existe",400))
        });
    }
    if(!req.files.imagenCover || !req.files.archivoTemario)return next(new AppError("Es obligatorio la imagen y el temario del modulo"))
    console.log("HOLA 2")
    if(req.files.imagenCover){
        //validar la imagen
        //if(req.files.imagenCover.mimetype !="image/png")return next(new AppError("La imagen del modulo, no es una imagen",400));
        const extension = req.files.imagenCover[0].mimetype.split("/")
        const fileName = `imagenCover-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Modulos/${req.body.numero}/Imagenes/${fileName}`;
        const respuesta =await new Aws(key,req.files.imagenCover[0].buffer).subirArchivo()  
        req.body.imagenCover = {url:respuesta.Location, key};
    }
    console.log("HOLA 3")
    if(req.files.archivoTemario){
        const extension = req.files.archivoTemario[0].mimetype.split("/")
        const fileName = `Temario-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${curso.nombre}/Modulos/${req.body.numero}/Temario/${fileName}`;
        const respuesta =await new Aws(key,req.files.archivoTemario[0].buffer).subirArchivo()  
        req.body.archivoTemario = {url:respuesta.Location, key};
    }
    console.log("HOLA 4")
    if(req.files.materiales){
        req.body.materiales= []
        const isArray =Array.isArray(req.body.materialesNombres)
        var nombre;
        //console.log(curso)
        await Promise.all( req.files.materiales.map(async(file,i)=>{
            //este titulo viene del fronted, cuando ya este listo quitarlo
            console.log(req.body.materialesNombres[i])
            console.log(isArray)
           
            const extension = file.mimetype.split("/")
            const fileName = `Material-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${curso.nombre}/Modulos/${req.body.numero}/Materiales/${fileName}`;
            const respuesta =await new Aws(key,file.buffer).subirArchivo()  
            const archivoMaterial = { url: respuesta.Location,key}
            console.log(nombre)

            if(isArray){
                req.body.materiales.push({
                    nombre: req.body.materialesNombres[i],
                    archivoMaterial
                })
            }else{
                req.body.materiales.push({
                    nombre: req.body.materialesNombres,
                    archivoMaterial
                })
            }
           
            console.log(req.body)
        }));}
    next()
    
})
//Cuando ya este el front quitarlo y dejar el de handlefactyory
const createModulo = catchAsync(async(req,res,next)=>{
    const newDoc = await Modulo.create(req.body)
    //console.log(newDoc.preguntasCerradas[2].respuestaCorrecta)
        res.status(201).json({
            status: "successful",
            data: {data: newDoc},
        })
})

const imagenesModulo = catchAsync(async(req,res,next)=>{

    //const p = await Modulo.findOne({numero: req.body.numero})
    //console.log(p.id)
    const modulo = await Modulo.findById(req.params.id) 
    //console.log(modulo.id)
    const ri=modulo.materiales;
    const y=[]
    /*if(p){
        if(p.id == modulo.id){
            console.log("edita")
        }else{
            console.log("No edita")
        }
    }*/
    if(req.body.repositorioInfoNoModificados){
        const isArray =Array.isArray(req.body.repositorioInfoNoModificados)
        if(isArray){
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
    }

    if(req.body.repositorioInfoModificados){
        const isArray =Array.isArray(req.body.repositorioInfoModificados)
        if(isArray){
            for(let s = 0;s<req.body.repositorioInfoModificados.length;s++){
                
            const repoInfoModificados = JSON.parse(req.body.repositorioInfoModificados[s])
            if((ri[repoInfoModificados[0].posicion].nombre == repoInfoModificados[0].nombre) || (ri[repoInfoModificados[0].posicion].nombre != req.body.repositorioInformacionNombresModificados[s])){
                const extension = req.files.repositorioInformacionMaterialModificados[s].mimetype.split("/")
            const material= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${req.body.numero}/Materiales/${material}`;
            const buffer = req.files.repositorioInformacionMaterialModificados[s].buffer;
            const respuesta =await new Aws(key,buffer).subirArchivo();
            if(req.body.repositorioInformacionNombresModificados[s]){
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
            const repoInfoModificados = JSON.parse(req.body.repositorioInfoModificados)
            if((ri[repoInfoModificados[0].posicion].nombre == repoInfoModificados[0].nombre)||(ri[repoInfoModificados[0].posicion].nombre != req.body.repositorioInformacionNombresModificados)
            ){
            const extension = req.files.repositorioInformacionMaterialModificados[0].mimetype.split("/")
            const material= `Material-${req.user.id}-${Date.now()}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${req.body.numero}/Materiales/${material}`
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
    }
    if(req.files.repositorioInformacion){
        const isArray =Array.isArray(req.body.repositorioInformacionNombres)
        let nombre;
        await Promise.all( req.files.repositorioInformacion.map(async(file,i)=>{
            const extension = file.mimetype.split("/")
            const material= `Material-${req.user.id}-${Date.now()}-${i + 1}.${extension[1]}`
            const key = `Cursos/${modulo.curso.nombre}/Modulos/${req.body.numero}/Materiales/${material}`
            const respuesta =await new Aws(key,file.buffer).subirArchivo(); 
            if(isArray){nombre = req.body.repositorioInformacionNombres[i]}else{nombre =req.body.repositorioInformacionNombres}
            y.push({
                nombre,
                archivoMaterial: {url:respuesta.Location, key},
            })
        }));
    }

    if(req.files.imagenCover){
        const extension = req.files.imagenCover[0].mimetype.split("/")
        const imagenCover= `ImagenCover-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${modulo.curso.nombre}/Modulos/${req.body.numero}/Imagenes/${imagenCover}`;
        const buffer = req.files.imagenCover[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo() 
        modulo.imagenCover.url = respuesta.Location 
        modulo.imagenCover.key = key 
    }

    if(req.files.archivoTemario){
        const extension = req.files.archivoTemario[0].mimetype.split("/")
        const archivoTemario= `Temario-${req.user.id}-${Date.now()}.${extension[1]}`
        const key = `Cursos/${modulo.curso.nombre}/Modulos/${req.body.numero}/Temario/${archivoTemario}`;
        const buffer = req.files.archivoTemario[0].buffer;
        const respuesta =await new Aws(key,buffer).subirArchivo();
        modulo.archivoTemario.url = respuesta.Location 
        modulo.archivoTemario.key = key 
    }
    req.body.modulo = modulo
    req.body.y=y
    next();
})

const updateModulo = catchAsync(async(req,res,next)=>{
    const t = ""
    console.log(req.body.numero)
    req.body.modulo.materiales = undefined
    req.body.modulo.materiales = req.body.y
    req.body.modulo.nombre = req.body.nombre
    req.body.modulo.numero = req.body.numero
    req.body.modulo.fechaInicio = req.body.fechaInicio
    req.body.modulo.descripcionCard = req.body.descripcionCard
    req.body.modulo.activo = req.body.activo
    req.body.modulo.reunion.nombre = req.body.reunionNombre
    req.body.modulo.reunion.link = req.body.reunionLink
    req.body.modulo.idCurso = req.body.idCurso
    const modulo = req.body.modulo
    req.body = {}
    req.body = modulo

    const doc = await Modulo.findByIdAndUpdate(req.params.id,req.body,{
        new: true, //Para que nos devuelva el nuevo documento
        runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
    });
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
    res.status(201).json({
        status: "successful",
        data: {
            data: doc
        }
    });
});
const deleteModulo = catchAsync(async(req,res,next)=>{
    const modulo = await Modulo.findById(req.params.id);
    const curso = await Curso.findById(modulo.curso.id);
    const arrayModulos=[]
    const x = curso.modulos
    x.map((el)=>{
        if(el.id === req.params.id){
        }else{
            arrayModulos.push(el)
        }
    })
    curso.modulos= arrayModulos
    const curse = await Curso.findByIdAndUpdate(modulo.curso.id,curso,{
        new: true, //Para que nos devuelva el nuevo documento
        runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
    });    
    const doc = await Modulo.findByIdAndDelete(req.params.id);
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));

    res.status(204).json({
        status: "Successful",
        data: doc,
        message: "Documento eliminado"
        });
});

const allModulos = getAll(Modulo);

module.exports = { createModulo, updateModulo, deleteModulo, allModulos, uploadModuloArchivos, subirArchivos, imagenesModulo }