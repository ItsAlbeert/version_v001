import type React from "react"

interface Participant {
  name: string
  score: number
}

interface ParticipantPyramidProps {
  participants: Participant[]
}

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return "bg-yellow-500"
    case 2:
      return "bg-gray-500"
    case 3:
      return "bg-orange-500"
    default:
      return "bg-slate-700"
  }
}

const ParticipantPyramid: React.FC<ParticipantPyramidProps> = ({ participants }) => {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Participant Pyramid</h2>
      <div className="flex flex-col items-center space-y-2">
        {sortedParticipants.length > 0 && <Card participant={sortedParticipants[0]} rank={1} />}
        <div className="flex space-x-2">
          {sortedParticipants.length > 1 && <Card participant={sortedParticipants[1]} rank={2} />}
          {sortedParticipants.length > 2 && <Card participant={sortedParticipants[2]} rank={3} />}
        </div>
        <div className="flex space-x-2">
          {sortedParticipants.slice(3, 12).map((participant, index) => (
            <Card key={index} participant={participant} rank={index + 4} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CardProps {
  participant: Participant
  rank: number
}

const Card: React.FC<CardProps> = ({ participant, rank }) => {
  let cardClasses = "p-2 rounded-md text-white shadow-md min-w-[100px] text-center"

  if (rank === 1) {
    cardClasses = `p-2 rounded-md text-black shadow-md min-w-[100px] text-center bg-gradient-to-br from-white to-slate-50 border`
  } else if (rank === 2 || rank === 3) {
    cardClasses = `p-2 rounded-md text-black shadow-md min-w-[100px] text-center bg-gradient-to-br from-white to-slate-50 border`
  } else if (rank >= 4 && rank <= 12) {
    cardClasses = `p-2 rounded-md text-black shadow-md min-w-[100px] text-center bg-gradient-to-br from-white to-slate-50 border`
  }

  return (
    <div className={cardClasses}>
      <div className="font-bold">{participant.name}</div>
      <div>Score: {participant.score}</div>
      <div>Rank: {rank}</div>
    </div>
  )
}

export default ParticipantPyramid
