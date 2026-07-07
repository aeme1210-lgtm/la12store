export default function supabaseLoader({ src }) {
  // Sirve el objeto público tal cual, sin pasar por /render/image/
  // (Supabase Image Transformations tiene límite de plan; el bucket
  // es público y las imágenes ya vienen optimizadas por el pipeline
  // de importación, así que no hace falta redimensionar en caliente).
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    return src
  }
  return `https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/${src}`
}
