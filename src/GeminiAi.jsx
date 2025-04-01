import { useEffect, useState } from "react";
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
  CircularProgress,
  Chip,
} from "@mui/material";
import { Send as SendIcon, Mic as MicIcon } from "@mui/icons-material";

const ChatGPTClone = () => {
  const api_key = import.meta.env.VITE_API_KEY;
  const [messages, setMessages] = useState([
    { id: 1, message: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalPrompt, setPrompt] = useState(HOTEL_CRM_CONTEXT);
  const [selectedBtn, setSelectedBtn] = useState(false);
  const [selectedBtnWebSearch, setSelectedBtnWebSearch] = useState(false);
  const [accumulatedSpeech, setAccumulatedSpeech] = useState("");
  const [wordsArray, setWordsArray] = useState([]);
  const [previousResult,setPreviousResult] = useState('')

  const {
    isRecording,
    startSpeechToText,
    stopSpeechToText,
    interimResult,
  } = useSpeechToText({ 
    continuous: true,
    useLegacyResults: false
  });

  // Handle speech-to-text accumulation

  useEffect(() => {
    if (interimResult && interimResult !== previousResult) {
      const newText = interimResult.slice(previousResult.length).trim();
      setInput((prevInput) =>
        newText ? prevInput + " " + newText : prevInput
      );
      setPreviousResult(interimResult);
    }
  }, [interimResult]);
  // useEffect(() => {
  //   if (interimResult && isRecording) {
  //     // Get only the new portion of speech
  //     const newText = interimResult.slice(accumulatedSpeech.length);
      
  //     if (newText) {
  //       // Update accumulated speech
  //       setAccumulatedSpeech(interimResult);
        
  //       // Update input field by appending new text
  //       setInput(prev => prev + newText);
        
  //       // Update words array
  //       const newWords = newText.trim().split(/\s+/).filter(w => w);
  //       setWordsArray(prev => [...prev, ...newWords]);
  //     }
  //   }
  // }, [interimResult]);

  const handleVoiceInput = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      // Start fresh recording
      setAccumulatedSpeech("");
      setWordsArray([]);
      startSpeechToText();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Clear speech accumulation if manually typing while not recording
    if (!isRecording) {
      setAccumulatedSpeech("");
      setWordsArray([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: 0, message: input };
    setMessages(prev => [...prev, userMessage, { id: 1, message: "Generating..." }]);
    setInput("");
    setAccumulatedSpeech("");
    setWordsArray([]);
    setLoading(true);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const updatedPrompt = `${finalPrompt} ${input}`;
      const result = await model.generateContent(updatedPrompt);
      const reply = result.response.text();

      setMessages(prev => [...prev.slice(0, -1), { id: 1, message: reply }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { id: 1, message: "❌ Error: Could not fetch response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeepSearchResponse = () => {
    const newSelected = !selectedBtn;
    setSelectedBtn(newSelected);
    setPrompt(prev => newSelected ? `${prev} ${DEEP_SEARCH_RESPONSE}` : prev.replace(` ${DEEP_SEARCH_RESPONSE}`, ""));
  };

  const handleWebSearchResponse = () => {
    const newSelected = !selectedBtnWebSearch;
    setSelectedBtnWebSearch(newSelected);
    setPrompt(prev => newSelected ? `${prev} ${WEB_SEARCH}` : prev.replace(` ${WEB_SEARCH}`, ""));
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          border: 1,
          borderColor: "grey.300",
          borderRadius: 5,
          p: 2,
          boxShadow: 1,
          bgcolor: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <TextField
            variant="standard"
            placeholder="How can I help?"
            fullWidth
            multiline
            maxRows={4}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: "16px" },
            }}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <InputAdornment position="end">
            <IconButton
              onClick={handleVoiceInput}
              color={isRecording ? "error" : "default"}
            >
              <MicIcon />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <SendIcon />
            </IconButton>
          </InputAdornment>
        </Box>

        {wordsArray.length > 0 && (
          <Box sx={{ 
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            pt: 1,
            borderTop: 1,
            borderColor: "divider"
          }}>
            {wordsArray.map((word, index) => (
              <Chip
                key={index}
                label={word}
                size="small"
                color={isRecording ? "primary" : "default"}
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 1,
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          color={selectedBtnWebSearch ? "primary" : "inherit"}
          size="small"
          sx={{ borderRadius: 2, textTransform: "none" }}
          startIcon={<LanguageIcon />}
          onClick={handleWebSearchResponse}
        >
          Web Search
        </Button>
        <Button
          variant="contained"
          color={selectedBtn ? "primary" : "inherit"}
          size="small"
          sx={{ borderRadius: 2, textTransform: "none" }}
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
  const isGenerating = text.startsWith("Generating");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: "80%",
          bgcolor: isUser ? "primary.light" : "background.default",
          borderRadius: isUser 
            ? "18px 18px 0 18px" 
            : "18px 18px 18px 0",
        }}
      >
        {isGenerating ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">{text}</Typography>
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
                  <code className={className}>
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
      </Paper>
    </Box>
  );
};

export default ChatGPTClone;