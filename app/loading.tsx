export default function Loading() {
  return (
    <div className="p-4 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-3 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>

      {/* Title skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-5 w-48 bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-28 bg-gray-200 rounded" />
      </div>

      {/* KPI плитки */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded p-3">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-10 bg-gray-300 rounded" />
          </div>
        ))}
      </div>

      {/* Финансовые карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded p-3">
            <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-40 bg-gray-300 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Таблица */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${60 + i * 20}px` }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 border-b border-gray-100 flex items-center px-3 gap-4">
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
