const fs = require('fs')

class Archivo {

    constructor(directorio, codigo){
        this.directorio = directorio,
        this.codigo = codigo
    }

    leerArchivo =() => new Promise(((resolve, reject) => {
        return fs.readFile(this.directorio,this.codigo,function(err, res) {
            if (err){reject(err);}
            else{resolve(res);}
        });
    }));
    
    eliminarArchivo =() => new Promise(((resolve, reject) => {
        return fs.unlink(this.directorio,function(err, res) {
            if (err){reject(err);}
            else{ resolve(res);}
        });
    }));

    crearArchivo = () => new Promise(((resolve, reject) => {
        return fs.writeFile(this.directorio,function(err, res) {
         if (err !== null) {reject(err);}
         else {resolve(res);}
       });
    })); 
    
}

module.exports = Archivo