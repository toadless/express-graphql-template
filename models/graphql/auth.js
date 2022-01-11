import { gql } from "apollo-server-express"
import bcrypt, { hash } from "bcrypt"
import { generateRefreshToken, generateAccessToken, checkToken } from "../../lib/auth.js";
import User from "../mongoose/user.js";

// Define modular extensions to the graphql schema
const typeDefs = gql`
    extend type Mutation {
        register(
            email: String
            username: String
            password: String
        ): User

        logout: Boolean
    }

    extend type Query {
        login(
            email: String
            password: String
        ): User
    }
`
// Define resolvers for the above extensions to the graphql schema
const resolvers = {
    Mutation: {
        register: async (_, args, context) => {
            if (context.user) return context.user;
            
            const findByEmail = await User.findOne({ email: args.email });
            if (findByEmail) return null;

            const findByUsername = await User.findOne({ username: args.username });
            if (findByUsername) return null;

            const hashedPassword = await bcrypt.hash(args.password, 12)

            const user = await User.create({
                email: args.email,
                username: args.username,
                password: hashedPassword,
            });

            return user;
        },

        logout: async (_, args, context) => {
            if (!context.user) return false;

            const refreshToken = context.cookies["refresh-token"];

            context.clearCookie("access-token");
            context.clearCookie("refresh-token");

            const user = await User.findOne({ _id: context.user._id });

            const token = checkToken(refreshToken);
            if (!token) return false;

            user.refreshTokens = user.refreshTokens.filter(tkn => tkn.tokenJti != token.jti);
            await user.save();

            return true;
        }
    },

    Query: {
        login: async (_, args, context) => {
            if (context.user) return context.user;

            const user = await User.findOne({ email: args.email });
            if (!user) return null;

            const validPassword = await bcrypt.compare(args.password, user.password);
            if (!validPassword) return null;

            const id = { _id: user.id };

            const accessToken = generateAccessToken(id);
            const refreshToken = generateRefreshToken(id);

            context.cookie("access-token", accessToken.token, { httpOnly: true });
            context.cookie("refresh-token", refreshToken.token, { httpOnly: true });

            user.refreshTokens = [...user.refreshTokens, { tokenJti: refreshToken.payloadHash }];
            await user.save();

            return user;
        }
    }
}
// Package graphql schema (typeDefs), and resolvers as graphql schema module
// imported by ../server.js to build the apollo server
const graphqlModule = { typeDefs, resolvers }

// Exports
export default graphqlModule