import React from 'react';
import { Armchair } from 'lucide-react';

interface Seat {
  id: number;
  row: number;
  column: string;
  type: string;
  isTaken: boolean;
}

interface SeatMapProps {
  seats: Seat[];
  rows: number;
  colsPerRow: number;
  selectedSeatIds: number[];
  onToggleSeat: (seatId: number) => void;
  maxSelection?: number;
}

export default function SeatMap({ 
  seats, 
  rows, 
  colsPerRow, 
  selectedSeatIds, 
  onToggleSeat,
  maxSelection = 9
}: SeatMapProps) {
  
  // Organizar asientos por fila
  if (!seats || seats.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No hay información de asientos disponible para este avión.
      </div>
    );
  }

  const seatsByRow: Record<number, Seat[]> = {};
  seats.forEach(seat => {
    const r = Number(seat.row);
    if (!seatsByRow[r]) seatsByRow[r] = [];
    seatsByRow[r].push(seat);
  });

  // Ordenar columnas dentro de cada fila
  Object.values(seatsByRow).forEach(rowSeats => {
    rowSeats.sort((a, b) => a.column.localeCompare(b.column));
  });

  const isSelected = (id: number) => selectedSeatIds.includes(id);

  return (
    <div className="seat-map-container" style={{
      background: 'var(--color-bg)',
      padding: '40px 20px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowX: 'auto',
      width: '100%'
    }}>
      <div className="plane-nose" style={{
        width: '240px',
        height: '80px',
        background: 'var(--color-primary-light)',
        border: '2px solid var(--color-border)',
        borderRadius: '120px 120px 20px 20px',
        marginBottom: '48px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: 'var(--color-primary)',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>Cabina de Mando</div>
      </div>

      <div className="seat-grid" style={{
        display: 'grid',
        gap: '16px',
        padding: '24px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)'
      }}>
        {Array.from({ length: rows }, (_, i) => i + 1).map(rowNum => (
          <div key={rowNum} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '28px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-disabled)', textAlign: 'center' }}>
              {rowNum}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {seatsByRow[rowNum]?.map((seat, index) => {
                const showAisle = index === Math.floor(colsPerRow / 2);
                
                return (
                  <React.Fragment key={seat.id}>
                    {showAisle && <div style={{ width: '32px' }} />}
                    <button
                      type="button"
                      onClick={() => !seat.isTaken && onToggleSeat(seat.id)}
                      disabled={seat.isTaken || (!isSelected(seat.id) && selectedSeatIds.length >= maxSelection)}
                      title={`Asiento ${seat.row}${seat.column} (${seat.type})`}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        border: '2px solid transparent',
                        cursor: seat.isTaken ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: seat.isTaken 
                          ? '#E2E8F0' 
                          : isSelected(seat.id) 
                            ? 'var(--color-primary)' 
                            : 'var(--color-primary-light)',
                        borderColor: isSelected(seat.id) ? 'var(--color-primary)' : 'transparent',
                        color: isSelected(seat.id) ? 'white' : 'var(--color-primary)',
                        transform: isSelected(seat.id) ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: isSelected(seat.id) ? 'var(--shadow-md)' : 'none',
                      }}
                    >
                      <Armchair size={22} style={{ opacity: seat.isTaken ? 0.4 : 1 }} />
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="seat-legend" style={{
        marginTop: '48px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '32px',
        padding: '16px 32px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border)',
        fontSize: '14px',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }} />
          <span>Disponible</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Tu selección</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#E2E8F0' }} />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
