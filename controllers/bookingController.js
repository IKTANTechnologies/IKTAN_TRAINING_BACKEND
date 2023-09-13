const {deleteOne, updateOne, createOne, getOne, getAll} = require("../controllers/handleFactory");
const AppError = require("../utils/AppError");
const Booking = require('../models/Booking');
const Curso = require('../models/Curso');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const createBooking = createOne(Booking);
const getBooking = getOne(Booking);
const updateBooking = updateOne(Booking);
const deleteBooking = deleteOne(Booking);
const allBooking = getAll(Booking);

const getCheckoutSession = catchAsync(async(req,res,next)=>{
    //
    //1)Obtenemos el curso
    const curso = await Curso.findById(req.params.cursoID)
    //Verificamos si el usuario ya ha comprado el curso
    const booking = await Booking.findOne({$and:[{curso: curso._id},{user: req.user.id}]})
    if(!booking){
      const precioCurso = curso.precio - curso.precioDescuento
      const iva =( precioCurso * 0.16) + precioCurso;
          //2) creamos la checkoutSession
      //success_url el usuario es redirigido a un link si se efectuo la compra correctamente
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.FRONTEND_URL2}/mis-cursos/learning`,
        cancel_url: process.env.FRONTEND_URL2,
        customer_email: req.user.correo,
        client_reference_id: curso.id,
        metadata:{userid:req.user.id,
          cantidad:1},
        line_items: [
          {
            price_data: {
                currency: 'usd',
                unit_amount: (iva*100),
                product_data: {
                    name: `${curso.nombre} Curso`,
                    description: "PRECIO CON IVA INCLUIDO" + " "+ curso.resumen,
                    images: ['https://i.imgur.com/mOH1v1g.jpg'],
                },
              },
            quantity:1
          },
        ],
        mode: 'payment'
      });
    //3)Enviamos la repsuesta
        return res.status(200).json({
          status:'successful',
          session
      })
    }
    next(new AppError("No puedes comprar el curso debido a que ya se encuentra vinculado a tu cuenta.",404))
})

module.exports = { getCheckoutSession,createBooking,getBooking,updateBooking,deleteBooking,allBooking }