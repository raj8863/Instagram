import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; 

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./components/redux/store";
import { Toaster } from "./components/ui/sonner";

let persistorInstance = persistor;
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistorInstance}>
      <App />
      <Toaster/>
    </PersistGate>
  </Provider>
);