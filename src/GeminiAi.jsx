import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const ChatGPTClone = () => {
  const api_key = import.meta.env.VITE_API_KEY;

  const [messages, setMessages] = useState([
    { id: 1, message: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      const result = await model.generateContent(input);
      const reply = result.response.text();
      setMessages((prev) => [...prev.slice(0, -1), { id: 1, message: reply }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: 1, message: ":x: Error: Could not fetch response." },
      ]);
    }
    setLoading(false);
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
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
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
    borderTop: "1px solid #ccc",
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
    padding: "8px 15px",
    backgroundColor: "#007BFF",
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
