"use client"
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div
      style={{
        border: "0.5px solid #e0e0e0",
        borderRadius: 12,
        marginBottom: 10,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500 }}>{question}</span>
        <span style={{ fontSize: 18, color: "#555", lineHeight: 1 }}>
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600"/> : <ChevronDown className="w-5 h-5 text-gray-600"/>}
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? 300 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <p style={{ margin: 0, padding: "0 20px 18px", fontSize: 14, color: "#555", lineHeight: 1.65 }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function AccordionComponent({ data }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {data.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}