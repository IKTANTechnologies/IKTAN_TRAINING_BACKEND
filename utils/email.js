const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

const createSmtpTransport = () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        throw new Error('Falta configurar SMTP_HOST, SMTP_PORT, SMTP_USER o SMTP_PASS.');
    }

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });
};

const getMailFrom = () => {
    const fromName = process.env.MAIL_FROM_NAME;
    const fromEmail = process.env.MAIL_FROM_EMAIL;

    if (!fromName || !fromEmail) {
        throw new Error('Falta configurar MAIL_FROM_NAME o MAIL_FROM_EMAIL.');
    }

    return `"${fromName}" <${fromEmail}>`;
};

const getVerificationUrl = token => {
    if (!process.env.FRONTEND_URL || !process.env.EMAIL_VERIFY_PATH) {
        throw new Error('Falta configurar FRONTEND_URL o EMAIL_VERIFY_PATH.');
    }

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, '');
    const verifyPath = process.env.EMAIL_VERIFY_PATH.startsWith('/')
        ? process.env.EMAIL_VERIFY_PATH
        : `/${process.env.EMAIL_VERIFY_PATH}`;

    return `${frontendUrl}${verifyPath}?token=${token}`;
};

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = getVerificationUrl(token);
    const subject = 'Confirma tu cuenta';
    const html = `
        <!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <title>${subject}</title>
          </head>
          <body style="margin:0; padding:0; background-color:#f4f5f7; color:#222222; font-family:Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f5f7; width:100%; margin:0; padding:32px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
                    <tr>
                      <td style="background-color:#ffc400; padding:30px 32px 24px 32px;">
                        <div style="color:#ffffff; font-size:28px; font-weight:800; line-height:1.1;">IKTAN Training</div>
                        <div style="color:#222222; font-size:38px; font-weight:800; line-height:1.05; margin-top:26px;">Confirma tu cuenta</div>
                        <div style="width:86px; height:5px; background-color:#222222; margin-top:20px;"></div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:34px 32px 28px 32px;">
                        <p style="font-size:18px; line-height:1.55; margin:0 0 16px 0; color:#222222;">Hola,</p>
                        <p style="font-size:18px; line-height:1.55; margin:0 0 24px 0; color:#222222;">Tu cuenta en IKTAN Training ya esta casi lista. Confirma tu correo para activar tu acceso a la plataforma.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px 0;">
                          <tr>
                            <td style="background-color:#000000; border-radius:999px; text-align:center;">
                              <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:14px 28px; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">Confirmar cuenta</a>
                            </td>
                          </tr>
                        </table>
                        <p style="font-size:14px; line-height:1.55; margin:0; color:#6b7280;">Si tienes problemas para confirmar tu cuenta, visita nuestra pagina y contactanos.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color:#111111; padding:18px 32px; color:#ffffff; font-size:13px; line-height:1.5;">
                        IKTAN Training | Capacitacion y aprendizaje sin limites
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
    `;

    await createSmtpTransport().sendMail({
        from: getMailFrom(),
        to: email,
        replyTo: process.env.MAIL_REPLY_TO,
        subject,
        html,
        text: htmlToText.convert(html, { wordwrap: 130 })
    });
};

class Email {
    constructor(user, url) {
        this.to = user.correo;
        this.firstName = user.nombre.split(' ')[0];
        this.curso = user.curso;
        this.url = url;
        const fromAddress = process.env.MAIL_FROM_EMAIL || (
            process.env.NODE_ENV === 'production'
                ? process.env.SENDGRID_FROM
                : process.env.EMAIL_FROM
        );

        if (!fromAddress) {
            throw new Error('Falta configurar el correo remitente.');
        }

        this.from = process.env.MAIL_FROM_NAME
            ? `"${process.env.MAIL_FROM_NAME}" <${fromAddress}>`
            : `IKTAN TRAINING <${fromAddress}>`;
    }

    newTransport() {
        if (process.env.SMTP_HOST) {
            return createSmtpTransport();
        }

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
            replyTo: process.env.MAIL_REPLY_TO,
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
        await this.send('welcome', 'Tu cuenta de IKTAN Training ha sido confirmada');
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

module.exports = { enviarEmail, Email, sendVerificationEmail };
