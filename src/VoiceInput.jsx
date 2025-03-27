import { useState } from "react";
import { useNavigate } from "react-router-dom";

const VoiceInput = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Voice Input</h2>
      <button onClick={startListening} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Start Listening 🎤
      </button>
      <p>{text}</p>
      <button onClick={() => navigate(-1)} style={{ padding: "10px 20px", fontSize: "16px", marginTop: "10px" }}>
        Go Back
      </button>
    </div>
  );
};

export default VoiceInput;
