import { useState, useEffect } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";

const Search = () => {
  const [typedText, setTypedText] = useState(""); // what's in the search box
  const [query, setQuery] = useState(""); // the words we searched for
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs every time the search words or the page number change
  useEffect(() => {
    if (query === "") {
      return; // nothing to search for yet
    }

    setLoading(true);
    setError("");
    axios
      .get(`/api/books/search?q=${query}&page=${page}`)
      .then((response) => {
        setBooks(response.data.books);
        setTotal(response.data.total);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error searching:", error);
        setError("Search failed. Try again.");
        setLoading(false);
      });
  }, [query, page]);

  // When you press Search: save the words and go back to page 1
  // (changing query or page runs the useEffect above)
  const handleSubmit = (event) => {
    event.preventDefault(); // stops the page from reloading
    if (typedText.trim() === "") {
      return;
    }
    setQuery(typedText);
    setPage(1);
  };

  const goToPage = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // 12 books per page. Math.ceil rounds up, so 30 books = 3 pages.
  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      <h1>Search</h1>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          value={typedText}
          onChange={(event) => setTypedText(event.target.value)}
          placeholder="Title, author, or keyword"
        />
        <button type="submit" className="button">
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {query === "" && <p className="muted">Type something above to start searching.</p>}

      {query !== "" && loading && <p className="muted">Searching...</p>}

      {query !== "" && !loading && (
        <div>
          <p className="muted">
            {total} results for "{query}"
          </p>

          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => goToPage(page - 1)}>
                ← Previous
              </button>
              <span className="muted">
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => goToPage(page + 1)}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;