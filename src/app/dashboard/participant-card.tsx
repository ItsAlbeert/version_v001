import React from 'react';

interface ParticipantCardProps {
  participant: {
    name: string;
    photo?: string;
  };
  position: number;
  score: number;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, position, score }) => {
  const getPositionClass = (pos: number): string => {
    if (pos === 1) return 'first';
    if (pos === 2) return 'second';
    if (pos === 3) return 'third';
    return '';
  };

  const formatPosition = (pos: number): string => {
    return `${pos}º`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/default-avatar.jpg';
  };

  return (
    <div className="participant-card">
      <div className="card-image">
        <img 
          src={participant.photo || '/default-avatar.jpg'} 
          alt={`Foto de ${participant.name}`}
          onError={handleImageError}
        />
        <div className="image-overlay"></div>
      </div>
      <div className="card-info">
        <div className="name-position">
          <div className={`position ${getPositionClass(position)}`}>
            {formatPosition(position)}
          </div>
          <div className="name" title={participant.name}>
            {participant.name}
          </div>
        </div>
        <div className="score">
          {score.toLocaleString('es-ES', { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
          })} puntos
        </div>
      </div>

      <style jsx>{`
        .participant-card {
          width: 280px;
          height: 380px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
        }

        .participant-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        }

        .card-image {
          width: 100%;
          height: 80%;
          position: relative;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .participant-card:hover .card-image img {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          pointer-events: none;
        }

        .card-info {
          height: 20%;
          padding: 15px 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
        }

        .name-position {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .position {
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          min-width: 35px;
          text-align: center;
          box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
          flex-shrink: 0;
        }

        .position.first {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
          box-shadow: 0 3px 10px rgba(255, 215, 0, 0.4);
        }

        .position.second {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
          color: #333;
          box-shadow: 0 3px 10px rgba(192, 192, 192, 0.4);
        }

        .position.third {
          background: linear-gradient(135deg, #cd7f32, #daa520);
          color: white;
          box-shadow: 0 3px 10px rgba(205, 127, 50, 0.4);
        }

        .name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .score {
          text-align: center;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
