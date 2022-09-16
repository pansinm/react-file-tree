import React, { useEffect, useRef, useState } from "react";

export default function RenameInput({
  value,
  onEnter,
  onBlur,
}: {
  value: string;
  onEnter: (val: string) => void;
  onBlur: () => void;
}) {
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setVal(value);
    inputRef.current?.focus();
    const keyup = (e: any) => {
      if (e.key === "Escape") {
        inputRef?.current?.blur();
      }
    };
    document.body.addEventListener("keyup", keyup);
    return () => document.body.removeEventListener("keyup", keyup);
  }, [value]);
  return (
    <input
      className="file-tree__input"
      style={{ width: '100%', flex: 1 }}
      ref={inputRef}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={onBlur}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          onEnter(val);
          return;
        }
      }}
    ></input>
  );
}
