const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');

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
    comments: Post
    content: String
    createdAt: Date
    updatedAt: Date
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    users: [User]
    posts: [Post]
  }
`;

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

const posts = [
  {
    id: 1,
    author: {
      id: 1,
      firstName: 'Kate',
      lastName: 'Chopin',
    },
    content: "blah",
    createdAt: "10/10/2021",
  },
  {
    id: 2,
    author: 1,
    content: "blah",
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    users: () => users,
    posts: () => posts,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

