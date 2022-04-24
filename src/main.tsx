import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./main.css";
import App from "./App";
import {
  ReactVanilla,
  ReduxTraditional,
  ReduxToolkit,
  ReactQueryBasic,
  ReactQueryAdvanced,
} from "./routes";

(async () => {
  if (import.meta.env.DEV) {
    const { server } = await import("./mocks/server");
    server.start();
  }
})().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/react-vanilla" replace />} />
            <Route path="react-vanilla" element={<ReactVanilla />} />
            <Route path="redux-traditional" element={<ReduxTraditional />} />
            <Route path="redux-toolkit" element={<ReduxToolkit />} />
            <Route path="react-query-basic" element={<ReactQueryBasic />} />
            <Route
              path="react-query-advanced"
              element={<ReactQueryAdvanced />}
            />
            <Route
              path="*"
              element={<Navigate to="/react-vanilla" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
