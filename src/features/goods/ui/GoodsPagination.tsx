import { HStack, Text, Button, IconButton } from '@chakra-ui/react'

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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0Z" />
        </svg>
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708Z" />
        </svg>
      </IconButton>
    </HStack>
  )
}