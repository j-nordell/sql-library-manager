const express = require('express');
const router = express.Router();
const Article = require('../models').Article;

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

/* Home redirects to /books . */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect("/books");
}));

/* Books listing for all books */
router.get('/books', asyncHandler(async (req, res) => {
  res.render("books", { books: {}, title: "All Books"});
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

/* Edit article form. */
router.get("/books/:id/edit", asyncHandler(async(req, res) => {
  res.render("articles/edit", { article: {}, title: "Edit Article" });
}));

/* GET individual article. */
router.get("/:id", asyncHandler(async (req, res) => {
  res.render("articles/show", { article: {}, title: "Article Title" }); 
}));

/* Update a book. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  res.redirect("/articles/");
}));

/* Delete book. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  res.render("articles/delete", { article: {}, title: "Delete Article" });
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  res.redirect("/articles");
}));

module.exports = router;