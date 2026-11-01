// Shelf backend
// Run it with:  npm run dev
//
// This one file does three things:
//   1. Sets up the SQLite database (your saved books)
//   2. Gets book info from the Open Library API  (routes that start with /api/books)
//   3. Saves, changes, and deletes your books     (routes that start with /api/shelf)

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const Database = require("better-sqlite3");

const app = express();
const port = 3001;

// Lets us read JSON that the React app sends us (it shows up in req.body)
app.use(bodyParser.json());

// =====================================================================
// 1. DATABASE
// =====================================================================

// Opens the database file (it gets created the first time you run the server)
const db = new Database("shelf.db");

// Makes the "books" table. "IF NOT EXISTS" means it only happens once.
// We only save the book's id (to find it on Open Library) and MY info about it.
// The title, author, and cover come from Open Library every time (see GET /api/shelf).
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    work_id   TEXT PRIMARY KEY,
    shelf     TEXT NOT NULL,
    rating    INTEGER DEFAULT 0,
    notes     TEXT DEFAULT '',
    added_at  TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// The three shelves a book can be on
const SHELVES = ["want", "reading", "read"];

// =====================================================================
// 2. BOOK INFO FROM OPEN LIBRARY
// =====================================================================

// Open Library sends back a LOT of info about each book.
// This picks out only the parts our React app needs.
const simplifyBook = (book) => {
  return {
    id: book.key.replace("/works/", ""), // "/works/OL45804W" -> "OL45804W"
    title: book.title,
    author: book.author_name ? book.author_name[0] : "Unknown author",
    cover_id: book.cover_i || null,
  };
};

// The only fields we ask Open Library to send (makes the response smaller)
const FIELDS = "key,title,author_name,cover_i";

// GET /api/books/trending
// Books people are reading on Open Library this week
app.get("/api/books/trending", async (req, res) => {
  try {
    const response = await axios.get("https://openlibrary.org/trending/weekly.json?limit=6");
    const books = response.data.works.slice(0, 6).map(simplifyBook);
    res.send(books);
  } catch (error) {
    console.error("Trending failed:", error.message);
    res.status(500).send({ error: "Could not load trending books" });
  }
});

// GET /api/books/subject/fantasy
// Books about one subject
app.get("/api/books/subject/:subject", async (req, res) => {
  try {
    const subject = req.params.subject;
    const response = await axios.get(
      `https://openlibrary.org/search.json?subject=${subject}&limit=6&fields=${FIELDS}`
    );
    const books = response.data.docs.map(simplifyBook);
    res.send(books);
  } catch (error) {
    console.error("Subject failed:", error.message);
    res.status(500).send({ error: "Could not load books for that subject" });
  }
});

// GET /api/books/search?q=dune&page=1
// Searches Open Library, 12 books per page
app.get("/api/books/search", async (req, res) => {
  try {
    const q = req.query.q;
    const page = req.query.page || 1;
    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${q}&page=${page}&limit=12&fields=${FIELDS}`
    );
    res.send({
      total: response.data.numFound, // how many books matched in total
      books: response.data.docs.map(simplifyBook),
    });
  } catch (error) {
    console.error("Search failed:", error.message);
    res.status(500).send({ error: "Search failed. Try again." });
  }
});

// Gets all the details about one book from Open Library.
// We use this in two places: the Book Details page and My Shelf.
const getBookInfo = async (id) => {
  const response = await axios.get("https://openlibrary.org/works/" + id + ".json");
  const work = response.data;

  // The book only has its author's id, so we ask Open Library for the author's name
  let author = "Unknown author";
  if (work.authors && work.authors.length > 0) {
    const authorKey = work.authors[0].author.key; // looks like "/authors/OL79034A"
    const authorResponse = await axios.get("https://openlibrary.org" + authorKey + ".json");
    author = authorResponse.data.name;
  }

  // The description is sometimes plain text and sometimes { value: "text" }
  let description = "";
  if (typeof work.description === "string") {
    description = work.description;
  } else if (work.description) {
    description = work.description.value;
  }

  // Some books have no cover. Open Library uses -1 to mean "no cover".
  let coverId = null;
  if (work.covers && work.covers[0] > 0) {
    coverId = work.covers[0];
  }

  return {
    id: id,
    title: work.title,
    author: author,
    cover_id: coverId,
    description: description,
    subjects: work.subjects ? work.subjects.slice(0, 6) : [],
    first_published: work.first_publish_date || "",
  };
};

// GET /api/books/OL45804W
// All the details about one book
app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await getBookInfo(req.params.id);
    res.send(book);
  } catch (error) {
    console.error("Book details failed:", error.message);
    res.status(404).send({ error: "Could not find that book" });
  }
});

// =====================================================================
// 3. MY SHELF (our database)
// The ? marks in the SQL get filled in with the values after it.
// This is safer than gluing text into the SQL ourselves.
// =====================================================================

// GET /api/shelf
// Every saved book, newest first, with its title, author, and cover
app.get("/api/shelf", async (req, res) => {
  // 1. Our database only has each book's id and MY info (shelf, rating, notes)
  const savedBooks = db.prepare("SELECT * FROM books ORDER BY added_at DESC").all();

  try {
    // 2. Ask Open Library for each book's title, author, and cover.
    //    Promise.all sends all the requests at the same time and waits until every one is back.
    const books = await Promise.all(
      savedBooks.map(async (savedBook) => {
        const info = await getBookInfo(savedBook.work_id);
        return {
          work_id: savedBook.work_id,
          shelf: savedBook.shelf,
          rating: savedBook.rating,
          notes: savedBook.notes,
          title: info.title,
          author: info.author,
          cover_id: info.cover_id,
        };
      })
    );
    res.send(books);
  } catch (error) {
    console.error("Shelf failed:", error.message);
    res.status(500).send({ error: "Could not load your shelf" });
  }
});

// GET /api/shelf/OL45804W
// One saved book. "book" is null if it isn't on the shelf yet.
app.get("/api/shelf/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE work_id = ?").get(req.params.id);
  res.send({ book: book || null });
});

// POST /api/shelf
// Saves a new book. The React app sends the book's id and my info in req.body.
app.post("/api/shelf", (req, res) => {
  const book = req.body;

  // Check that we got what we need
  if (!book.work_id || !SHELVES.includes(book.shelf)) {
    return res.status(400).send({ error: "A book needs a work_id and a shelf" });
  }

  try {
    db.prepare("INSERT INTO books (work_id, shelf, rating, notes) VALUES (?, ?, ?, ?)").run(
      book.work_id,
      book.shelf,
      book.rating || 0,
      book.notes || ""
    );
    res.status(201).send(book); // 201 means "created"
  } catch (error) {
    // work_id is the PRIMARY KEY, so saving the same book twice fails
    res.status(400).send({ error: "This book is already on your shelf" });
  }
});

// PUT /api/shelf/OL45804W
// Changes the shelf, rating, and notes of a saved book
app.put("/api/shelf/:id", (req, res) => {
  if (!SHELVES.includes(req.body.shelf)) {
    return res.status(400).send({ error: "Shelf must be want, reading, or read" });
  }

  const result = db
    .prepare("UPDATE books SET shelf = ?, rating = ?, notes = ? WHERE work_id = ?")
    .run(req.body.shelf, req.body.rating || 0, req.body.notes || "", req.params.id);

  // result.changes is how many rows were updated. 0 means the book wasn't found.
  if (result.changes === 0) {
    return res.status(404).send({ error: "That book is not on your shelf" });
  }
  res.send({ message: "Book updated" });
});

// DELETE /api/shelf/OL45804W
// Removes a book from the shelf
app.delete("/api/shelf/:id", (req, res) => {
  const result = db.prepare("DELETE FROM books WHERE work_id = ?").run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).send({ error: "That book is not on your shelf" });
  }
  res.send({ message: "Book removed" });
});

// =====================================================================
// START THE SERVER
// =====================================================================

app.listen(port, () => {
  console.log(`Shelf server listening at http://localhost:${port}`);
});