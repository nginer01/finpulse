export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav skeleton */}
      <div className="border-b border-card-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-card-border animate-pulse" />
            <div className="w-20 h-5 rounded bg-card-border animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-7 rounded-lg bg-card-border animate-pulse" />
            <div className="w-16 h-7 rounded-lg bg-card-border animate-pulse" />
            <div className="w-16 h-7 rounded-lg bg-card-border animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-card-border animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Title skeleton */}
        <div className="w-32 h-4 rounded bg-card-border animate-pulse mb-2" />
        <div className="w-56 h-8 rounded bg-card-border animate-pulse mb-8" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-4">
              <div className="w-20 h-3 rounded bg-card-border animate-pulse mb-2" />
              <div className="w-28 h-6 rounded bg-card-border animate-pulse mb-1" />
              <div className="w-16 h-3 rounded bg-card-border animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
          <div className="w-36 h-5 rounded bg-card-border animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="w-full h-3 rounded bg-card-border animate-pulse" />
            <div className="w-4/5 h-3 rounded bg-card-border animate-pulse" />
            <div className="w-3/4 h-3 rounded bg-card-border animate-pulse" />
            <div className="w-full h-3 rounded bg-card-border animate-pulse" />
            <div className="w-2/3 h-3 rounded bg-card-border animate-pulse" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="h-36 bg-card-border animate-pulse" />
              <div className="p-4">
                <div className="w-24 h-3 rounded bg-card-border animate-pulse mb-2" />
                <div className="w-full h-4 rounded bg-card-border animate-pulse mb-1" />
                <div className="w-3/4 h-4 rounded bg-card-border animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
