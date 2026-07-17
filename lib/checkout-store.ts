"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus } from "@/lib/order-status";

export interface CheckoutData {
  name: string;
  phone: string;
  email: string;
  city: string;
  department: string;
  address: string;
  neighborhood: string;
  notes: string;
}

const EMPTY_DATA: CheckoutData = {
  name: "",
  phone: "",
  email: "",
  city: "",
  department: "",
  address: "",
  neighborhood: "",
  notes: "",
};

interface CheckoutStore {
  step: 1 | 2 | 3 | 4 | 5;
  data: CheckoutData;
  paymentMethodId: string;
  orderId: string | null;
  orderCode: string | null;
  status: OrderStatus | null;
  /** Checkbox de políticas del paso 3 — se guarda aquí (no como estado local
   * de Step3Revision) porque el paso 5 también lo necesita, para dejar
   * constancia de "Condiciones aceptadas" en el mensaje de WhatsApp. */
  policyAccepted: boolean;
  /**
   * El archivo de comprobante NUNCA se persiste (ni en este store ni en
   * ningún backend) — vive solo en memoria de React mientras dura la sesión
   * de la pestaña. Si el usuario vuelve más tarde, debe volver a
   * seleccionarlo (brief Fase 5).
   */
  setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  setData: (data: Partial<CheckoutData>) => void;
  setPaymentMethodId: (id: string) => void;
  setOrder: (orderId: string, orderCode: string, status: OrderStatus) => void;
  setStatus: (status: OrderStatus) => void;
  setPolicyAccepted: (accepted: boolean) => void;
  reset: () => void;
}

export const useCheckout = create<CheckoutStore>()(
  persist(
    (set) => ({
      step: 1,
      data: EMPTY_DATA,
      paymentMethodId: "nequi",
      orderId: null,
      orderCode: null,
      status: null,
      policyAccepted: false,
      setStep: (step) => set({ step }),
      setData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
      setPaymentMethodId: (id) => set({ paymentMethodId: id }),
      setOrder: (orderId, orderCode, status) => set({ orderId, orderCode, status }),
      setStatus: (status) => set({ status }),
      setPolicyAccepted: (accepted) => set({ policyAccepted: accepted }),
      reset: () =>
        set({
          step: 1,
          data: EMPTY_DATA,
          paymentMethodId: "nequi",
          orderId: null,
          orderCode: null,
          status: null,
          policyAccepted: false,
        }),
    }),
    { name: "la12-checkout" }
  )
);
