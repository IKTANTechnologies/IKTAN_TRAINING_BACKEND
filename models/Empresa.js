const mongoose = require('mongoose');
const slugify = require('slugify');

const empresaSchema = new mongoose.Schema({
    nombre:{
        type: String,
        maxlength: [300, "La empresa como maximo debe de tener 60 caracteres"],
        unique: true,
        required: [true, "El nombre de la empresa es obligatorio"],
    },
    url:{
        type: String,
    },
    key:{
        type: String,
    },
    slug:{
        type: String,
        unique: true
    },
});

empresaSchema.pre('save', function(next){
    this.slug = slugify(this.nombre,{  lower: true })
    next();
});

const Empresa = mongoose.model("Empresas",empresaSchema);

module.exports = Empresa;