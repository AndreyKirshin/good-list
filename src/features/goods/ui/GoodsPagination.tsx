import { HStack, Text, Button, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '../../../shared/ui'

interface GoodsPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function GoodsPagination({ page, totalPages, onPageChange }: GoodsPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(0)
      
      if (page > 2) {
        pages.push('...')
      }
      
      const start = Math.max(1, page - 1)
      const end = Math.min(totalPages - 2, page + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (page < totalPages - 3) {
        pages.push('...')
      }
      
      pages.push(totalPages - 1)
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <HStack justify="center" mt={6} gap={2}>
      <IconButton
        aria-label="Предыдущая страница"
        size="sm"
        variant="ghost"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        <ChevronLeftIcon />
      </IconButton>

      {getPageNumbers().map((pageNum, idx) => (
        typeof pageNum === 'number' ? (
          <Button
            key={idx}
            size="xs"
            variant={pageNum === page ? 'solid' : 'outline'}
            colorPalette={pageNum === page ? 'blue' : 'gray'}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </Button>
        ) : (
          <Text key={idx} px={2}>...</Text>
        )
      ))}

      <IconButton
        aria-label="Следующая страница"
        size="sm"
        variant="ghost"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        <ChevronRightIcon />
      </IconButton>
    </HStack>
  )
}