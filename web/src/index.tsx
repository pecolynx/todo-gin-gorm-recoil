import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { RecoilRoot } from "recoil";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <React.Suspense fallback="読み込み中">
        <App />
      </React.Suspense>
    </RecoilRoot>
  </React.StrictMode>,
);
