const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: {
      tours,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true });
  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $min: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    //   {
    //     $match: { _id: { $ne: 'EASY' } },
    //   },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        num: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },

    {
      $sort: { num: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
