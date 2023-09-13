const User = require('../models/User');
const Archivo = require('../utils/archivo');
const catchAsync = require('../utils/catchAsync');
//const APIFeature = require('../utils/apiFeature');
const {Email} = require('../utils/email');
const AppError = require('../utils/AppError');
const {deleteOne, updateOne, getOne, getAll} = require('../controllers/handleFactory')
//Modulo para la carga de archivos desde el cliente al servidor
const multer = require('multer');
//Modulo para modificar el tamaño de la photo userw
const sharp = require('sharp');
const Aws = require('../utils/aws');
const slugify = require('slugify');
const Curso = require('../models/Curso');
const Booking = require('../models/Booking');

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
    if(file.mimetype.startsWith('image')){
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

const uploadUserPhoto = upload.single("photo");

const tamañoPhotoUser =catchAsync( async(req,res,next)=>{
    console.log(req.file)
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.png`
    const directorio = `public/cliente/img/users/photo/${req.file.filename}`;
    const key = `Usuarios/${req.user.correo}/Fotos de Perfil/${req.file.filename}`;
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer).toFormat('jpeg').jpeg({quality: 90}).toFile(directorio)
    const buffer = await new Archivo(directorio).leerArchivo();
    const respuesta =await new Aws( key,buffer).subirArchivo()  
    req.body.linkImg = {url:respuesta.Location, key}
    await new Archivo(directorio).eliminarArchivo()
    next();
})

//Capacitador
const uploadCapacitadorFirma = upload.single('firmaElectronica');
const tamañoFirmaCapacitador =catchAsync( async(req,res,next)=>{
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.png`
    const directorio = `public/servidor/firmasElectronicas/${req.file.filename}`;
    const key = `Usuarios/${req.user.correo}/Firma Electronica/${req.file.filename}`;
    await sharp(req.file.buffer).toFormat('png').toFile(directorio)
    const buffer = await new Archivo(directorio).leerArchivo();
    const respuesta =await new Aws(key,buffer).subirArchivo()  
    req.body.linkImg = {url:respuesta.Location, key};
    await new Archivo(directorio).eliminarArchivo()
    next();
})

const filtrarObj = (obj,...parametrosPermitidos) =>{
    const newObj ={};
    Object.keys(obj).forEach(el =>{
        if(parametrosPermitidos.includes(el)) newObj[el]= obj[el]
    });
    return newObj;
}

///////Controladores de usuarios/////////77

//Acualizar usuario que esta autenticado por el mismo
//Comun mente las aplicaciones web usan una ruta solo para cambiar usuario y contraseña y tra ruta para modificar sus datos generales
const updateMe = catchAsync(async(req,res,next)=>{
    console.log(req.body)
    //1)Crear un error si el usuario intenta actualizar su contraseña
    const contraseña = req.body.contraseña;
    const confirmarContraseña = req.body.confirmarContraseña;
    if(contraseña || confirmarContraseña){
        return next(new AppError("Esta ruta no es para actualizar contraseñas.Porfavor use /actualizarMiPassword",400))
    } 
    //2)Actualizar documento
    //New: true actualiza el nuevo documento con la informacion que le vamos a pasar
    const filtrarBody = filtrarObj(req.body,"correo","nombre","apellidoMaterno","apellidoPaterno");
    if(req.file) filtrarBody.photo = req.body.linkImg;
    const updateUser = await User.findByIdAndUpdate(req.user.id,filtrarBody,
        {new : true, runValidators: true})
    res.status(200).json({
        status: "successful",
        data:{
            user: updateUser
        }
    })
});


const deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{activo: false});
    res.status(204).json({
        status: "successful",
        data: null
    })
});

const getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
}

const updateMeDatesConstancias = catchAsync(async(req,res,next)=>{
     //1)Crear un error si el usuario intenta actualizar su contraseñac onfirmar contraseña, correo, nombre etc..
     const contraseña = req.body.contraseña;
     const confirmarContraseña = req.body.confirmarContraseña;
     const correo = req.body.correo;
     const apellidoMaterno = req.body.apellidoMaterno;
     const apellidoPaterno = req.body.apellidoPaterno;
     const nombre = req.body.nombre;
     if(contraseña || confirmarContraseña || correo || apellidoMaterno || apellidoPaterno || nombre){
         return next(new AppError("Esta ruta no es para actualizar contraseñas o datos generales .Porfavor use /actualizarMiPassword o /updateMe",400))
     } 
     //2)Actualizar documento
     //New: true actualiza el nuevo documento con la informacion que le vamos a pasar
     const filtrarBody = filtrarObj(req.body,"curp","ocupacionEspecifica","razonSocialEmpresa",
     "shcp", "representanteLegal", "representanteTrabajadores")
     const updateUser = await User.findByIdAndUpdate(req.user.id,filtrarBody,
        {new : true, runValidators: true})
     res.status(200).json({
         status: "successful",
         data:{
             user: updateUser
         }
     })
})

const updateMeDatesCapacitador = catchAsync(async(req,res,next)=>{
    //1)Crear un error si el usuario intenta actualizar su contraseñac onfirmar contraseña, correo, nombre etc..
    const contraseña = req.body.contraseña;
    const confirmarContraseña = req.body.confirmarContraseña;
    const correo = req.body.correo;
    const apellidoMaterno = req.body.apellidoMaterno;
    const apellidoPaterno = req.body.apellidoPaterno;
    const nombre = req.body.nombre;
    const curp = req.body.curp;
    const ocupacionEspecifica = req.body.ocupacionEspecifica;
    const razonSocialEmpresa = req.body.razonSocialEmpresa;
    const shcp = req.body.shcp;
    const representanteLegal = req.body.representanteLegal;
    const representanteTrabajadores = req.representanteTrabajadores;
    if(contraseña || confirmarContraseña || correo || apellidoMaterno || apellidoPaterno || nombre ||
        curp || ocupacionEspecifica || razonSocialEmpresa || shcp || representanteLegal || representanteTrabajadores){
        return next(new AppError("Esta ruta no es para actualizar contraseñas o datos generales .Porfavor use /actualizarMiPassword o /updateMe",400))
    } 
    //2)Actualizar documento
    //New: true actualiza el nuevo documento con la informacion que le vamos a pasar
    const filtrarBody = filtrarObj(req.body,"puestoCapacitador","empresaCapacitador")
    if(req.file) filtrarBody.firmaElectronica = req.body.linkImg;
    const updateUser = await User.findByIdAndUpdate(req.user.id,filtrarBody,
        {new : true, runValidators: true})
    res.status(200).json({
        status: "successful",
        data:{
            user: updateUser
        }
    })
})


const createUser=catchAsync(async(req,res,next)=>{
    res.status(200).json({
        message: "Este ruta no esta disponible, Porfavor use la ruta de users/registro"
    }) 
});

const allUsers = getAll(User);

const oneUser = getOne(User);

const updateUser = updateOne(User);
/*
const curso = await Curso.findById(req.params.id);
    //Se eliminan la imagen del curso
    await new Aws(curso.imagenCover.key).deleteArchivo();

*/
const deleteUser = catchAsync(async(req,res,next)=>{
   const user = await User.findById(req.params.id);
    if(user.photo.key){
        await new Aws(user.photo.key).deleteArchivo();
    }
    if(user.firmaElectronica.key){
        await new Aws(user.firmaElectronica.key).deleteArchivo();
    }
    const doc = await User.deleteOne({id:user.id});
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
    res.status(204).json({
        status: "Successful",
        data: doc,
        message: "Documento eliminado"
        });
});

const updateEmpresa = catchAsync(async(req,res,next)=>{
    const { empresa,user } = req.body;
    console.log(req.body)
    if(!empresa) return next(new AppError("La empresa es obligatoria."));
    if(!user) return next(new AppError("El usuario es obligatorio"));
    const responseUser = await User.findById(user);
    if(!responseUser) return next(new AppError("El usuario es invalido"));
    if(responseUser.role != "empresa") return next(new AppError("El usuario no tiene el role necesario para vincularle una empresa"));
    const doc = await User.findByIdAndUpdate(user,{empresa},{
        new: true, //Para que nos devuelva el nuevo documento
        runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
    });
    const cursos = await Curso.find({}).select('_id finalizado precio ');
    const cursosFilter = cursos.filter((curso)=>curso.finalizado == false);
    await Booking.deleteMany({user});
    cursosFilter.map(async(curso)=>await Booking.create({
        curso: curso.id,
        user,
        precio: curso.precio,
        cantidad: "1",
        pagado: true
    }))
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
    res.status(201).json({
        status: "successful",
        data: {
            data: doc
        }
    });
})



module.exports = {createUser, oneUser,allUsers,deleteUser,updateUser,updateMe,deleteMe, getMe,
     updateMeDatesConstancias, updateMeDatesCapacitador, uploadUserPhoto, tamañoPhotoUser,
    uploadCapacitadorFirma, tamañoFirmaCapacitador,updateEmpresa};