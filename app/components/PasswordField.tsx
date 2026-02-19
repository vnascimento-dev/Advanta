"use client";

import { useState } from "react";

export default function PasswordField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="input-group">
      <input
        className="form-control"
        name={name}
        type={show ? "text" : "password"}
        defaultValue={defaultValue ?? ""}
      />

      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShow(!show)}
      >
        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
      </button>
    </div>
  );
}
