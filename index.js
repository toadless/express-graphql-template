import "dotenv/config"
import express from "express"
import http from "http"
import apollo from "./config/apollo.js"
import middleware from "./config/middleware.js"
import "./config/mongodb.js"

// Initiating server - default express configuration
const PORT = process.env.PORT || 5000
const app = express()

// Load our middleware
app.use(middleware);

apollo.applyMiddleware({ app, cors: false })
// Build server using https or http depending on configurations declared above
const server = http.createServer(app)
// Run server, and console log on success
server.listen({ port: PORT }, () => {
    console.log(`Server listening on port ${PORT}`)
})