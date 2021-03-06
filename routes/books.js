const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");
const perPage = 10;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // res.status(500).send(error);
      next(error);
    }
  }
}

/* Function to return a list of numbers used for the pagination buttons */
function getButtonList(active, total) {
  let buttons;
  let current = parseInt(active);
  let all = parseInt(total);
  if(current <= 3) {
    buttons = [1, 2, 3, 4, 5];
  } else if( current >= all - 3) {
    buttons = [all - 4, all - 3, all - 2 ,all -1, all]
  } else {
    buttons = [current - 2, current - 1, current, current + 1, current + 2]
  }
  return buttons;
}

/* Books listing for all books */
router.get('/', asyncHandler(async (req, res) => {
  let page;
  if(!req.query.p){
    page = 1;
  } else {
    page = req.query.p;
  }

  const { count, rows } = await Book.findAndCountAll({ 
    order: [["title"]],
    limit: perPage,
    offset: (page - 1) * perPage
  });
  
  let books = rows;
  let numOfPages = Math.ceil(count / perPage);
  let buttons = getButtonList(page, numOfPages);
  res.render("books/index", { books, numOfPages, buttons, page, title: "All Books"});
}));


// /* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new-book", { article: {}, title: "New Book" });
});

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch(error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new-book", {book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* Test 500 error */
router.get('/error', asyncHandler(async (req, res) => {
  throw createHttpError(500, "You've entered an alternate universe. Hang on!");
}));

/* Books listing for all books */
router.get('/search', asyncHandler(async (req, res) => {
  const term = req.query.term;
  let page;
  if(!req.query.p){
    page = 1;
  } else {
    page = req.query.p;
  }
  const { count, rows } = await Book.findAndCountAll({ 
    order: [["title"]],
    where: {
      [Op.or]: {
      title: { [Op.like]: `%${term}%`},
      year: { [Op.like]: `%${term}%`},
      author: { [Op.like]: `%${term}%`},
      genre: { [Op.like]: `%${term}%`}
    }
    }
  });
  let books = rows;
  let numOfPages = Math.ceil(count / perPage);
  let buttons = getButtonList(page, numOfPages);
  res.render("books/index", { books, numOfPages, buttons, page, title: `Search results for "${term}"`, search: true});
}));


/* GET individual book form */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("books/update-book", { book,  title: "Update Book" });
  } else {
    throw createHttpError(404, "This book doesn't exist!");
  } 
}));

/* Update a book. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  } catch(error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("books/update-book", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));

/* Delete book. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

/* Delete book. */
router.post("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;