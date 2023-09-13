const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handleFactory');
const EvaluacionInicial = require('../models/EvaluacionInicial')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const Curso = require('../models/Curso');
const EvaluacionFinal = require('../models/EvaluacionFinal');

//Es parte de createReview-----midlware
const setCursoUserIds = (req,res,next)=>{
    if(!req.body.curso) req.body.curso = req.params.cursoId
    if(!req.body.user) req.body.user = req.user.id
    next();
}
const validarCurso = catchAsync(async(req,res,next)=>{
    const curso =await Curso.findById(req.body.curso)
    if(!curso) next(new AppError("El curso no existe. Porfavor inserte un curso valido",404));
    next();
});
const createEvaluacionInicial = createOne(EvaluacionInicial);
const oneEvaluacionInicial = getOne(EvaluacionInicial);
const allEvaluacionInicial = getAll(EvaluacionInicial);
const updateEvaluacionInicial = updateOne(EvaluacionInicial);
//const deleteEvaluacionInicial = deleteOne(EvaluacionInicial);

const deleteEvaluacionInicial = catchAsync(async(req,res,next)=>{

    const doc = await EvaluacionInicial.findById(req.params.id);
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
    const y = doc
    if(doc.tipoEvaluacion == "Evaluacion Diagnostica"){
    
        const curso = await Curso.findById(y.curso._id)
        if(!curso){
            const doc = await EvaluacionInicial.findByIdAndDelete(req.params._id);
            res.status(204).json({
                status: "Successful",
                data: doc,
                message: "Documento eliminado"
                });
        }
        curso.evaluacionInicial.link = "0"
        const documento = await Curso.findByIdAndUpdate(y.curso.id,curso,{
            new: true, //Para que nos devuelva el nuevo documento
            runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
        });
        const doc = await EvaluacionInicial.findByIdAndDelete(req.params.id);
    }
    res.status(204).json({
        status: "Successful",
        data: doc,
        message: "Documento eliminado"
        });
});
module.exports = {createEvaluacionInicial, oneEvaluacionInicial, allEvaluacionInicial, updateEvaluacionInicial, deleteEvaluacionInicial, setCursoUserIds, validarCurso};