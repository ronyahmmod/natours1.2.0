const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(`${__dirname}/public`));

const AppError = require('./utils/appError');
// ROUTES
const tourRoutes = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
