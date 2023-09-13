const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handleFactory');
const EvaluacionInicial = require('../models/EvaluacionInicial')
const RespuestaEI = require('../models/RespuestaEI')
const AppError = require('../utils/AppError')
const Curso = require('../models/Curso')
const Constancia = require('../models/Constancia')
const Constancia2 = require('../utils/constancia');
const Booking = require('../models/Booking');
//Es parte de createReview-----midlware
const setCursoUserIds = (req,res,next)=>{
    if(!req.body.curso) req.body.curso = req.params.cursoId
    req.body.user = req.user.id
    next();
}
const validarCurso = async(req,res,next)=>{
    console.log("hola")

    const curso =await Curso.findById(req.body.curso)
    console.log(curso.iktan.capacitadorDos)
    const constancia = await Constancia.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    const booking = await Booking.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    const respuestaEI = await RespuestaEI.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    if(respuestaEI) next(new AppError("Ya se ha contestado la evaluacion",401))
    if(!booking) next(new AppError("No has comprado el curso no puedes contestar la evaluacion. Porfavor compre el curso",404));
    if(!curso) next(new AppError("El curso no existe. Porfavor inserte un curso valido",404));
    if(!req.user) next(new AppError("El usuario no Existe",404))
    if(constancia) next(new AppError("Ya se ha contestado la evaluacion",401));
    if(!curso.iktan.capacitadorUno.empresaCapacitador && !curso.iktan.capacitadorUno.puestoCapacitador) next(new AppError("Los datos del capacitador no han sido completados, intentelo mas tarde.",404))
    if(!curso.iktan.capacitadorDos.empresaCapacitador && !curso.iktan.capacitadorDos.puestoCapacitador) next(new AppError("Los datos del capacitador no han sido completados, intentelo mas tarde.",404))

    if(!curso.dc3.capacitador.empresaCapacitador && !curso.dc3.capacitador.capacitadorPrincipal.puestoCapacitador) next(new AppError("Los datos del capacitador no han sido completados, intentelo mas tarde.",404))
    if(!req.user.curp || !req.user.ocupacionEspecifica || !req.user.razonSocialEmpresa || !req.user.representanteLegal 
        || !req.user.representanteTrabajadores || !req.user.shcp ){
            return next(new AppError("No se puede calificar tu examen debido a que no has completado los datos que necesitan para generar tus constancias",400))
        }
    req.curso = curso;
    next();
}
//Cuando envien las repsuestas de una evaluacion debe de ir dentro de un array llamdo preguntasCerras:[{respuestaCorrecta: 'd'}]
const asignarCalificacion = async(req,res,next)=>{
    const evaluacionInicial = await EvaluacionInicial.findById(req.body.evaluacionInicial);
    console.log("hola")
    console.log( evaluacionInicial.preguntasCerradas)
    if(!evaluacionInicial) return next(new AppError("La evaluacion Inicial no existe. Porfavor inserte una evaluacion valida"));
    if(evaluacionInicial.preguntasCerradas.length != req.body.preguntasCerradas.length) return next(new AppError("La cantidad de respuestas no coincide con la evaluacion",403));
    let contador =0;
    let promedio = 0;
    console.log("hola")
    console.log( evaluacionInicial.preguntasCerradas)
    for (var i = 0; i < evaluacionInicial.preguntasCerradas.length; i++) {
        if(evaluacionInicial.preguntasCerradas[i].respuestaCorrecta === req.body.preguntasCerradas[i].respuestaCorrecta){
            contador = contador +1;
        promedio = contador/evaluacionInicial.preguntasCerradas.length
        req.body.calificacion = promedio * 10
        }
      }
      next();
    }

const createRespuestaEI = createOne(RespuestaEI);
const oneRespuestaEI = getOne(RespuestaEI);
const allRespuestaEI = getAll(RespuestaEI);
const updateRespuestaEI = updateOne(RespuestaEI);
const deleteRespuestaEI = deleteOne(RespuestaEI);

module.exports = {createRespuestaEI, oneRespuestaEI, allRespuestaEI, updateRespuestaEI, 
    deleteRespuestaEI, setCursoUserIds, validarCurso, asignarCalificacion};



