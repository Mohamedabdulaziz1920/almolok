'use client'

import React from 'react'
import useColorStore from '@/hooks/use-color-store'
import { useTheme } from 'next-themes'
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts'

interface SalesCategoryData {
  _id: string
  totalSales: number
}

interface SalesCategoryPieChartProps {
  data: SalesCategoryData[]
}

export default function SalesCategoryPieChart({ data }: SalesCategoryPieChartProps) {
  const { theme } = useTheme()
  const { cssColors } = useColorStore(theme)

  const RADIAN = Math.PI / 180

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    index: number
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    const category = data[index]

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${category._id} ${category.totalSales} sales`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="totalSales"
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`hsl(${cssColors['--primary']})`}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
