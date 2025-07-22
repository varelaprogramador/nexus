export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse"></div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
