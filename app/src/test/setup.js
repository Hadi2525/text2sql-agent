import '@testing-library/jest-dom'

// Mock the window.fs API for tests if needed
global.window = global.window || {}
global.window.fs = {
  readFile: vi.fn()
}