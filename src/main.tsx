import { Provider } from "@/components/ui/provider";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Theme } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <Theme
        minHeight="100vh"
        p="4"
        appearance="dark"
        colorPalette="teal"
        bgImage="repeating-linear-gradient(45deg, #242424, #242424 2px, #1a1a1a 2px, #1a1a1a 4px)"
      >
        <App />
      </Theme>
    </Provider>
  </React.StrictMode>
);
