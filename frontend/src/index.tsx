import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center', width:'100vw',height:'100vh', margin:'auto'}}>
        <App />
      </div>
    </BrowserRouter>
  </Provider>
);
