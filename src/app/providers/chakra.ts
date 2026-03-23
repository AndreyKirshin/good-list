import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        blue: {
          50: { value: '#eef2ff' },
          100: { value: '#e0e7ff' },
          200: { value: '#c7d2fe' },
          300: { value: '#a5b4fc' },
          400: { value: '#818cf8' },
          500: { value: '#242EDB' },
          600: { value: '#242EDB' },
          700: { value: '#4f46e5' },
          800: { value: '#4338ca' },
          900: { value: '#3730a3' },
          950: { value: '#312e81' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)