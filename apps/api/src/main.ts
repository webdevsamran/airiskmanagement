import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import graphqlUploadExpress from 'graphql-upload/public/graphqlUploadExpress.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { typeDefs } from './app/schema';
import { resolvers } from './app/resolvers';
import { createContext } from './app/context';

dotenv.config();

async function bootstrap() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/airiskmanagement";
  if (!MONGO_URI) throw new Error('MONGO_URI is not defined in .env');

  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  const app = express();

  app.use(cors({
    origin: '*', // or specify your frontend URL
    credentials: true,
  }));

  // Enable file upload support
  app.use(graphqlUploadExpress());
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  const HOST = process.env.MONGO_HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server ready at http://${HOST}:${PORT}${server.graphqlPath}`);
  });
}

bootstrap();
