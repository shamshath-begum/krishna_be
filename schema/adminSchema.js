const mongoose=require('mongoose')
const validator=require('validator')
const AdminSchema=new mongoose.Schema({
    name:{type:String,required:true},
    
    email:{type:String,required:true ,
    validate:(value)=>validator.isEmail(value)
    },

    password:{type:String,required:true},
    cpassword:{type:String,required:true},
    imgpath:{type:String,required:true},
    createdAt:{type:Date,default:Date.now()}
},{versionKey:false})


const AdminModel=mongoose.model('admin',AdminSchema)
module.exports={AdminModel}

