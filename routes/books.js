const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

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

/* Books listing for all books */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [["title"]]});
  res.render("books/index", { books, title: "All Books"});
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