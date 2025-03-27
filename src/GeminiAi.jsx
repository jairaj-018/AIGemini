import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import useSpeechToText from "react-hook-speech-to-text";
import TextToSpeech from "react-text-to-speech";
import { SPEAKER_CONTEXT } from "./aiContext";

const ChatGPTClone = () => {
  const api_key = import.meta.env.VITE_API_KEY;

  const [messages, setMessages] = useState([
    { id: 1, message: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    isRecording,
    startSpeechToText,
    stopSpeechToText,
    interimResult,
  } = useSpeechToText({ continuous: false });

  // Auto-start voice recognition on load
  useEffect(() => {
    startSpeechToText();
  }, []);

  // Update input when speech recognition captures text
  useEffect(() => {
    if (interimResult) {
      setInput(interimResult);
      stopSpeechToText(); // Stop recognition after capturing input
      handleSend(interimResult);
    }
  }, [interimResult]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { id: 0, message: text };
    setMessages([...messages, userMessage, { id: 1, message: "Generating..." }]);
    setInput("");
    setLoading(true);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `${SPEAKER_CONTEXT} ${text}`;
      const result = await model.generateContent(prompt);
      const reply = result.response.text();

      setMessages((prev) => [...prev.slice(0, -1), { id: 1, message: reply }]);

      setTimeout(() => {
        const speech = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.speak(speech);
      }, 1000);

      // Restart voice recognition after AI responds
      setTimeout(() => startSpeechToText(), 3000);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: 1, message: "❌ Error: Could not fetch response." },
      ]);
      startSpeechToText();
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Samyotech AI</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <MarkdownRenderer key={index} text={msg.message} isUser={msg.id === 0} />
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak or type your message..."
          style={styles.input}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={styles.button} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ text, isUser }) => {
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          ...styles.message,
          backgroundColor: isUser ? "#DCF8C6" : "#ECECEC",
          alignSelf: isUser ? "flex-end" : "flex-start",
          borderRadius: isUser ? "15px 15px 0 15px" : "15px 15px 15px 0",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter style={atomOneDark} language={match[1]} PreTag="div">
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code style={{ backgroundColor: "#F5F5F5", padding: "2px 4px", borderRadius: "4px" }}>
                  {children}
                </code>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
        <TextToSpeech text={text} />
      </div>
    </div>
  );
};

const styles = {
  container: { width: "800px", margin: "20px auto", padding: "10px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "#F9F9F9", display: "flex", flexDirection: "column" },
  title: { textAlign: "center", fontSize: "22px", fontWeight: "bold", marginBottom: "15px", color: "#333" },
  chatBox: { flex: 1, height: "400px", overflowY: "auto", padding: "10px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff" },
  inputContainer: { display: "flex", borderTop: "1px solid #ccc", padding: "10px", gap: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "10px 15px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "14px" },
  message: { padding: "10px 12px", maxWidth: "75%", fontSize: "14px", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", wordBreak: "break-word" },
};

export default ChatGPTClone;
