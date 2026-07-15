"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Upload, X, MessageCircle, Copy, Check, FileText } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useCheckout } from "@/lib/checkout-store";
import { formatCOP } from "@/lib/utils";
import { whatsAppLink } from "@/lib/whatsapp";
import { getPaymentMethod } from "@/lib/payment-methods";
import { ORDER_STATUS } from "@/lib/order-status";
import { reportClientStatus } from "@/lib/checkout-api";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Step5Comprobante() {
  const { items, totalPrice, clearCart } = useCart();
  const { data, paymentMethodId, orderId, orderCode, status, setStatus, reset } = useCheckout();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = totalPrice();
  const method = getPaymentMethod(paymentMethodId);
  const needsReselect =
    !file &&
    (status === ORDER_STATUS.RECEIPT_SELECTED || status === ORDER_STATUS.RECEIPT_SHARE_STARTED);

  const summaryText = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const lines = [
      `Hola! Este es el comprobante de mi pedido ${orderCode} en La 12 Store.`,
      "",
      `Cliente: ${data.name}`,
      `WhatsApp: ${data.phone}`,
      `Ciudad: ${data.city}, ${data.department}`,
      `Método de pago: ${method?.name ?? ""}`,
      `Total: ${formatCOP(total)}`,
      "",
      "Productos:",
      ...items.map((i) => `- ${i.name} (${i.size}, ${i.version}) x${i.quantity} — ${origin}/catalogo/${i.slug}`),
    ];
    return lines.join("\n");
  };

  const handleFileChange = (f: File | null) => {
    setFileError(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError("Formato no válido. Usa JPG, PNG, WEBP o PDF.");
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setFileError("El archivo pesa más de 8 MB. Usa una imagen o PDF más liviano.");
      return;
    }
    setFile(f);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    if (orderId) {
      setStatus(ORDER_STATUS.RECEIPT_SELECTED);
      reportClientStatus(orderId, ORDER_STATUS.RECEIPT_SELECTED, { receiptFileName: f.name });
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const finishAsPending = async (method_: "web_share" | "whatsapp_fallback") => {
    if (orderId) {
      await reportClientStatus(orderId, ORDER_STATUS.PENDING_VERIFICATION, {
        receiptFileName: file?.name,
        receiptShareMethod: method_,
      });
      setStatus(ORDER_STATUS.PENDING_VERIFICATION);
    }
    clearCart();
    setFinished(true);
  };

  const handleShare = async () => {
    if (!file) return;
    const text = summaryText();
    const canWebShareFiles =
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      "canShare" in navigator &&
      (navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean }).canShare?.({ files: [file] });

    if (canWebShareFiles) {
      if (orderId) {
        setStatus(ORDER_STATUS.RECEIPT_SHARE_STARTED);
        reportClientStatus(orderId, ORDER_STATUS.RECEIPT_SHARE_STARTED);
      }
      try {
        await navigator.share({
          files: [file],
          title: `Pedido ${orderCode}`,
          text,
        });
        await finishAsPending("web_share");
      } catch {
        // Usuario canceló el share nativo — no se marca como pendiente todavía.
      }
      return;
    }

    // Fallback: sin soporte para compartir archivos — copiar resumen y abrir WhatsApp con texto.
    setUsedFallback(true);
    await navigator.clipboard.writeText(text).catch(() => {});
    window.open(whatsAppLink(text), "_blank");
    await finishAsPending("whatsapp_fallback");
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (finished) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={56} className="text-[#22C55E] mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white uppercase mb-2" style={{ fontFamily: "var(--font-archivo)" }}>
          Pendiente de verificación
        </h2>
        <p className="text-[#A0A0A0] text-sm max-w-sm mx-auto mb-1">
          Tu comprobante fue preparado para compartir. Tu pedido{" "}
          <span className="text-[#A47C42] font-semibold">{orderCode}</span> queda pendiente de
          verificación.
        </p>
        {usedFallback && (
          <p className="text-[#666666] text-xs max-w-sm mx-auto mt-3 bg-[#1A1A0A] border border-[#A47C42]/20 rounded-lg p-3">
            Adjunta el comprobante desde tu galería en la conversación de WhatsApp que se abrió, antes
            de enviarlo — tu navegador no permite adjuntarlo automáticamente.
          </p>
        )}
        <p className="text-[#666666] text-xs mt-4">
          Confirmaremos tu pedido por WhatsApp en cuanto verifiquemos el pago.
        </p>
        <Link href="/" onClick={() => reset()} className="inline-block mt-6 text-[#A47C42] text-sm hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white uppercase mb-1" style={{ fontFamily: "var(--font-inter)" }}>
          Comprobante de pago
        </h2>
        <p className="text-[#666666] text-sm">
          Adjunta la captura o PDF de tu transferencia y compártelo por WhatsApp.
        </p>
      </div>

      {needsReselect && (
        <p className="text-[#A47C42] text-xs bg-[#A47C42]/10 border border-[#A47C42]/20 rounded-lg p-3">
          Habías seleccionado un comprobante antes, pero por seguridad no lo guardamos entre
          sesiones — debes volver a elegirlo.
        </p>
      )}

      {!file ? (
        <label
          htmlFor="receipt-input"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#8A6435]/30 rounded-xl py-10 cursor-pointer hover:border-[#A47C42]/50 transition-colors"
        >
          <Upload size={28} className="text-[#A47C42]" />
          <span className="text-white text-sm font-semibold">Seleccionar comprobante</span>
          <span className="text-[#666666] text-xs">JPG, PNG, WEBP o PDF · máx. 8 MB</span>
          <input
            id="receipt-input"
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
      ) : (
        <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4 flex items-center gap-3">
          {previewUrl ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black">
              <Image src={previewUrl} alt="Vista previa del comprobante" fill sizes="64px" className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-[#A47C42]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{file.name}</p>
            <p className="text-[#666666] text-xs">{formatSize(file.size)}</p>
          </div>
          <button
            onClick={removeFile}
            aria-label="Quitar comprobante"
            className="text-[#666666] hover:text-[#C70101] transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {fileError && (
        <p role="alert" className="text-[#C70101] text-xs">
          {fileError}
        </p>
      )}

      <button
        onClick={copySummary}
        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#8A6435]/20 text-[#A0A0A0] hover:text-white text-xs py-3 rounded-lg transition-colors"
      >
        {copied ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
        Copiar resumen del pedido
      </button>

      <button
        onClick={handleShare}
        disabled={!file}
        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-40 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-colors"
      >
        <MessageCircle size={18} />
        Compartir comprobante por WhatsApp
      </button>

      <p className="text-[#666666] text-[11px] text-center">
        Nunca guardamos tu comprobante en nuestros servidores — se comparte directo desde tu
        dispositivo. Tu pedido queda &quot;pendiente de verificación&quot; hasta que confirmemos el
        pago manualmente.
      </p>
    </div>
  );
}
