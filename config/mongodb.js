import mongoose from "mongoose"

// Declare required environment variables
const url = process.env.MONGODB;

// Connect to server using mongoose
mongoose.connect(url, { useNewUrlParser: true })
mongoose.connection.once("open", () => {
    console.log(`Connected to mongo database at ${url}`)
})