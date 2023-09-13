const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Curso = require('../models/Curso');
const User = require('../models/User');
const router = express.Router();
const {enviarEmail, Email} = require('../utils/email');
//endpoint local.
let endpointSecret;
//endpointSecret = "whsec_09c810913c73589905ee903b5bbee7e227b89879bb880e855b7cea54bb3956e2";

router.post('/', express.raw({type: 'application/json'}), async(req, res) => {
  const sig = req.headers['stripe-signature'];
  let data;
  let eventType;
  if(endpointSecret){
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("webhook successful")
    } catch (err) {
      console.log(err)
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    data = req.data.object;
    eventType = req.type;
  }else{
    data = req.body.data.object;
    eventType = req.body.type;
  }
  //Eventos
  if(eventType ==="checkout.session.completed"){
    const user = await User.findById(req.body.data.object.metadata.userid);
    const curso = await Curso.findById(req.body.data.object.client_reference_id);
    const url = `${process.env.FRONTEND_URL}/mis-cursos/learning/${curso.slug}`;
    //!Se crea el pago
    const booking = await Booking.create({curso:req.body.data.object.client_reference_id,
    precio:req.body.data.object.amount_total,user:req.body.data.object.metadata.userid, cantidad:req.body.data.object.metadata.cantidad});
    //!Mandar correo de que se compro un curso
    user.curso = curso.nombre;
    await new Email(user,url).sendComprasteCurso()
    return res.send().end();
  }
  if(eventType === "checkout.session.expired" || eventType === "checkout.session.async_payment_failed"){
    console.log(req.body.data.object)
    const correo =req.body.data.object.customer_details.email;
    const user = await User.findOne({correo});
    //!Mandar correo de si la compra no se realizo con exito
    await new Email(user,url).sendFalloCompraCurso()
    return res.send().end();
  }
  //!Solucionar errores de las notificaciones
  res.send().end();
});


module.exports = router;