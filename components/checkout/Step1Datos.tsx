"use client";

import { useState } from "react";
import { useCheckout } from "@/lib/checkout-store";

interface FieldDef {
  name: "name" | "phone" | "email" | "city" | "department" | "address" | "neighborhood" | "notes";
  label: string;
  required: boolean;
  type: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email";
}

const FIELDS: FieldDef[] = [
  { name: "name", label: "Nombre completo", required: true, type: "text", autoComplete: "name" },
  { name: "phone", label: "WhatsApp", required: true, type: "tel", autoComplete: "tel", inputMode: "tel" },
  { name: "email", label: "Email (opcional)", required: false, type: "email", autoComplete: "email", inputMode: "email" },
  { name: "city", label: "Ciudad", required: true, type: "text", autoComplete: "address-level2" },
  { name: "department", label: "Departamento", required: true, type: "text", autoComplete: "address-level1" },
  { name: "address", label: "Dirección", required: true, type: "text", autoComplete: "street-address" },
  { name: "neighborhood", label: "Barrio / punto de referencia", required: true, type: "text" },
];

function isValidPhone(phone: string): boolean {
  return /^[0-9+\s()-]{7,25}$/.test(phone.trim());
}

export function Step1Datos({ onNext }: { onNext: () => void }) {
  const { data, setData } = useCheckout();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Partial<Record<FieldDef["name"], string>> = {};
  for (const f of FIELDS) {
    const value = data[f.name].trim();
    if (f.required && !value) errors[f.name] = "Requerido";
    else if (f.name === "phone" && value && !isValidPhone(value)) errors[f.name] = "Número inválido";
    else if (f.name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[f.name] = "Email inválido";
  }
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])));
    if (isValid) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="text-lg font-bold text-white uppercase mb-1" style={{ fontFamily: "var(--font-inter)" }}>
        Tus datos
      </h2>
      <p className="text-[#666666] text-sm mb-4">Para coordinar la entrega y confirmar tu pedido por WhatsApp.</p>

      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1">
            {f.label}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            inputMode={f.inputMode}
            autoComplete={f.autoComplete}
            required={f.required}
            value={data[f.name]}
            onChange={(e) => setData({ [f.name]: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
            aria-invalid={touched[f.name] && !!errors[f.name]}
            aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
            className="w-full bg-[#141414] border border-[#8A6435]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#A47C42]/50"
          />
          {touched[f.name] && errors[f.name] && (
            <p id={`${f.name}-error`} className="text-[#C70101] text-xs mt-1">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}

      <div>
        <label htmlFor="notes" className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notes"
          value={data.notes}
          onChange={(e) => setData({ notes: e.target.value })}
          rows={3}
          className="w-full bg-[#141414] border border-[#8A6435]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#A47C42]/50 resize-none"
          placeholder="Instrucciones especiales, horario de entrega, etc."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#A47C42] hover:bg-[#C4A06A] text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-colors"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Continuar
      </button>
    </form>
  );
}
