'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SelectVariant({
  players = [], // قائمة اللاعبين الاختيارية
}: {
  players?: Array<{ id: string; name: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPlayerId = searchParams.get('playerId')

  const handleSelect = (id: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('playerId', id)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  return (
    <div className='space-y-2'>
      {currentPlayerId ? (
        <div className='p-2 border rounded-md bg-gray-50'>
          <p>
            Selected Player:{' '}
            <span className='font-medium'>
              {players.find((p) => p.id === currentPlayerId)?.name ||
                currentPlayerId}
            </span>
          </p>
        </div>
      ) : (
        <p className='text-sm text-muted-foreground'>No player selected</p>
      )}

      {players.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {players.map((player) => (
            <Button
              key={player.id}
              variant='outline'
              size='sm'
              onClick={() => handleSelect(player.id)}
            >
              {player.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
