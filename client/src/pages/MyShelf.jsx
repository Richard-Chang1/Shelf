import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BookCover from "../components/BookCover";
import Stars from "../components/Stars";
import { SHELVES, SHELF_NAMES } from "../shelves";

const MyShelf = () => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all"); // which tab is picked
  const [loading, setLoading] = useState(true);

  // Gets every saved book from our server
  const loadBooks = () => {
    axios
      .get("/api/shelf")
      .then((response) => {
        setBooks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting my shelf:", error);
        setLoading(false);
      });
  };

  // Runs once when the page opens
  useEffect(() => {
    loadBooks();
  }, []);

  // Deletes a book, then loads the list again so it disappears
  const removeBook = (workId) => {
    if (!window.confirm("Remove this book from your shelf?")) {
      return;
    }
    axios
      .delete(`/api/shelf/${workId}`)
      .then(() => {
        loadBooks();
      })
      .catch((error) => {
        console.error("Error removing book:", error);
      });
  };

  // Counts how many books are on one shelf
  const countBooks = (shelfName) => {
    return books.filter((book) => book.shelf === shelfName).length;
  };

  // Only show the books on the tab you picked
  let shownBooks = books;
  if (filter !== "all") {
    shownBooks = books.filter((book) => book.shelf === filter);
  }

  return (
    <div>
      <h1>My Shelf</h1>

      {/* ---- Tabs ---- */}
      <div className="tabs">
        <button className={filter === "all" ? "tab active" : "tab"} onClick={() => setFilter("all")}>
          All {books.length}
        </button>
        {SHELVES.map((name) => (
          <button
            key={name}
            className={filter === name ? "tab active" : "tab"}
            onClick={() => setFilter(name)}
          >
            {SHELF_NAMES[name]} {countBooks(name)}
          </button>
        ))}
      </div>

      {/* ---- The list ---- */}
      {loading && <p className="muted">Loading...</p>}

      {!loading && shownBooks.length === 0 && (
        <p className="muted">
          No books here yet. <Link to="/search">Find a book to add.</Link>
        </p>
      )}

      {shownBooks.map((book) => (
        <div key={book.work_id} className="shelf-row">
          <div className="thumb">
            <BookCover coverId={book.cover_id} title={book.title} size="S" />
          </div>

          <div className="shelf-row-info">
            <Link to={`/books/${book.work_id}`} className="book-title">
              {book.title}
            </Link>
            <p className="muted">{book.author}</p>
          </div>

          <Stars rating={book.rating} />

          <div className="row-actions">
            <Link to={`/books/${book.work_id}`}>Edit</Link>
            <button className="text-button" onClick={() => removeBook(book.work_id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyShelf;