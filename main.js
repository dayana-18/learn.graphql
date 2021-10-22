const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');
const { PrismaClient } = require('@prisma/client')

const fs = require('fs');
const path = require('path');

//attach an instance of PrismaClient to the context when the GraphQLServer is being initialized.
const prisma = new PrismaClient()

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # User
  type User {
    id: Int!
    firstName: String
    lastName: String
    email: String
    password: String
  }

  # Date pour les posts
  scalar Date

  type MyType {
    created: Date
  }

  # Post crée par un utilisateur
  type Post {
    id: Int
    author: User
    comments: [Post]
    content: String
    createdAt: Date
    updatedAt: Date
  }

  type AuthPayload {
    token: String
    user: User
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    users: [User]
    posts: [Post]
    post(id: Int!): Post!
    commentsFromPost(id: Int!): Post!
    comment(id: Int!): Post!
  }

  type Mutation {
    signUp(firstName: String!, lastName: String!, email: String!, password: String!, name: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    post(authorId: Int!, content: String!, createdAt: Date, updatedAt: Date ): Post!
    updatePost(id: Int!, content: String): Post!
    deletePost(id: Int!): Post!
    addCommentToPost(id: Int!, comments: Int, updatedAt: Date ): Post!
  }
`;
//user(firstName: String, lastName: String, email: String, password: String ): User!

//test
const users = [
  {
    id: 1,
    firstName: 'Kate',
    lastName: 'Chopin',
  },
  {
    id: 2,
    firstName: 'Val',
    lastName: 'MZ',
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
/*const resolvers = {
  Query: {
    users: () => users,
    posts: () => posts,
  },
};*/

const resolvers = {
  Query: {
    //PrismaClient instance that allows the access to database through the Prisma Client API 
    //context lets resolvers communicate with each other
    
    //read users
    users: async (parent, args, context) => {
      return context.prisma.user.findMany()
    },
    //read posts
    posts: async (parent, args, context) => {
      return context.prisma.post.findMany()
    },

    //read post by id
    post: (parent, args, context) => {
      return context.prisma.post.findFirst({
        where: { id: Number(args.id) },
      });
    },

    //read all the comments from a post ???
    commentsFromPost: async (parent, args, context) => {
      return context.prisma.post.findMany({
        where: { id: Number(args.id) },
      })
    },

    //read a comment by id ???


  },

  Mutation: {
    //register
    signUp: (parent, args, context, info) => {
      const newUser = context.prisma.user.create({
        data: {
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: args.password,
        },
      })
      return newUser
    },

    //create post
    post: (parent, args, context, info) => {
      const newPost = context.prisma.post.create({
        data: {
          author: {
            connect: { id: args.authorId }
          },
          content: args.content,
          createdAt: args.createdAt,
          updatedAt: args.updatedAt,
        },
      })
      return newPost
    },

    //update post by id
    updatePost: (parent, args, context, info) => {
      const updatePost = context.prisma.post.update({
        where: { id: Number(args.id) },
        data: {
          content: args.content,
        },
      })
      return updatePost
    },

    //delete post by id
    deletePost: (parent, args, context, info) => {
      return context.prisma.post.delete({
        where: {id: Number(args.id)} },
        info,
      )
    },

    //create comment on a post ??? update le post et ajouter son tableau de posts
    addCommentToPost: (parent, args, context, info) => {
      const addCommentToPost = context.prisma.post.update({
        where: { id: Number(args.id) },
        data: {
          comments: args.comments,
        },
      })
      return addCommentToPost
    },

    //update a comment by id ???


    //delete a comment by id ???


  },

}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.

//const server = new ApolloServer({ typeDefs, resolvers });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    prisma,
  }
})

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

