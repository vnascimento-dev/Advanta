"use client";

import Swal from "sweetalert2";

export type AlertType = "success" | "error" | "warning" | "info" | "question";

export function alert(title: string, text?: string, type: AlertType = "info") {
  return Swal.fire({
    icon: type,
    title,
    text,
    confirmButtonText: "OK",
  });
}

export function toast(title: string, type: Exclude<AlertType, "question"> = "success") {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}
