const express = require('express');
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
      res.status(500).send(error);
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
  
  console.log(page);
  // console.log(rows);
  let books = rows;
  let numOfPages = Math.ceil(count / perPage);
  let buttons = getButtonList(page, numOfPages);
  res.render("books/index", { books, numOfPages, buttons, page, title: "All Books"});
}))


/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new", { article: {}, title: "New Book" });
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
      res.render("books/new", {book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

/* Books listing for all books */
router.get('/search', asyncHandler(async (req, res) => {
  const term = req.query.term;
  const books = await Book.findAll({ 
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
  res.render("books/index", { books, title: `Search results for "${term}"`, search: true});
}))


/* GET individual book form */
router.get("/:id", asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("books/edit", { book,  title: "Update Book" });
  } else {
    res.sendStatus(404);
  } 
}));

/* Update a book. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
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
      res.render("books/edit", { book, errors: error.errors, title: "Update Book" })
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