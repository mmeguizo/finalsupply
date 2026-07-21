import mergedResolvers from './resolvers/index.js';
import mergedTypeDefs from './typeDefs/index.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import depthLimit from 'graphql-depth-limit';
import { GraphQLLocalStrategy, buildContext } from 'graphql-passport';
import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './passport/passport.config.js';
import { connectDB, disconnectDB } from './db/connectDB.js';
import MySQLSession from 'express-mysql-session';
const MySQLStore = MySQLSession(session);
import crypto from 'crypto';
import { Sequelize } from 'sequelize';
import './models/purchaseorder.js';
import './models/purchaseorderitems.js';
import './models/inspectionacceptancereport.js';
import { initAssociations } from './models/associations.js';
import { config } from './config.js';

configurePassport();

const app = express();
const httpServer = http.createServer(app);

if (config.isBehindProxy) {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitLoginMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

app.use('/graphql', generalLimiter);

const loginPath = '/graphql';
app.use(loginPath, (req, res, next) => {
  if (req.body && req.body.query && req.body.query.includes('login')) {
    return loginLimiter(req, res, next);
  }
  next();
});

const store = new MySQLStore({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

store.on('error', function (error) {
  console.error(error);
});

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    store: store,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
    },
    name: config.cookieName,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  introspection: !config.isProduction,
  validationRules: [depthLimit(config.graphqlMaxDepth)],
  formatError: (formattedError, error) => {
    const correlationId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
    console.error(`[graphql-error ${correlationId}]`, error?.extensions?.code, error?.message);
    return {
      message: formattedError.message,
      extensions: {
        code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
        ...(config.isProduction ? {} : { stack: formattedError.extensions?.stack }),
      },
    };
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await connectDB();

await server.start();

app.use(
  '/graphql',
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
  express.json({ limit: config.bodyLimit }),
  expressMiddleware(server, {
    context: ({ req, res }) => {
      return buildContext({ req, res });
    },
  })
);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON', err);
    return res.status(400).send({ status: 404, message: 'Bad JSON' });
  }
  next();
});

const gracefulShutdown = async () => {
  console.log('Received shutdown signal');
  try {
    await server.stop();
    await disconnectDB();
    await new Promise((resolve) => httpServer.close(resolve));
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

await new Promise((resolve) => httpServer.listen({ port: config.port }, resolve));
console.log(`🚀 Server ready on port ${config.port}`);

if (process.send) {
  process.send('ready');
}
