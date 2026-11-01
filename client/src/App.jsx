import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import BookDetails from "./pages/BookDetails";
import MyShelf from "./pages/MyShelf";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <div>
      <NavBar />

      <main className="page">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/shelf" element={<MyShelf />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;