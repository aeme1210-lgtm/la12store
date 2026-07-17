/**
 * Fuente de verdad única de los métodos de pago del negocio.
 *
 * Los datos completos (número/llave/titular) se muestran EXCLUSIVAMENTE dentro
 * del checkout (paso 4). En cualquier otro lugar del sitio (footer, contacto,
 * FAQ, carrito) solo se puede listar el NOMBRE del método — nunca el número,
 * la llave ni el titular. Esa restricción es una regla de negocio explícita,
 * no una preferencia de diseño.
 *
 * "Nubank — @AME429" (mal etiquetado) aparecía repetido en el código real
 * encontrado en la auditoría — la llave @AME429 es en realidad una llave
 * Bre-B (el nuevo sistema interoperable de transferencias en Colombia), no
 * un dato de Nubank. Corregido aquí como fuente única.
 */

export interface PaymentMethod {
  id: string;
  name: string;
  type: "nequi" | "daviplata" | "bancolombia" | "bancolombia2" | "breb";
  titular: string;
  /** Número o llave a mostrar/copiar. */
  number: string;
  /** Color de marca — usar solo dentro del selector de pago, en ningún otro lugar del sitio. */
  color: string;
  instructions: string;
  active: boolean;
  /**
   * Deep link oficial documentado para "abrir la app". NO inventar esquemas
   * (`nequi://` etc.) — si no hay uno oficial confirmado, se deja `null` y el
   * botón cae a la tienda de apps o simplemente no se muestra.
   */
  officialDeepLink: string | null;
  /** URL de la imagen QR oficial (subida por el dueño). Slot vacío hasta entonces. */
  qrImageUrl: string | null;
  ariaLabel: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "nequi",
    name: "Nequi",
    type: "nequi",
    titular: "La 12 Store",
    number: "300 844 3885",
    color: "#DA1E5B",
    instructions: "Transfiere el total exacto desde tu app Nequi a este número.",
    active: true,
    // TODO_OWNER: confirmar si existe un deep link oficial de Nequi para
    // "abrir app con monto prellenado" antes de prometerlo en la UI.
    officialDeepLink: null,
    qrImageUrl: null,
    ariaLabel: "Pagar con Nequi",
  },
  {
    id: "daviplata",
    name: "DaviPlata",
    type: "daviplata",
    titular: "La 12 Store",
    number: "300 844 3885",
    color: "#EE3831",
    instructions: "Transfiere el total exacto desde tu app DaviPlata a este número.",
    active: true,
    officialDeepLink: null,
    qrImageUrl: null,
    ariaLabel: "Pagar con DaviPlata",
  },
  {
    id: "bancolombia",
    name: "Bancolombia",
    type: "bancolombia",
    titular: "Silvana Ossa",
    number: "91622993231",
    color: "#FFDD00",
    instructions: "Cuenta de ahorros Bancolombia. Transfiere el total exacto e incluye el código de tu pedido en la descripción.",
    active: true,
    officialDeepLink: null,
    qrImageUrl: null,
    ariaLabel: "Pagar por transferencia Bancolombia (Silvana Ossa)",
  },
  {
    id: "bancolombia2",
    name: "Bancolombia",
    type: "bancolombia2",
    titular: "Andrés Méndez",
    number: "91202310007",
    color: "#FFDD00",
    instructions: "Cuenta de ahorros Bancolombia. Transfiere el total exacto e incluye el código de tu pedido en la descripción.",
    active: true,
    officialDeepLink: null,
    qrImageUrl: null,
    ariaLabel: "Pagar por transferencia Bancolombia (Andrés Méndez)",
  },
  {
    id: "breb",
    name: "Bre-B",
    type: "breb",
    titular: "La 12 Store",
    number: "@AME429",
    color: "#A47C42",
    instructions: "Usa esta llave Bre-B desde cualquier app bancaria compatible.",
    active: true,
    officialDeepLink: null,
    qrImageUrl: null,
    ariaLabel: "Pagar con llave Bre-B",
  },
];

export function getActivePaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS.filter((m) => m.active);
}

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

/**
 * Nombres únicamente — seguro para usar fuera del checkout (footer, FAQ, contacto).
 * Deduplicado: hay 2 cuentas Bancolombia (titulares distintos) que comparten nombre,
 * pero fuera del checkout solo interesa que el método "Bancolombia" está disponible.
 */
export function paymentMethodNames(): string[] {
  return Array.from(new Set(getActivePaymentMethods().map((m) => m.name)));
}
