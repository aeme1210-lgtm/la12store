const STEPS = [
  { n: 1, label: "Datos" },
  { n: 2, label: "Entrega" },
  { n: 3, label: "Revisión" },
  { n: 4, label: "Pago" },
  { n: 5, label: "Comprobante" },
] as const;

export function CheckoutProgress({ step }: { step: number }) {
  return (
    <ol className="flex items-center justify-between mb-10" aria-label="Progreso de la compra">
      {STEPS.map((s, i) => {
        const state = s.n < step ? "done" : s.n === step ? "current" : "upcoming";
        return (
          <li key={s.n} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                aria-current={state === "current" ? "step" : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                  state === "done"
                    ? "bg-[#A47C42] text-black"
                    : state === "current"
                      ? "bg-[#A47C42]/20 border-2 border-[#A47C42] text-[#A47C42]"
                      : "bg-[#1A1A1A] border border-[#8A6435]/20 text-[#666666]"
                }`}
              >
                {s.n}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider mt-1.5 hidden sm:block ${
                  state === "upcoming" ? "text-[#666666]" : "text-white"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 transition-colors duration-200 ${
                  s.n < step ? "bg-[#A47C42]" : "bg-[#8A6435]/20"
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
