// Shows a book's cover picture from Open Library.
// If the book has no cover, it shows a plain box with the title instead.
//
// Props:
//   coverId - the cover's number from Open Library (or null)
//   title   - the book's title
//   size    - "S", "M", or "L" (small, medium, large picture)
const BookCover = (props) => {
  if (props.coverId) {
    const size = props.size || "M";
    return (
      <img
        className="cover"
        src={`https://covers.openlibrary.org/b/id/${props.coverId}-${size}.jpg`}
        alt={props.title}
      />
    );
  }

  return (
    <div className="cover cover-placeholder">
      <span>{props.title}</span>
    </div>
  );
};

export default BookCover;