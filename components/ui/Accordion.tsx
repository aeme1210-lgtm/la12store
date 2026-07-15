"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Acordeón accesible reutilizable (REDESIGN_SYSTEM.md §4): aria-expanded,
 * aria-controls, y el contenido siempre presente en el HTML (se oculta con
 * `hidden`, no se desmonta condicionalmente) para que crawlers y lectores de
 * pantalla puedan acceder al texto sin depender de la interacción del click.
 */
export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const panelId = `accordion-panel-${id}`;
  const buttonId = `accordion-button-${id}`;

  return (
    <div className="border-b border-[#8A6435]/10 last:border-b-0">
      <button
        id={buttonId}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span
          className="text-white text-sm font-semibold"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {title}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`flex-shrink-0 text-[#666666] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#A47C42]" : ""}`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="pb-4 text-[#A0A0A0] text-sm leading-relaxed"
      >
        {children}
      </div>
    </div>
  );
}

export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#141414] rounded-xl border border-[#8A6435]/10 px-4">{children}</div>;
}
