const S3 = require('aws-sdk/clients/s3');
const { AWS_BUCKET_REGION, AWS_ACCESS_KEY, 
        AWS_SECRET_KEY, AWS_BUCKET_NAME} = process.env;

const s3 = new S3({
    region: AWS_BUCKET_REGION,
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
})

class Aws{
    constructor(directorio,buffer){
        this.directorio = directorio
        this.buffer = buffer
    }

    opciones () {
        return{ Bucket:AWS_BUCKET_NAME,
            Body: this.buffer, 
            Key: this.directorio}
    }
    async subirArchivo(){
        return await s3.upload(this.opciones()).promise();   
    }
    async listaArchivos(){
        return s3.listObjects(this.opciones()).promise();
    }
    async deleteArchivo(){
        return s3.deleteObject({Bucket:AWS_BUCKET_NAME,Key: this.directorio}).promise();
    }
}

module.exports = Aws;
/*
const uploadPhoto = {
    Bucket: AWS_BUCKET_NAME,
    }  
  //s3.deleteObjects(uploadPhoto,(err,data)=>{})
  console.log(uploadPhoto)
  const t =s3.listObjects(uploadPhoto,(err,data)=>{
    console.log(data.Contents.key)
    for(var i = 0; i<data.Contents.length; i++){
        var deleteParam = {
      Bucket: AWS_BUCKET_NAME,
      Delete: {
          Objects: [
              {Key: `${data.Contents[i].Key}`},
          ]
      }
  };    
  s3.deleteObjects(deleteParam ,(err,data)=>{})
      console.log(data.Contents[i].Key)
  }})
  */

          //const t  = await new Aws().listaArchivos();
        //const t2 = await new Aws().deleteArchivo()