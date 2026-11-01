// Shows 5 stars, with the first "rating" stars filled in.
//
// Props:
//   rating - a number from 0 to 5
//   onRate - (optional) a function to call when a star is clicked.
//            If you don't pass it, the stars are just for show.
const Stars = (props) => {
  const numbers = [1, 2, 3, 4, 5];

  return (
    <div className="stars">
      {numbers.map((number) => (
        <button
          key={number}
          type="button"
          className={number <= props.rating ? "star filled" : "star"}
          disabled={!props.onRate}
          onClick={() => props.onRate(number)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default Stars;