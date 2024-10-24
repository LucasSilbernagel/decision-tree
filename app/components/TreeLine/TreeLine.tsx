import React from 'react'
import { NodePosition } from '~/types'

type TreeLineProps = {
  startPos: NodePosition
  endPos: NodePosition
  type: 'yes' | 'no'
}

export const TreeLine: React.FC<TreeLineProps> = ({
  startPos,
  endPos,
  type,
}) => {
  const midX = (startPos.x + endPos.x) / 2
  const midY = (startPos.y + 40 + endPos.y - 40) / 2

  return (
    <g>
      <line
        x1={startPos.x}
        y1={startPos.y + 40}
        x2={endPos.x}
        y2={endPos.y - 40}
        stroke={type === 'yes' ? 'green' : 'red'}
        strokeWidth="3"
        strokeDasharray={type === 'yes' ? '10,5' : '10,5,2,5'}
      />
      <circle
        cx={midX}
        cy={midY}
        r="16"
        fill="white"
        stroke="black"
        strokeWidth="1"
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fill="black"
        fontStyle="bold"
      >
        {type}
      </text>
    </g>
  )
}
