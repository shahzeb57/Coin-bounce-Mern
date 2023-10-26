const mongoose = require ("mongoose")

 const {MONGODB_CONNECTION_STRING} =require('../config/index')
// const connectionString="mongodb+srv://shah:zeb51333@cluster0.fchhi4l.mongodb.net/coin-bounce?retryWrites=true&w=majority"

const dbConnect= async ()=>{
try {
    const conn=await mongoose.connect( MONGODB_CONNECTION_STRING);
    console.log(`database connected to host:${conn.connection.host}`);
} catch (error) {
    console.log(`error:${error}`);
}

}
module.exports = dbConnect;