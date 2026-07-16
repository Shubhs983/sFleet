const mongoose=require ('mongoose');
const driverSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    location:{
        type:{
            type:String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number],
            default:[0,0]
        }
    }
});
driverSchema.index({location:'2dsphere'});
const Driver=mongoose.model('Driver',driverSchema);
module.exports=Driver;