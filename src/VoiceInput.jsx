import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SPEAKER } from "./aiContext";

const VoiceInput = () => {
  const [text, setText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      await fetchAIResponse(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  const fetchAIResponse = async (input) => {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const api_key = import.meta.env.VITE_API_KEY;

      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `${SPEAKER} ${input}`;
      const result = await model.generateContent(prompt);

      const reply = result.response.text();
      setAiResponse(reply);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  const speakText = (message) => {
    if (message && !isSpeaking) {
      setIsSpeaking(true);
      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = "en-US";
      
      speech.onend = () => setIsSpeaking(false); 
      speech.onerror = () => setIsSpeaking(false); 
      
      window.speechSynthesis.speak(speech);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Voice Input</h2>
      <button onClick={startListening} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Start Listening 🎤
      </button>
      <p><strong>You said:</strong> {text}</p>
      <p><strong>AI Response:</strong> {aiResponse}</p>

      <button
        onClick={() => speakText(aiResponse)}
        style={{ padding: "10px 20px", fontSize: "16px", marginTop: "10px" }}
        disabled={!aiResponse || isSpeaking}
      >
        Speak AI Response 🔊
      </button>

      <button
        onClick={stopSpeaking}
        style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "10px", marginTop: "10px" }}
        disabled={!isSpeaking}
      >
        Stop Speaking ❌
      </button>

      <button
        onClick={() => navigate(-1)}
        style={{ padding: "10px 20px", fontSize: "16px", marginTop: "10px", display: "block" }}
      >
        Go Back
      </button>
    </div>
  );
};

export default VoiceInput;
