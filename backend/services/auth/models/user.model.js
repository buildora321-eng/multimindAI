import mongoose from "mongoose";


const userSchema= new mongoose.Schema({
    firebaseUid: {
        type:String,
        unique:true
    },
    name:{
        type:String,
        trim:true,
        maxlength:100
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
        sparse:true
    },
    password:{
        type:String,
        select:false
    },
    avatar:String,
    authProviders:{
        type:[{
            type:String,
            enum:["google","local"]
        }],
        default:["google"]
    }
},{
    timestamps:true,
    toJSON:{
        transform(_doc, ret){
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
})

const User=mongoose.model("User",userSchema)
export default User
