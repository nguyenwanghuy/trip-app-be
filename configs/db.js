import mongoose from "mongoose";
const MONGO_URL = process.env.MONGO_URL

export const connectToDatabase = async () => {
    try {
        const connect = await mongoose.connect(MONGO_URL)
        console.log(`database is connected to: ${connect.connection.host}`)
    } catch (error) {
        console.log(error.message)
        process.exit(1);
    }
}


