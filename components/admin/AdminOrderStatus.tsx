"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS, orderStatusLabel } from "@/lib/order-status";

// El admin puede mover el pedido a cualquiera de los estados honestos, pero
// la única forma correcta de llegar a CONFIRMED_MANUALLY es habiendo
// verificado el pago real en la app bancaria — ver ADMIN_GUIDE.md.
const statusOptions = Object.values(ORDER_STATUS).map((value) => ({
  value,
  label: orderStatusLabel(value),
}));

export function AdminOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  // Pedidos creados antes de esta fase pueden traer un estado legacy
  // (pending/confirmed/...) que no está en la lista nueva — se agrega como
  // opción extra para no perderlo silenciosamente en el <select>.
  const options = statusOptions.some((o) => o.value === currentStatus)
    ? statusOptions
    : [{ value: currentStatus, label: orderStatusLabel(currentStatus) }, ...statusOptions];

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/pedidos/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="text-xs bg-[#1A1A1A] border border-[#8A6435]/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-[#A47C42]/50 disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
