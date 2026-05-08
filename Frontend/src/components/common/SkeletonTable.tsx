interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export default function SkeletonTable({ rows = 5, columns = 5 }: SkeletonTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={`th-${i}`}>
                <div className="skeleton" style={{ width: '60%', height: '16px' }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={`tr-${rIdx}`}>
              {Array.from({ length: columns }).map((_, cIdx) => (
                <td key={`td-${rIdx}-${cIdx}`}>
                  <div className="skeleton" style={{ width: cIdx === 0 ? '40%' : '80%', height: '20px' }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
