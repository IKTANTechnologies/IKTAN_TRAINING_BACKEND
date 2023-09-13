const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handleFactory');
const EvaluacionFinal = require('../models/EvaluacionFinal')
const RespuestaEF = require('../models/RespuestaEF')
const AppError = require('../utils/AppError')
const Curso = require('../models/Curso')
const Constancia = require('../models/Constancia')
const Constancia2 = require('../utils/constancia');
const RespuestaEI = require('../models/RespuestaEI');
const Booking = require('../models/Booking');
//Es parte de createReview-----midlware
const setCursoUserIds = (req,res,next)=>{
    if(!req.body.curso) req.body.curso = req.params.cursoId
    req.body.user = req.user.id
    next();
}
const validarCurso = async(req,res,next)=>{
    const curso =await Curso.findById(req.body.curso)
    const constancia = await Constancia.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    const respuestaEF = await RespuestaEF.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    const booking = await Booking.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    if(!booking) next(new AppError("No has comprado el curso no puedes contestar la evaluacion. Porfavor compre el curso",404));
    if(respuestaEF) next(new AppError("Ya se ha contestado la evaluacion",401))
    const respuestaEI = await RespuestaEI.findOne({$and: [{user:req.user.id,curso:req.body.curso}]})
    if(!respuestaEI) next(new AppError("La evaluacion inicial no ha sido contestada, porfavor conteste la evaluacion",401))
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
    const evaluacionFinal = await EvaluacionFinal.findById(req.body.evaluacionFinal);
    if(!evaluacionFinal) return next(new AppError("La evaluacion Final no existe. Porfavor inserte una evaluacion valida",404));
    if(evaluacionFinal.preguntasCerradas.length != req.body.preguntasCerradas.length) return next(new AppError("La cantidad de respuestas no coincide con la evaluacion",403));
    let contador =0;
    let promedio = 0;
    for (var i = 0; i < evaluacionFinal.preguntasCerradas.length; i++) {
        if(evaluacionFinal.preguntasCerradas[i].respuestaCorrecta === req.body.preguntasCerradas[i].respuestaCorrecta){
            contador = contador +1;
        }
        promedio = contador/evaluacionFinal.preguntasCerradas.length
        req.body.calificacion = promedio * 10
      }
      next();
}

function generarRandom(num) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let resultado = "";
    let ch;
    while (resultado.length < num){
        ch = characters.charAt(Math.floor(Math.random() * charactersLength));
        if (!resultado.includes(ch)){
            resultado += ch;
        }
    }
    return resultado;
}


const validarCalificacion = async(req,res,next)=>{
    const user = req.user
    console.log("hola")
    user.folio =  generarRandom(9);
    req.body.folio = user.folio
    if(req.body.calificacion >= 0){
        const calificacion= '10.00';
        //Generar la constancia De iktan y dc-3
        const iktanUrl = await new Constancia2(user,req.curso,calificacion).createIktan();
        console.log("eee")
        const dc3Url = await new Constancia2(user,req.curso,calificacion).createDC3();
        console.log("ok")
        req.body.constancias = {iktanUrl, dc3Url}
        console.log(req.body)
        next();
    }else{
        next(new AppError("La calificacion no es aprobatoria. Vuelve a intentarlo",400));
    }
}

const createRespuestaEF = createOne(RespuestaEF);
const oneRespuestaEF = getOne(RespuestaEF);
const allRespuestaEF = getAll(RespuestaEF);
const updateRespuestaEF = updateOne(RespuestaEF);
const deleteRespuestaEF = deleteOne(RespuestaEF);

module.exports = {createRespuestaEF, oneRespuestaEF, allRespuestaEF, updateRespuestaEF, 
    deleteRespuestaEF, setCursoUserIds, validarCurso, asignarCalificacion, validarCalificacion};





