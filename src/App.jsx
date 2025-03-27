import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GoogleGenAIComponent from "./GeminiAi";
import VoiceInput from "./VoiceInput";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      {/* <GoogleGenAIComponent/> */}
      <Router>
        <Routes>
          <Route path="/" element={<GoogleGenAIComponent />} />
          <Route path="/voice-input" element={<VoiceInput />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
