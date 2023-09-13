const {deleteOne, updateOne, createOne, getOne, getAll} = require('./handleFactory');
const EvaluacionFinal = require('../models/EvaluacionFinal')
const AppError = require('../utils/AppError')
const Curso = require('../models/Curso')
const catchAsync = require('../utils/catchAsync')

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

const createEvaluacionFinal = createOne(EvaluacionFinal);
const oneEvaluacionFinal = getOne(EvaluacionFinal);
const allEvaluacionFinal = getAll(EvaluacionFinal);
const updateEvaluacionFinal = updateOne(EvaluacionFinal);
const deleteEvaluacionFinal = catchAsync(async(req,res,next)=>{
    const doc = await EvaluacionFinal.findById(req.params.id);
    if(!doc) return next(new AppError("No se encontro el documento con esa identificacion",404));
    const y = doc
    if(doc.tipoEvaluacion == "Evaluacion Final"){
        const curso = await Curso.findById(y.curso._id)
        if(!curso){
            const doc = await EvaluacionFinal.findByIdAndDelete(req.params.id);
            res.status(204).json({
                status: "Successful",
                data: doc,
                message: "Documento eliminado"
                });
        }
        curso.evaluacionFinal.link = "0"
        const documento = await Curso.findByIdAndUpdate(y.curso._id,curso,{
            new: true, //Para que nos devuelva el nuevo documento
            runValidators: true, //Para que nos corran los validadores que estan en nuestro squema
        });
        const doc = await EvaluacionFinal.findByIdAndDelete(req.params.id);
    }
    res.status(204).json({
        status: "Successful",
        data: doc,
        message: "Documento eliminado"
        });
});

module.exports = {createEvaluacionFinal, oneEvaluacionFinal, allEvaluacionFinal, updateEvaluacionFinal, deleteEvaluacionFinal, setCursoUserIds, validarCurso};