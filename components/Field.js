import { cloneElement } from "react";

/** Label + control + hint/error, wired together for screen readers. Pass a single input/select/textarea as child. */
export default function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined,
      })}
      {error ? <span id={`${id}-err`} className="err" role="alert">{error}</span> : hint ? <span id={`${id}-hint`} className="hint">{hint}</span> : null}
    </div>
  );
}
