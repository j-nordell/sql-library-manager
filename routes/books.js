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
router.get('/books/new', (req, res) => {
  res.render("books/new", { article: {}, title: "New Book" });
});

/* POST create book. */
router.post('/books/new', asyncHandler(async (req, res) => {
  const article = await Book.create(req.body);
  res.redirect("/books/" + book.id);
}));


/* GET individual book form */
router.get("/books/:id", asyncHandler(async (req, res) => {
  res.render("books/edit", { article: {}, title: "Book Details" }); 
}));

/* Update a book. */
router.post('/books/:id', asyncHandler(async (req, res) => {
  res.redirect("/books/");
}));

/* Delete book. */
router.get("/books/:id/delete", asyncHandler(async (req, res) => {
  res.render("books/delete", { article: {}, title: "Delete Book" });
}));

module.exports = router;