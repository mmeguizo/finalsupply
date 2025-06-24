import { startStandaloneServer } from "@apollo/server/standalone";
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
// import { connectDB, disconnectDB } from "./db/connectDB.js";
import { GraphQLLocalStrategy, buildContext } from "graphql-passport";
import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { configurePassport } from "./passport/passport.config.js";
import { connectDB, disconnectDB, syncTables} from "./db/connectDB.js";
import MySQLSession from "express-mysql-session";
const MySQLStore = MySQLSession(session);
import { Sequelize } from "sequelize";
dotenv.config();
// call passport config
configurePassport();

const app = express();
const httpServer = http.createServer(app);

const options = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

const store = new MySQLStore(options);

// Catch errors
store.on("error", function (error) {
    console.error(error);
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false, // don't save session if unmodified. false is recommended
        store: store, // store sessions on mongodb
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            httpOnly: true, // prevent cross scripting attacks
        },    
    })
);

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// connect db mysql
await connectDB();
await syncTables(); // Ensure tables exist in MySQL

// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.156.105:3000",
];

app.use(
    "/graphql",
    cors({
        // origin: "http://localhost:3000",
        origin: allowedOrigins,
        credentials: true,
    }),
    express.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        // context: async ({ req }) => ({ token: req.headers.token }),
        context: ({ req, res }) => buildContext({ req, res }),
    })
);

// After your existing server setup code
const gracefulShutdown = async () => {
    console.log("Received shutdown signal");
    try {
        await server.stop();
        await disconnectDB();
        await new Promise((resolve) => httpServer.close(resolve));
        console.log("Graceful shutdown completed");
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Move your existing server start code here
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);