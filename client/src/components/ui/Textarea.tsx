import type { TextareaHTMLAttributes } from "react";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: "120px",
        resize: "vertical",
        padding: "0.6rem 0.75rem",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        outline: "none",
        ...props.style,
      }}
    />
  );
}
