import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookCover from "../components/BookCover";
import Stars from "../components/Stars";
import { SHELVES, SHELF_NAMES } from "../shelves";

const BookDetails = () => {
  // The book's id from the URL. For /books/OL45804W, id is "OL45804W".
  const { id } = useParams();

  const [book, setBook] = useState(null); // info from Open Library
  const [isSaved, setIsSaved] = useState(false); // is it on my shelf already?
  const [error, setError] = useState("");

  // What you pick in the form
  const [shelf, setShelf] = useState("want");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  // Runs when the page opens: get the book's info
  useEffect(() => {
    axios
      .get(`/api/books/${id}`)
      .then((response) => {
        setBook(response.data);
      })
      .catch((error) => {
        console.error("Error getting book:", error);
        setError("Could not load this book.");
      });
  }, [id]);

  // Runs when the page opens: check if this book is already on my shelf
  useEffect(() => {
    axios
      .get(`/api/shelf/${id}`)
      .then((response) => {
        const savedBook = response.data.book;
        if (savedBook) {
          // It's saved, so fill the form with what I saved before
          setIsSaved(true);
          setShelf(savedBook.shelf);
          setRating(savedBook.rating);
          setNotes(savedBook.notes);
        }
      })
      .catch((error) => {
        console.error("Error checking my shelf:", error);
      });
  }, [id]);

  // Add the book to my shelf (POST), or save my changes if it's already there (PUT)
  const handleSave = () => {
    if (isSaved) {
      axios
        .put(`/api/shelf/${id}`, { shelf: shelf, rating: rating, notes: notes })
        .then(() => {
          setMessage("Changes saved!");
        })
        .catch((error) => {
          console.error("Error saving:", error);
          setMessage("Could not save. Try again.");
        });
    } else {
      // We only send the id and my info. The server gets the title, author,
      // and cover from Open Library when it needs them.
      const newBook = {
        work_id: id,
        shelf: shelf,
        rating: rating,
        notes: notes,
      };
      axios
        .post("/api/shelf", newBook)
        .then(() => {
          setIsSaved(true);
          setMessage("Added to your shelf!");
        })
        .catch((error) => {
          console.error("Error adding:", error);
          setMessage("Could not add this book. Try again.");
        });
    }
  };

  // Take the book off my shelf (DELETE)
  const handleRemove = () => {
    axios
      .delete(`/api/shelf/${id}`)
      .then(() => {
        setIsSaved(false);
        setShelf("want");
        setRating(0);
        setNotes("");
        setMessage("Removed from your shelf.");
      })
      .catch((error) => {
        console.error("Error removing:", error);
      });
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (book === null) {
    return <p className="muted">Loading...</p>;
  }

  return (
    <div className="details">
      <div className="details-cover">
        <BookCover coverId={book.cover_id} title={book.title} size="L" />
      </div>

      <div className="details-info">
        <h1>{book.title}</h1>
        <p className="author">by {book.author}</p>
        {book.first_published && <p className="muted">First published {book.first_published}</p>}

        <div className="chips">
          {book.subjects.map((subject) => (
            <span key={subject} className="chip">
              {subject}
            </span>
          ))}
        </div>

        <p className="description">{book.description}</p>

        {/* ---- The form for saving the book ---- */}
        <div className="shelf-form">
          <h2>{isSaved ? "On your shelf" : "Add to your shelf"}</h2>

          <p className="label">SHELF</p>
          <div className="shelf-buttons">
            {SHELVES.map((name) => (
              <button
                key={name}
                className={name === shelf ? "selected" : ""}
                onClick={() => setShelf(name)}
              >
                {SHELF_NAMES[name]}
              </button>
            ))}
          </div>

          <p className="label">YOUR RATING</p>
          <Stars rating={rating} onRate={setRating} />

          <p className="label">NOTES</p>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What did you think? (optional)"
            rows="3"
          />

          <div className="form-actions">
            <button className="button" onClick={handleSave}>
              {isSaved ? "Save changes" : "Add to shelf"}
            </button>
            {isSaved && (
              <button className="text-button" onClick={handleRemove}>
                Remove from shelf
              </button>
            )}
            {message && <span className="muted">{message}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;