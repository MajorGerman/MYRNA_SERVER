const { ApolloServer } = require("apollo-server-express"); 
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core'); 
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require("express"); 
const http = require("http")


const PORT = 4000;


// importing types 
const { UserTypes } = require('./Schema/TypeDefs/User');

//importing resolvers 
const { UserResolvers } = require('./Schema/Resolvers/User');

// defining schema 
const schema = makeExecutableSchema({ 
    typeDefs:  [ UserTypes ], 
    resolvers: [ UserResolvers ]
})

const startApolloServer = async (schema) => { 
    const app = express(); 
    const httpServer = http.createServer(app); 
    const server = new ApolloServer({ 
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ]
    });

    await server.start() 
    server.applyMiddleware({ app, path: '/' }); 
    await httpServer.listen(PORT, () => { 
        console.log("Server succesfully started")
    })
}

startApolloServer(schema);