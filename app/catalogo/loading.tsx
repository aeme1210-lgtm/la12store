export default function CatalogoLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-6 md:py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-3 w-32 bg-white/10 rounded mb-3" />
          <div className="h-9 w-64 bg-white/10 rounded" />
        </div>

        <div className="mb-4">
          <div className="h-12 max-w-xl bg-white/5 rounded-xl" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="h-96 bg-white/5 rounded-xl" />
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-xl overflow-hidden">
                  <div className="aspect-[3/4] bg-white/5" />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 w-16 bg-white/10 rounded" />
                    <div className="h-3.5 w-full bg-white/10 rounded" />
                    <div className="h-3.5 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-20 bg-white/10 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
