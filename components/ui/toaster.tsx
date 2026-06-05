"use client";

import { Slide, ToastContainer } from "react-toastify";

export function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4500}
      closeButton
      closeOnClick
      draggable
      draggablePercent={55}
      hideProgressBar={false}
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      stacked
      limit={5}
      theme="light"
      transition={Slide}
      role="alert"
      aria-label="Notifications"
      toastClassName="dr-toast"
      progressClassName="dr-toast-progress"
    />
  );
}
