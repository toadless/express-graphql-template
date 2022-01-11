import { gql } from "apollo-server-express"
import user from "../mongoose/user.js";

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Query {
        getUser: User
    }

    type User {
        _id: ID
        username: String
        email: String
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Query: {
        getUser: async (_, args, context) => {
            return context.user;
        }
    },
}
// Package graphql schema (typeDefs), and resolvers as graphql schema module
// imported by ../server.js to build the apollo server
const graphqlModule = { typeDefs, resolvers }

// Exports
export default graphqlModule