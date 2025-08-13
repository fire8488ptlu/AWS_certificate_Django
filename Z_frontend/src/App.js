import logo from "./logo.svg";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Screens/Login";
import Upload from "./Screens/Upload";
import Convert from "./Screens/Convert";
import Show from "./Screens/Show";
import C_Navbar from "./Screens/C_Navbar";

function App() {
  return (
    <>
      <BrowserRouter>
        <C_Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/show" element={<Show />} /> {/* ✅ New route */}
          <Route path="/*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
