const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.correo;
        this.firstName = user.nombre.split(' ')[0];
        this.curso = user.curso;
        this.url = url;
        const fromAddress = process.env.NODE_ENV === 'production'
            ? process.env.SENDGRID_FROM
            : process.env.EMAIL_FROM;

        this.from = `IKTAN TRAINING <${fromAddress}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            const sendgridHost = process.env.SENDGRID_HOST || 'smtp.sendgrid.net';
            const sendgridPort = Number(process.env.SENDGRID_PORT) || 587;
            const sendgridUser = process.env.SENDGRID_USER || 'apikey';
            const sendgridApiKey = process.env.SENDGRID_API_KEY || process.env.SENDGRID_PASSWORD;

            if (!sendgridApiKey) {
                throw new Error('Falta configurar SENDGRID_API_KEY (o SENDGRID_PASSWORD como fallback).');
            }

            return nodemailer.createTransport({
                host: sendgridHost,
                port: sendgridPort,
                secure: false,
                auth: {
                    user: sendgridUser,
                    pass: sendgridApiKey
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, tema) {
        // 1) Renderizar el html para le correo basado en una plantilla pug
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            curso: this.curso,
            url: this.url,
            subject: tema
        });

        // 2) Opciones de correo
        const opcionesEmail = {
            from: this.from,
            to: this.to,
            subject: tema,
            html,
            text: htmlToText.convert(html, { wordwrap: 130 })
        };

        // 3) Crear un transporte y enviar el email
        await this.newTransport().sendMail(opcionesEmail);
    }

    async sendConfirmarCuenta() {
        await this.send('confirmarToken', 'Tu cuenta ya esta casi lista');
    }

    async sendWelcome() {
        await this.send('welcome', 'Bienvenid@ a la familia de IKTAN TRAINING');
    }

    async sendPaswordReset() {
        await this.send('passwordReset', 'Su token de restablecimiento de contraseña(solo es valido por 10 minutos)');
    }

    // Cuando se compra un curso
    async sendComprasteCurso() {
        await this.send('comprasteCurso', 'Felicidades has adquirido un curso');
    }

    // Cuando falla la compra de un curso
    async sendFalloCompraCurso() {
        await this.send('falloCompraCurso', 'Hubo un error al realizar el pago');
    }

    // Vinculacion de cuenta
    async sendConfirmarVinculacionRH() {
        await this.send('vincularCuenta', 'Solicitud para vincular una cuenta con Recursos Humanos');
    }
}

const enviarEmail = async opciones => {
    // 1) Crear transportador
    const transportador = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // Activar en email la opcion aplicacion menos segura
    });

    // 2) Definimos las opciones de correo
    const opcionesEmail = {
        from: 'Victor Hugo Garcia Rodriguez <peke-vichugo900000@hotmail.com>',
        to: opciones.email,
        subject: opciones.subject,
        text: opciones.message
        // html:
    };

    // 3) Enviar email
    await transportador.sendMail(opcionesEmail);
};

module.exports = { enviarEmail, Email };