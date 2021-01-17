// HP EliteDispaly E223 best affordable monitor for productivity

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({
  path: './config.env',
});

const port = process.env.PORT;
const DB = process.env.DB_LINK;

// connecting with mongodb database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((con) => {
    console.log('Database connection successfull 😀');
  })
  .catch((err) => {
    console.log(err);
  });

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception: 😪😪😪. Server is shutting down...');
  console.log(`Error: ${err.name} and Info: ${err.message}`);
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log(`App running 😀 on localhost: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(
    'Unhandled promise rejection: 😪😪😪. Server is shutting down...'
  );
  server.close(() => {
    process.exit(1);
  });
});
