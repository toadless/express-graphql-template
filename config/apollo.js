import { ApolloServer } from "apollo-server-express"
import user from "../models/graphql/user.js"
import auth from "../models/graphql/auth.js"

// Export apollo server, built with all of the models (schemas and resolvers)
// imported above
export default new ApolloServer({
    // Note that order of modules in array is not important - i.e. A may appear
    // before B in the array, even if A may require types defined within B
    modules: [
        user,
        auth,
    ],
    // the context lets you access the request in the querys/mutations this is 
    // normally used for fetching cookies or setting the user
    context: ({ req }) => {
        const user = req.user;

        return {
            user: user,
        }
    },
    // apollo server playground (playground and introspection) should be
    // disabled for production by setting the 2 below fields to false
    introspection: true,
    playground: true,
})