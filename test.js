// Import the PrismaClient constructor from the @prisma/client node module.
const { PrismaClient } = require("@prisma/client")

// Instantiate PrismaClient
const prisma = new PrismaClient()

// Define an async function called main to send queries to the database. You will write all your queries inside this function.
async function main() {
  //const allUsers = await prisma.user.findMany()
  //console.log(allUsers)
  const newUser = await prisma.user.create({
    data: {
      firstName: 'GraphQL',
      lastName: 'www.howtographql.com',
      email: 'test',
      password: 'test',
    },
  })
}

// Call the main function.
main()
  .catch(e => {
    throw e
  })
  // Close the database connections when the script terminates.
  .finally(async () => {
    await prisma.$disconnect()
  })