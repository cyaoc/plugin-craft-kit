import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Hello from Kintone!");

const renderApp = (
  event,
  getSpaceElement,
) => {
  const DOMID = "k_test_plugin_container";
  const space = getSpaceElement();
  if (!document.getElementById(DOMID)) {
    const domNode = document.createElement("div");
    domNode.setAttribute("id", DOMID);
    const root = createRoot(domNode);
    root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
    );
    space.appendChild(domNode);
  }
  return event;
};

kintone.events.on("app.record.index.show", (event) => {
  return renderApp(
    event,
    kintone.app.getHeaderSpaceElement
  );
});