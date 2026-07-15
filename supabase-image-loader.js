export default function supabaseLoader({ src, width = 0 }) {
  // Sirve el objeto público tal cual, sin pasar por /render/image/
  // (Supabase Image Transformations tiene límite de plan; el bucket
  // es público y las imágenes ya vienen optimizadas por el pipeline
  // de importación, así que no hace falta redimensionar en caliente).
  // `width` se recibe pero no se usa a propósito — next/image exige
  // que el loader declare el parámetro (si no, advierte en consola
  // "loader property does not implement width" en cada imagen), pero
  // no se aplica ningún resize para no reintroducir costos de Supabase.
  void width
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    return src
  }
  // REDESIGN_V2 Fase 4: productos de la temporada 26/27 importados con foto
  // enlazada directo al CDN del proveedor (Yupoo) — no se subieron al bucket
  // propio por falta de SUPABASE_SERVICE_ROLE_KEY en este entorno (ver
  // docs/DECISIONS_V2.md). Se sirve tal cual, sin transformarla.
  if (src.includes('photo.yupoo.com/')) {
    return src
  }
  return `https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/${src}`
}
