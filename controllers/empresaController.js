const Empresa = require('../models/Empresa');
const {  createOne, updateOne, deleteOne, getAll, getOne } = require('../controllers/handleFactory');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError')
const sharp = require('sharp');
const Aws = require('../utils/aws');
const Archivo = require('../utils/archivo');
const slugify = require('slugify');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError("No es una imagen. Porfavor cargue solo imagenes",400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

const uploadEmpresa=upload.single("empresa");

const tamañoPhotoEmpresa =catchAsync( async(req,res,next)=>{   
    console.log(req.files)
    if(req.file){
        req.file.filename = `empresa-${Date.now()}.png`
        const key = `Empresas/${req.body.nombre}/${req.file.filename}`;
        const buffer = req.file.buffer;
        const respuesta =await new Aws( key,buffer).subirArchivo();
        req.body.url = respuesta.Location;
        req.body.key = key; 
    }
    next();
})

const updateImagenEmpresa = updateOne(Empresa);

const createEmpresa = createOne(Empresa);

const updateEmpresa = updateOne(Empresa);

const deleteEmpresa = deleteOne(Empresa);

const getEmpresa = getOne(Empresa);

const getAllEmpresa = getAll(Empresa);

const updateSlugEmpresa = catchAsync(async(req,res,next)=>{
    if(req.body.nombre){
        req.body.slug= slugify(req.body.nombre,{  lower: true })
    }
    next();
})

module.exports = {  createEmpresa,updateEmpresa,deleteEmpresa,getEmpresa,
    getAllEmpresa, updateEmpresa, uploadEmpresa, tamañoPhotoEmpresa,updateImagenEmpresa,updateSlugEmpresa };