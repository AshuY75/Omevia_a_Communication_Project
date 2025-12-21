import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="573863349752-7831g52qbe7qqq3u9fb9dod67at5vnq4.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
