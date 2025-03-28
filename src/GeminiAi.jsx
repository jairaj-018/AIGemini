import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import useSpeechToText from "react-hook-speech-to-text";
import TextToSpeech from "react-text-to-speech";
import { HOTEL_CRM_CONTEXT, ANALYZE_RESPONSE } from "./aiContext";

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
  console.log(interimResult, "interimResult");
  useEffect(() => {
    if (interimResult) {
      setInput(interimResult);
    }
  }, [interimResult]);

  // Handle voice input start/stop
  const handleVoiceInput = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: 0, message: input };
    setMessages([
      ...messages,
      userMessage,
      { id: 1, message: "Generating..." },
    ]);
    setInput("");
    setLoading(true);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `${HOTEL_CRM_CONTEXT} ${input}`;
      const result = await model.generateContent(prompt);

      const reply = result.response.text();
      setMessages((prev) => [...prev.slice(0, -1), { id: 1, message: reply }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: 1, message: "❌ Error: Could not fetch response." },
      ]);
    }
    setLoading(false);
  };

  const handleAnalyzeResponse = async () => {
    // Find the last AI-generated response
    const lastMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.id === 1);

      console.log("lastMessage :",lastMessage);
      
    if (!lastMessage) return;

    // Update UI with a "Generating Analysis..." message
    setMessages([...messages, { id: 1, message: "Generating Analyzed Response..." }]);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create prompt for analysis
      const prompt = `${ANALYZE_RESPONSE} ${lastMessage.message}`;
      console.log("analys promt :", prompt);
      
      const result = await model.generateContent(prompt);

      const detailedReply = result.response.text();

      // Update the last AI message with the new analyzed response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: 1, message: detailedReply },
      ]);
    } catch (error) {
      console.error("Error generating detailed response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: 1, message: "❌ Error: Could not analyze response." },
      ]);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Samyotech AI</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <MarkdownRenderer
            key={index}
            text={msg.message}
            isUser={msg.id === 0}
          />
        ))}
      </div>
      
      <div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            borderTop: "2px solid #ccc",
          }}
        >
          <button style={styles.button} onClick={handleAnalyzeResponse} >Analyze Response</button>
          <button style={styles.button}>Change Language</button>
        </div>

        {/* Input field with voice and send buttons */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or use voice..."
            style={styles.input}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleVoiceInput} style={styles.voiceButton}>
            {isRecording ? "🎙️ Stop" : "🎤 Voice"}
          </button>
          <button onClick={handleSend} style={styles.button} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ text, isUser }) => {
  console.log("text :",text);
  const isGenerating = text === "Generating..." || text === "Generating Analyzed Response...";


  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
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
                <SyntaxHighlighter
                  style={atomOneDark}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code
                  style={{
                    backgroundColor: "#F5F5F5",
                    padding: "2px 4px",
                    borderRadius: "4px",
                  }}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
        {/* <TextToSpeech text={text} /> */}
        {!isGenerating && <TextToSpeech text={text} />}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "800px",
    margin: "20px auto",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    backgroundColor: "#F9F9F9",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  chatBox: {
    flex: 1,
    height: "400px",
    overflowY: "auto",
    padding: "10px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputContainer: {
    display: "flex",
    // borderTop: "1px solid #ccc",
    padding: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    marginLeft: "10px",
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  voiceButton: {
    marginLeft: "10px",
    padding: "8px 15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    padding: "8px 12px",
    maxWidth: "80%",
    fontSize: "14px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
  },
};

export default ChatGPTClone;
