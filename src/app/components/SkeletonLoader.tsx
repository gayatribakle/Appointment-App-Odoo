export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="border-b border-gray-100">
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <td key={col} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-3">
        <div className="flex items-end gap-2 h-48">
          {[60, 80, 70, 90, 75, 85].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-200 rounded-t"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
