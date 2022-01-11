import { gql } from "apollo-server-express"
import user from "../mongoose/user.js";

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Mutation {
        createUser(
            email: String
            username: String
            password: String
        ): User
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Mutation: {
        createUser: async (_, args, context) => {

            return null;
        }
    },
}
// Package graphql schema (typeDefs), and resolvers as graphql schema module
// imported by ../server.js to build the apollo server
const graphqlModule = { typeDefs, resolvers }

// Exports
export default graphqlModule