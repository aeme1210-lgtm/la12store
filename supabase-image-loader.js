export default function supabaseLoader({ src, width, quality }) {
  // Si la imagen ya es una URL completa de Supabase, extraer el path
  let imagePath = src
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    imagePath = src.split('/storage/v1/object/public/')[1]
  }
  return `https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/render/image/public/${imagePath}?width=${width}&quality=${quality || 75}`
}
