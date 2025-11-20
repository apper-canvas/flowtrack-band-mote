import "@/index.css"
import "react-toastify/dist/ReactToastify.css"
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store";
import App from "@/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
)
import "@/index.css"
import "react-toastify/dist/ReactToastify.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
)