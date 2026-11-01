import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BookCard from "../components/BookCard";
import BookCover from "../components/BookCover";

// The subjects you can pick. These are the names Open Library uses.
const SUBJECTS = ["fantasy", "science_fiction", "mystery", "romance", "history", "poetry"];

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [reading, setReading] = useState([]);
  const [subject, setSubject] = useState("fantasy");
  const [subjectBooks, setSubjectBooks] = useState([]);
  const [error, setError] = useState("");

  // Runs once when the page opens: get this week's trending books
  useEffect(() => {
    axios
      .get("/api/books/trending")
      .then((response) => {
        setTrending(response.data);
      })
      .catch((error) => {
        console.error("Error getting trending books:", error);
        setError("Could not load books. Is the server running?");
      });
  }, []);

  // Runs once when the page opens: get my shelf and keep only "reading" books
  useEffect(() => {
    axios
      .get("/api/shelf")
      .then((response) => {
        const readingBooks = response.data.filter((book) => book.shelf === "reading");
        setReading(readingBooks);
      })
      .catch((error) => {
        console.error("Error getting my shelf:", error);
      });
  }, []);

  // Runs when the page opens AND every time "subject" changes
  // (when you click a different subject button)
  useEffect(() => {
    setSubjectBooks([]); // clear the old books while the new ones load
    axios
      .get(`/api/books/subject/${subject}`)
      .then((response) => {
        setSubjectBooks(response.data);
      })
      .catch((error) => {
        console.error("Error getting subject books:", error);
      });
  }, [subject]);

  return (
    <div>
      {/* ---- Big title at the top ---- */}
      <section className="hero">
        <h1>
          Keep track of
          <br />
          what you read.
        </h1>
        <p className="muted">
          Search millions of books from Open Library, then sort them into Reading, Read, and Want to read.
        </p>
        <Link to="/search" className="button">
          Search for a book
        </Link>
      </section>

      {error && <p className="error">{error}</p>}

      {/* ---- Currently reading (only shows if you have some) ---- */}
      {reading.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Currently reading</h2>
            <Link to="/shelf" className="muted">
              View my shelf →
            </Link>
          </div>
          <div className="reading-list">
            {reading.map((book) => (
              <Link to={`/books/${book.work_id}`} key={book.work_id} className="reading-item">
                <div className="thumb">
                  <BookCover coverId={book.cover_id} title={book.title} size="S" />
                </div>
                <div>
                  <p className="book-title">{book.title}</p>
                  <p className="muted">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---- Trending ---- */}
      <section className="section">
        <h2>Trending this week</h2>
        {trending.length === 0 ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="book-grid">
            {trending.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* ---- Browse by subject ---- */}
      <section className="section">
        <h2>Browse by subject</h2>
        <div className="tabs subject-tabs">
          {SUBJECTS.map((name) => (
            <button
              key={name}
              className={name === subject ? "tab active" : "tab"}
              onClick={() => setSubject(name)}
            >
              {name.replace("_", " ")}
            </button>
          ))}
        </div>
        {subjectBooks.length === 0 ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="book-grid">
            {subjectBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;