import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import useSpeechToText from "react-hook-speech-to-text";
import TextToSpeech from "react-text-to-speech";
import {
  HOTEL_CRM_CONTEXT,
  DEEP_SEARCH_RESPONSE,
  WEB_SEARCH,
} from "./aiContext";
import React, { useState } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import LayersIcon from "@mui/icons-material/Layers";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  Button,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
  Psychology as PsychologyIcon,
  Mic as MicIcon,
} from "@mui/icons-material";

import { CircularProgress } from "@mui/material";

const ChatGPTClone = () => {
  const api_key = import.meta.env.VITE_API_KEY;

  const [messages, setMessages] = useState([
    { id: 1, message: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalPrompt, setPrompt] = useState(`${HOTEL_CRM_CONTEXT}`);
  const [selectedBtn, setSelectedBtn] = useState(false);
  const [selectedBtnWebSearch, setSelectedBtnWebSearch] = useState(false);

  const {
    isRecording,
    startSpeechToText,
    stopSpeechToText,
    interimResult,
    // results,
  } = useSpeechToText({ continuous: true });

  useEffect(() => {
    if (interimResult) {
      const newText = interimResult.replace(previousResult, "").trim();
      setInput((prevInput) => prevInput + " " + newText);
      setPreviousResult(interimResult);
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

      const updatedPrompt = `${finalPrompt} ${input}`;
      const result = await model.generateContent(updatedPrompt);

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
    setInput(null);
  };

  const handleDeepSearchResponse = async () => {
    setSelectedBtn((prev) => !prev);
    setPrompt((prevPrompt) => {
      return selectedBtn
        ? prevPrompt.replace(` ${DEEP_SEARCH_RESPONSE}`, "")
        : `${prevPrompt} ${DEEP_SEARCH_RESPONSE}`;
    });
  };

  const handleWebSearchResponse = async () => {
    setSelectedBtnWebSearch((prev) => !prev);
    setPrompt((prevPrompt) => {
      return selectedBtnWebSearch
        ? prevPrompt.replace(` ${WEB_SEARCH}`, "")
        : `${prevPrompt} ${WEB_SEARCH}`;
    });
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" align="center" fontWeight="bold" mb={2}>
        <span style={{ color: "#1565C0" }}>Samyotech</span>
        <span style={{ color: "#fefe19" }}> AI</span>
      </Typography>

      {/* Chat Box */}
      <Paper
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          bgcolor: "grey.100",
          p: 2,
          borderRadius: 2,
          mb: 2,
        }}
      >
        {messages.map((msg, index) => (
          <MarkdownRenderer
            key={index}
            text={msg.message}
            isUser={msg.id === 0}
          />
        ))}
      </Paper>

      {/* Input Box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: 1,
          borderColor: "grey.300",
          borderRadius: 5,
          px: 2,
          py: 1,
          boxShadow: 1,
          bgcolor: "white",
          maxWidth: 760,
          width: "100%",
        }}
      >
        <TextField
          variant="standard"
          placeholder="How can I help?"
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: "16px" },
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <InputAdornment position="end">
          <IconButton
            onClick={handleVoiceInput}
            color={isRecording ? "success" : "warning"}
          >
            <MicIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </InputAdornment>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 1,
          mt: 2,
          maxWidth: 760,
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          color={selectedBtnWebSearch ? "primary" : "inherit"}
          size="small"
          sx={{ borderRadius: 2, fontSize: "12px", textTransform: "none" }}
          startIcon={<LanguageIcon />}
          onClick={handleWebSearchResponse}
        >
          Web Search
        </Button>
        <Button
          variant="contained"
          color={selectedBtn ? "primary" : "inherit"}
          size="small"
          sx={{ borderRadius: 2, fontSize: "12px", textTransform: "none" }}
          startIcon={<LayersIcon />}
          onClick={handleDeepSearchResponse}
        >
          Deep Search
        </Button>
      </Box>
    </Box>
  );
};

const MarkdownRenderer = ({ text, isUser }) => {
  const isGenerating =
    text === "Generating..." || text === "Generating Analyzed Response...";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          ...styles.message,
          backgroundColor: isUser ? "#e5e5e1" : "#e5e5e1",
          alignSelf: isUser ? "flex-end" : "flex-start",
          borderRadius: isUser ? "15px 15px 0 15px" : "15px 15px 15px 0",
        }}
      >
        {isGenerating ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="textSecondary">
              Generating response...
            </Typography>
            <CircularProgress size={20} />
          </Box>
        ) : (
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
        )}

        {!isGenerating && !isUser && (
          <TextToSpeech text={text} stopBtn={false} />
        )}
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
