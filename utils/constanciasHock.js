const pug = require('pug');
const pdf = require('html-pdf');
const S3 = require('aws-sdk/clients/s3');
const { AWS_BUCKET_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME} = process.env;
const s3 = new S3({
region: AWS_BUCKET_REGION,accessKeyId: AWS_ACCESS_KEY,
secretAccessKey: AWS_SECRET_KEY})
const Handlebars = require("handlebars");
const Archivo = require("../utils/archivo")
const puppeteer =require ('puppeteer'); 
class Constancia{
    constructor(user,curso,calificacion){
        user.curp = this.descomponerPalabra(user.curp);
        user.shcp = this.descomponerPalabra(user.shcp);
        this.id = user.id;
        this.user = user;
        this.curso = curso;  
        if(this.curso.nombre == "Implementación de los Lineamientos para la Prevención y Control Integral de Emisiones de Metano del Sector Hidrocarburos Grupo 01"){
          this.curso.nombre = "Implementación de los Lineamientos para la Prevención y Control Integral de Emisiones de Metano del Sector Hidrocarburos"
        }
        if(this.curso.nombre == "Implementación de los Lineamientos para la Prevención y Control Integral de Emisiones de Metano del Sector Hidrocarburos Grupo 02"){
          this.curso.nombre = "Implementación de los Lineamientos para la Prevención y Control Integral de Emisiones de Metano del Sector Hidrocarburos"
        }
        this.calificacion = calificacion;
        if(curso.fechaInicio && curso.fechaFinalizacion){
            this.fechas ={
                inicio: this.formatearFecha(curso.fechaInicio),
                final: this.formatearFecha(curso.fechaFinalizacion)
              }
        }
    }

    descomponerPalabra(dato){
        let datos=[];
        for (var i = 0; i < dato.length; i++) {
            datos[i] = dato.charAt(i)
          }
        return datos;
    }

    formatearFecha(fechaFinalizacion){
        const nuevaFecha = new Date(fechaFinalizacion)
        let date=new Intl.DateTimeFormat('en-GB', {year: "numeric",month: "2-digit",
        day: "2-digit",}).format(nuevaFecha);
        date = date.split("/")
        date[0] = this.descomponerPalabra(date[0]);
        date[1] = this.descomponerPalabra(date[1]);
        date[2] = this.descomponerPalabra(date[2]);
        return date
      }

      createPDFBuffer = (html, opciones)=> new Promise(((resolve, reject) => {   
      pdf.create(html,opciones).toBuffer(function(err, res) {
        if (err !== null) {reject(err);}
        else { resolve(res);}
      });}))

    async createPDF(template,orientation,carpeta,format){
        //1)Renderizar el html para le correo basado en una plantilla pug
        if(template =="iktan"){
          const html = `
          <!DOCTYPE html>
          <html lang="en">
          
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
            <style>
            @import url('http://fonts.cdnfonts.com/css/avenir');
            *{
              font-family: 'UTM Avo', sans-serif;
              
              
          }
      
            .background {
              background-image: url(${this.curso.iktan.logoFondo.url});
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center center;
              height: 100%;
            }
            
            .border{
              border-width: 1px;
              border-style: solid;
              border-color: #c6c6c6;
            }
      
              .flexrow{
                  width: 100%;
                  height: 4%;
                  display: -webkit-box;
                  display: -ms-flexbox;
                  display: flex;
                  flex-direction:row ;
                  padding-top: 5px;  
                  /*margin-top: 0; */ /*En 3 renglones*/
              }
      
              .itemuno{
                  flex-basis: 50%;
                  margin-left: 125px;
                  margin-top: 2%;
                  text-align: center;
              }
      
              .itemdos{
                  flex-basis: 50%;
                  margin-left: 125px;
                  margin-top: 2%;
                  text-align: center;
              }
      
              .textdospuntos{
                font-size: 10px;
                line-height: 10px;
                  font-weight: 100;
                  padding-left: 70px;
                  padding-top: 3.5%;
              }
      
              .nombre{
                  font-size: 17px; 
                  line-height: 10px;
                  /* line-height: 5px; */ /*En tres renglones*/
                  font-weight: 100;
                  padding-left: 70px;
                  font-family: 'UTM Avo', sans-serif;
                  
              }
      
              .subtitulo{
                font-size: 10px;
                /*line-height: 0px;*/ /*En 3 renglones*/
                  line-height: 10px;
                  font-weight: 100;
                  padding-left: 70px;
                  padding-top: 2px;
              }
            
              .titulo{ 
                  /*font-size: 18px; */ /*Tamaño 3 renglones*/
                  /*line-height: 0px; */ /*Tamaño 3 renglones*/
                  font-size: 14px;
                  font-weight: 100;
                  line-height: 25px; 
                  padding-left: 70px;
                  padding-right: 240px;
                  
              }
      
              .calificacion{
                font-size: 10px;
                /*line-height: 8px;*/ /*En 3 renglones*/
                  line-height: 10px;
                  font-weight: 100;
                  padding-left: 70px
              }
      
              .texto{
                  font-size: 10px;
                  line-height: 10px; 
                  /* line-height: 5px;*/ /*En 3 renglones*/
                  font-weight: 100;
                  line-height: 16px;
                  padding-left: 70px;
                  padding-right: 63px;
                  text-align: justify;
              }
      
              .nombrenegrita{
                  font-size: 11px; 
                  line-height: 5px;
                  font-weight: 800;
                  
              }
      
              .puemre{
                  font-size: 11px; 
                  line-height: 5px;
                  font-weight: 100;
                  text-align: center;
                  line-height: 5px;
              }
              
              .contenedor-imagenes{
                  width: 100%;
                  height: 5%;
                  display: -webkit-box;
                  display: -ms-flexbox;
                  display: flex;
                  flex-direction:row ;
              }
      
              .tamaño-logo{
                  height: 80px;
                  width:  auto;
                  margin-left: 33%;
                  margin-right: 50%;
                  /* margin-top: 11%; */ /*En tres renglones*/
                  margin-top: 12%;
              }
      
              .tamaño-cuadro{
                  height: 270px;
                  width:  auto;
                  margin-left: 43%;
                  margin-right: 50%;
                  position: absolute;
              }
      
              .qr{
                  position: absolute;
                  height: 50px;
                  width:  auto;
                  margin-top: 12%;
                  margin-left: 12.5%;
              }
      
              .folio{
                  text-align: end;
                  font-size: 8px;
                  line-height: 5px;
                  padding-right: 40px;
                  margin-top: 3%;
              }
      
              .link{
                  text-align: end;
                  font-size: 8px;
                  line-height: 5px;
                  padding-right: 40px;
              }
      
              .firma1{  
                  height: 45px;
                  width:  auto;
                  margin-left: 7%;
              }
      
              .firma2{
                  height: 45px;
                  width:  auto;
                  margin-left: 7%; 
              }
      
            </style>
          
      
      
            <title>Document</title>
          </head>
      
        <body class="contenedor">
        
        <div class="border background">
      
        
        <div class=" contenedor-imagenes" >
          <div >
              <img class= " tamaño-logo " src=${this.curso.iktan.logoIzquierdo.url} alt="logo" >
          </div>
      
          <div>
              <img class=" tamaño-cuadro " src= "https://iktan-training-production.s3.amazonaws.com/Templates/Imagenes/Cuadro+gris+1.png?fbclid=IwAR1e4dP_XH86qXPOVrg3mspU798qs4uzauwvEzXaKf6tmuPrtlx274hRFEA" alt="cuadro" >
          </div>
          </div>
        
      
        <div>
        <h3 class=" textdospuntos" >Extendido a:</h3>
        <h2 class=" nombre "> ${this.user.nombre} ${this.user.apellidoPaterno} ${this.user.apellidoMaterno}</h2>
        <h3 class=" subtitulo ">Por haber completado satisfactoriamente el curso de:</h3>
        <h2 class=" titulo ">${this.curso.nombre}</h2>
        <h3 class=" calificacion ">Con una calificación de ${this.calificacion}</h3>
        <h3 class=" texto " >${this.curso.iktan.descripcion}</h3>
      
        <div class=" flexrow  ">
              <div class=" itemuno ">
      
                  <img class=" firma1 " src=${this.curso.iktan.capacitadorUno.firmaElectronica.url} alt="firma1" >
      
                  <p class=" nombrenegrita" >${this.curso.iktan.capacitadorUno.nombre} ${this.curso.iktan.capacitadorUno.apellidoPaterno} ${this.curso.iktan.capacitadorUno.apellidoMaterno}</p>
                  <p class=" puemre " >${this.curso.iktan.capacitadorUno.puestoCapacitador}</p>
                  <p class=" puemre " >${this.curso.iktan.capacitadorUno.empresaCapacitador}</p>
                  <p class=" puemre " >Empresas de Hidrocarburos</p>

              </div>
      
              <div class=" itemdos ">
      
                <img class=" firma2 " src=${this.curso.iktan.capacitadorDos.firmaElectronica.url}  alt="firma1" >
      
                  <p class=" nombrenegrita" >${this.curso.iktan.capacitadorDos.nombre} ${this.curso.iktan.capacitadorDos.apellidoPaterno} ${this.curso.iktan.capacitadorDos.apellidoMaterno}</p>
                  <p class=" puemre ">${this.curso.iktan.capacitadorDos.puestoCapacitador}</p>
                  <p class=" puemre ">${this.curso.iktan.capacitadorDos.empresaCapacitador}</p>
              </div>
      
              <img class=" qr " src="https://iktan-training-production.s3.amazonaws.com/Templates/Imagenes/QR-Validador.png?fbclid=IwAR2b3O4_-EwuxVuM47IM5TbUp84jIPOz_zxI53B1ky6MVdw6KDR89hHiTGg" alt="QR" >
      
        </div>
      
      
        <div>
              <p class="folio" >Folio: ${this.user.folio}  </p>
              <p class="link" >WWW.IKTANTRAINING.COM/REGISTROS </p>
        <div>
      
      
        </div>
        
        </div>
        
        </body>
        
        </html>
          `;
      
          const opciones = {
              "format": "Letter", //A3, A4, A5, Legal, Letter 
              "orientation": "landscape",
              "border":{
                  "top": ".3cm",
                  "right": ".3cm",
                  "bottom": ".3cm",
                  "left": ".3cm",
              },
              childProcessOptions: {
                env: {
                  OPENSSL_CONF: '/dev/null',
                },
              },
              timeout: '100000' 
          }
          const fileName = `${this.user.nombre} ${this.user.apellidoPaterno} ${this.user.apellidoMaterno}.pdf`
          const respuesta =await this.createPDFBuffer(html,opciones).then(async res=>{
            const uploadConstancia = {
              Bucket:AWS_BUCKET_NAME,
              Body: res, 
              Key: `Cursos/${this.curso.nombre}/Constancias/${carpeta}/${fileName}`} 
              return await  s3.upload(uploadConstancia).promise(); 
          }) 
         return respuesta.Location; 
        }else{
          const html = pug.renderFile(`${__dirname}/../views/constancias/${template}.pug`,{
            user: this.user,
            curso: this.curso,
            calificacion: this.calificacion,
            fechas: this.fechas
        });
        //2)Opciones de pdf
        const opciones={
            format, // A3, A4, A5, Legal, Letter
            orientation, // horizontal // portrait or landscape
            "border": {
                "top": ".3cm", //   default is 0, units: mm, cm, in, px
                "right": ".6cm",
                "bottom": ".3cm",
                "left": ".6cm",
              },
              childProcessOptions: {
                env: {
                  OPENSSL_CONF: '/dev/null',
                },
              }
        }
        //3)Crear el pdf
        const fileName = `${this.user.nombre} ${this.user.apellidoPaterno} ${this.user.apellidoMaterno}.pdf`
        const respuesta =await this.createPDFBuffer(html,opciones).then(async res=>{
          const uploadConstancia = {
            Bucket:AWS_BUCKET_NAME,
            Body: res, 
            Key: `Cursos/${this.curso.nombre}/Constancias/${carpeta}/${fileName}`} 
            return await  s3.upload(uploadConstancia).promise(); 
        }) 
       return respuesta.Location; 
        }
       
      /////////////////////////////////////////
      /*
      const fileName = `${this.user.nombre} ${this.user.apellidoPaterno} ${this.user.apellidoMaterno}.pdf`
      // Compila la plantilla HTML utilizando Handlebars
      const template2 = Handlebars.compile(await new Archivo(`${__dirname}/../views/constancias/${template}/${template}.html`,"utf8")
        .leerArchivo());
        //console.log(chromium.path)

      //Seguridad desavilitada
      const browser = await puppeteer.launch();
        console.log(browser)
      //Crea una nueva página
      const page = await browser.newPage();

      // Carga la plantilla HTML desde una URL o un archivo local
      let direccion;
      if(template === "iktan"){direccion ="https://iktan-training-production.s3.amazonaws.com/Templates/Constancias/IKTAN/iktan.html"}
      if(template === "dc-3"){direccion="https://iktan-training-production.s3.amazonaws.com/Templates/Constancias/DC-3/dc-3.html"}
      await page.goto(direccion, {
        waitUntil: "networkidle0",
      });
      // Genera el HTML dinámico
      const html2 = template2({
        user: {
          nombre: this.user.nombre + " "+this.user.apellidoPaterno + " " +this.user.apellidoMaterno,
          ocupacionEspecifica: this.user.ocupacionEspecifica,
          curp: this.descomponerPalabra(this.user.curp),
          puesto: this.user.puesto,
          razonSocial: this.user.razonSocialEmpresa,
          shcp: this.descomponerPalabra(this.user.shcp),
          representanteLegal: this.user.representanteLegal,
          representanteTrabajadores: this.user.representanteTrabajadores,
          folio: this.user.folio
        },
        curso:{
          nombre: this.curso.nombre,
          duracion: this.curso.duracion,
          //fechas:this.fechas,
          fechas:{inicio: [2, 0, 2, 2, 1, 2, 2, 7],final: [2, 0, 2, 2, 1, 2, 2, 7]},
          areaTematica: this.curso.areaTematica,
          descripcion: this.curso.descripcion
        },
        capacitador:{
          nombre: this.capacitadorPrincipal.nombre + " "+this.capacitadorPrincipal.apellidoPaterno + " " +this.capacitadorPrincipal.apellidoMaterno,
          firmaElectronica: this.capacitadorPrincipal.firmaElectronica.url,
          empresa: this.capacitadorPrincipal.empresaCapacitador,
          puesto: this.capacitadorPrincipal.puestoCapacitador
        },
        capacitador2:{
          nombre: this.capacitadores.nombre + " "+this.capacitadores.apellidoPaterno + " " +this.capacitadores.apellidoMaterno,
          firmaElectronica: this.capacitadores.firmaElectronica.url,
          empresa: this.capacitadores.empresaCapacitador,
          puesto: this.capacitadores.puestoCapacitador
        }
      });
      // Establece el contenido HTML en la página
      await page.setContent(html2);
      let body;
      // Genera el PDF
      if(template === "iktan"){
        body= await page.pdf({
          format: format,
          landscape: true,
          printBackground: true,
          margin: {
            top: "0.5cm",
            right: "0.5cm",
            bottom: "0.5cm",
            left: "0.5cm",
          },
        });
      }
      if(template === "dc-3"){
        body = await page.pdf({
          format: format,
          printBackground: true,
          margin: {
            top: "0.3cm",
            right: "1cm",
            bottom: "0.3cm",
            left: "1cm",
          },
        });
      }
      

      const uploadConstancia = {
        Bucket:AWS_BUCKET_NAME,
        Body: body, 
        Key: `Cursos/${this.curso.nombre}/Constancias/${carpeta}/${fileName}`} 
      const url = await  s3.upload(uploadConstancia).promise(); 
      await browser.close();
      console.log(url)
      return url.Location */
    }     
    async createIktan(){
        return await this.createPDF('iktan','landscape','Iktan','Letter')
     }
     async createDC3(){
        return await this.createPDF('dc-3','portrait','DC-3','A4')
     }
}

module.exports = Constancia;