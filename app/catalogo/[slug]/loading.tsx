export default function ProductLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-3">
            <div className="aspect-square bg-[#141414] rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-[#141414] rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="h-3 w-40 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-10 w-3/4 bg-white/10 rounded" />
            <div className="h-24 bg-[#141414] rounded-xl" />
            <div className="h-12 bg-[#141414] rounded-xl" />
            <div className="h-32 bg-[#141414] rounded-xl" />
            <div className="h-14 bg-white/10 rounded-xl" />
            <div className="h-14 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
