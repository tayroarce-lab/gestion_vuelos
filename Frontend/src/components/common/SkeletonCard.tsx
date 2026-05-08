export default function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '80px', height: '24px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '24px', borderRadius: '999px' }}></div>
      </div>
      <div className="skeleton" style={{ width: '80%', height: '28px' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
        <div className="skeleton" style={{ width: '20%', height: '16px' }}></div>
      </div>
      <div className="divider" style={{ margin: '8px 0' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="skeleton" style={{ width: '120px', height: '36px' }}></div>
        <div className="skeleton" style={{ width: '140px', height: '40px', borderRadius: '8px' }}></div>
      </div>
    </div>
  );
}
