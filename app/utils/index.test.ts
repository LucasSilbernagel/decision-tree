import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import DOMPurify from 'dompurify'
import {
  calculateTreeDimensions,
  serializeDecisionTree,
  deserializeDecisionTree,
  debounce,
} from './index'
import { TREE_CONSTANTS } from '~/constants'
import type { DecisionTree, DecisionTreeNode } from '~/types'

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((str) => str), // Return input unchanged for testing
  },
}))

describe('calculateTreeDimensions', () => {
  const {
    MIN_NODE_WIDTH,
    VERTICAL_SPACING,
    HORIZONTAL_SPACING,
    WIDTH_MULTIPLIER,
  } = TREE_CONSTANTS

  it('returns zero dimensions for null node', () => {
    const result = calculateTreeDimensions(null as unknown as DecisionTreeNode)
    expect(result).toEqual({ width: 0, height: 0 })
  })

  it('calculates dimensions for a leaf node', () => {
    const node: DecisionTreeNode = {
      id: 1,
      text: { value: 'Test', isEditing: false },
      parentId: 0,
      yes: null,
      no: null,
    }

    const result = calculateTreeDimensions(node)
    expect(result).toEqual({
      width: MIN_NODE_WIDTH,
      height: VERTICAL_SPACING,
    })
  })

  it('properly applies width multiplier based on depth', () => {
    const node: DecisionTreeNode = {
      id: 1,
      text: { value: 'Root', isEditing: false },
      parentId: 0,
      yes: {
        id: 2,
        text: { value: 'Level 1', isEditing: false },
        parentId: 1,
        yes: {
          id: 3,
          text: { value: 'Level 2', isEditing: false },
          parentId: 2,
          yes: null,
          no: null,
        },
        no: null,
      },
      no: null,
    }

    const result = calculateTreeDimensions(node)

    // Testing that width increases with depth
    expect(result.width).toBeGreaterThanOrEqual(MIN_NODE_WIDTH)
    expect(result.width).toBeGreaterThanOrEqual(
      MIN_NODE_WIDTH * WIDTH_MULTIPLIER
    )
    expect(result.width).toBeGreaterThanOrEqual(
      MIN_NODE_WIDTH * Math.pow(WIDTH_MULTIPLIER, 2)
    )
  })

  it('calculates dimensions for a node with children', () => {
    const node: DecisionTreeNode = {
      id: 1,
      text: { value: 'Root', isEditing: false },
      parentId: 0,
      yes: {
        id: 2,
        text: { value: 'Yes', isEditing: false },
        parentId: 1,
        yes: null,
        no: null,
      },
      no: {
        id: 3,
        text: { value: 'No', isEditing: false },
        parentId: 1,
        yes: null,
        no: null,
      },
    }

    const result = calculateTreeDimensions(node)
    const level1Width = MIN_NODE_WIDTH * WIDTH_MULTIPLIER
    expect(result.width).toBeGreaterThanOrEqual(
      Math.max(MIN_NODE_WIDTH, level1Width * 2 + HORIZONTAL_SPACING)
    )
    expect(result.height).toBe(VERTICAL_SPACING * 2) // Account for two levels
  })
})

describe('serializeDecisionTree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('serializes a simple tree', () => {
    const tree: DecisionTree = {
      title: { value: 'Test Tree', isEditing: false },
      node: {
        id: 1,
        text: { value: 'Root', isEditing: false },
        parentId: 0,
        yes: null,
        no: null,
      },
    }

    const result = serializeDecisionTree(tree)
    expect(DOMPurify.sanitize).toHaveBeenCalledWith('Test Tree')
    expect(DOMPurify.sanitize).toHaveBeenCalledWith('Root')

    const decoded = JSON.parse(decodeURIComponent(result))
    expect(decoded).toEqual({
      title: 'Test Tree',
      node: {
        id: 1,
        text: 'Root',
        parentId: 0,
        yes: null,
        no: null,
      },
    })
  })

  it('serializes a complex tree', () => {
    const tree: DecisionTree = {
      title: { value: 'Complex Tree', isEditing: false },
      node: {
        id: 1,
        text: { value: 'Root', isEditing: false },
        parentId: 0,
        yes: {
          id: 2,
          text: { value: 'Yes Branch', isEditing: false },
          parentId: 1,
          yes: null,
          no: null,
        },
        no: {
          id: 3,
          text: { value: 'No Branch', isEditing: false },
          parentId: 1,
          yes: null,
          no: null,
        },
      },
    }

    const result = serializeDecisionTree(tree)
    const decoded = JSON.parse(decodeURIComponent(result))
    expect(decoded.node.yes.text).toBe('Yes Branch')
    expect(decoded.node.no.text).toBe('No Branch')
  })
})

describe('deserializeDecisionTree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deserializes a valid tree', () => {
    const serializedTree = encodeURIComponent(
      JSON.stringify({
        title: 'Test Tree',
        node: {
          id: '1',
          text: 'Root',
          parentId: null,
          yes: null,
          no: null,
        },
      })
    )

    const result = deserializeDecisionTree(serializedTree)
    expect(result).toEqual({
      title: { value: 'Test Tree', isEditing: false },
      node: {
        id: '1',
        text: { value: 'Root', isEditing: false },
        parentId: null,
        yes: null,
        no: null,
      },
    })
  })

  it('returns null for invalid input', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const result = deserializeDecisionTree('invalid-json')
    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error deserializing tree:',
      expect.any(SyntaxError)
    )

    consoleErrorSpy.mockRestore()
  })

  it('sanitizes input during deserialization', () => {
    const serializedTree = encodeURIComponent(
      JSON.stringify({
        title: '<script>alert("xss")</script>Test',
        node: {
          id: '1',
          text: '<img onerror="alert(1)">Test',
          parentId: null,
          yes: null,
          no: null,
        },
      })
    )

    deserializeDecisionTree(serializedTree)
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(
      '<script>alert("xss")</script>Test'
    )
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(
      '<img onerror="alert(1)">Test'
    )
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('only executes once for multiple rapid calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('can be cancelled', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    debouncedFn.cancel()

    vi.advanceTimersByTime(1000)
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('preserves function arguments', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn('test', 123)
    vi.advanceTimersByTime(1000)

    expect(mockFn).toHaveBeenCalledWith('test', 123)
  })
})
