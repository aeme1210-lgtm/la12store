"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useCheckout } from "@/lib/checkout-store";
import { useHydrated } from "@/lib/use-hydrated";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { StepTransition } from "@/components/checkout/StepTransition";
import { Step1Datos } from "@/components/checkout/Step1Datos";
import { Step2Entrega } from "@/components/checkout/Step2Entrega";
import { Step3Revision } from "@/components/checkout/Step3Revision";
import { Step4Pago } from "@/components/checkout/Step4Pago";
import { Step5Comprobante } from "@/components/checkout/Step5Comprobante";

export default function CheckoutPage() {
  const { items } = useCart();
  const { step, setStep } = useCheckout();
  const hydrated = useHydrated();

  // Carrito y paso de checkout viven en localStorage — el servidor siempre
  // los ve vacíos/en paso 1. Sin esta guarda el árbol cambia entero después
  // de hidratar (mismatch real, no cosmético: reinicia el formulario).
  if (!hydrated) {
    return <div className="min-h-screen pt-28 md:pt-36 pb-16" />;
  }

  // El carrito solo puede estar vacío antes de terminar (pasos 1-4). El paso
  // 5 lo vacía intencionalmente al compartir el comprobante — no se debe
  // expulsar al cliente de su propia pantalla de confirmación.
  if (items.length === 0 && step !== 5) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1
            className="text-2xl font-black text-white uppercase mb-4"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Tu carrito está vacío
          </h1>
          <Link href="/catalogo" className="text-[#A47C42] hover:underline">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-36 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <h1
          className="text-3xl font-black text-white uppercase mb-8 text-center"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Finalizar Compra
        </h1>

        <CheckoutProgress step={step} />

        <StepTransition stepKey={step}>
          {step === 1 && <Step1Datos onNext={() => setStep(2)} />}
          {step === 2 && <Step2Entrega onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <Step3Revision
              onNext={() => setStep(4)}
              onEditData={() => setStep(1)}
              onEditItems={() => setStep(2)}
            />
          )}
          {step === 4 && <Step4Pago onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <Step5Comprobante />}
        </StepTransition>
      </div>
    </div>
  );
}
