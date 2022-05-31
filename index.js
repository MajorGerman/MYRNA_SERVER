const { ApolloServer } = require("apollo-server-express"); 
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core'); 
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require("express"); 
const http = require("http")

const PORT = 4000;


// importing types 
const { UserTypes } = require('./Schema/TypeDefs/User');
const { PostTypes } = require('./Schema/TypeDefs/Post');
const { MeetingTypes } = require('./Schema/TypeDefs/Meeting');

//importing resolvers 
const { UserResolvers } = require('./Schema/Resolvers/User');
const { PostResolvers } = require('./Schema/Resolvers/Post');
const {MeetingResolvers} = require('./Schema/Resolvers/Meeting');

// defining schema 
const schema = makeExecutableSchema({ 
    typeDefs:  [ UserTypes , PostTypes, MeetingTypes], 
    resolvers: [ UserResolvers , PostResolvers, MeetingResolvers],
})

const startApolloServer = async (schema) => { 
    const app = express(); 
    const httpServer = http.createServer(app); 
    const server = new ApolloServer({ 
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ],
        introspection: true,
        context: ({req, res}) => ({req, res})
    });

    await server.start() 

    server.applyMiddleware({ app, path: '/' }); 
    await httpServer.listen(process.env.PORT || 4000, () => { 
        console.log("Server succesfully started")
    })
}

startApolloServer(schema);