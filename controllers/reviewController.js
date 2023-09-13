const Review = require('../models/Review');
//const catchAsync = require('../utils/catchAsync')

const {deleteOne, updateOne, createOne, getOne, getAll} = require('../controllers/handleFactory');
const AppError = require('../utils/AppError');

//Es parte de createReview-----midlware
const setCursoUserIds = async(req,res,next)=>{
    if(!req.body.curso) req.body.curso = req.params.cursoId
    if(!req.body.user) req.body.user = req.user.id
    const review =await Review.findOne({$and:[{user: req.body.id}, {curso:req.body.curso}]})
    if(review) return next(new AppError("Ya has calificado el curso",401))
    next();
}


const createReview = createOne(Review);

const allReviews = getAll(Review);

const oneReview = getOne(Review);

const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review);

module.exports = {createReview, allReviews,deleteReview, updateReview, setCursoUserIds, oneReview}