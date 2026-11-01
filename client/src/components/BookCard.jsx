import { Link } from "react-router-dom";
import BookCover from "./BookCover";

// One book in a grid: its cover, title, and author.
// Clicking it opens that book's details page.
//
// Props:
//   book - { id, title, author, cover_id }
const BookCard = (props) => {
  return (
    <Link to={`/books/${props.book.id}`} className="book-card">
      <BookCover coverId={props.book.cover_id} title={props.book.title} />
      <p className="book-title">{props.book.title}</p>
      <p className="muted">{props.book.author}</p>
    </Link>
  );
};

export default BookCard;
