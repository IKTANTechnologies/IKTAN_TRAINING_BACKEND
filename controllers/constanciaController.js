const {deleteOne, updateOne, createOne, getOne, getAll} = require("./handleFactory");
const AppError = require("../utils/AppError");
const catchAsync = require('../utils/catchAsync')
const Constancia = require('../models/Constancia')
const createConstancia = catchAsync(async(req,res,next)=>{
    folio = req.body.folio;
    curso = req.body.curso;
    user = req.body.user;
    constancias = req.body.constancias;
    const constancia = await Constancia.create({curso,user, folio, constancias})
    console.log(constancia)
       next();
})
const getConstancia = getOne(Constancia)
const updateConstancia = updateOne(Constancia);
const deleteConstancia = deleteOne(Constancia);
const allConstancia = getAll(Constancia);

module.exports = { createConstancia,getConstancia,updateConstancia,deleteConstancia,allConstancia }