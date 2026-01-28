/**
 * Shared utilities for Memory Graph components
 */

import type { MemoryNode, MemoryEdge, Position2D, LayoutResult } from './types'

// Entity type colors (matching Zep's schema + custom types)
export const typeColors: Record<string, number> = {
  // Zep built-in types
  user: 0x00d9a6,         // Teal/green - central user node
  assistant: 0x7c4dff,    // Purple - AI assistant
  preference: 0xffb74d,   // Amber - user preferences
  procedure: 0x4db6ac,    // Teal - procedures/instructions
  
  // Common entity types
  person: 0xff6b9d,       // Pink - people
  organization: 0xffa726, // Orange - companies, institutions
  location: 0x26c6da,     // Cyan - places
  event: 0x5c6bc0,        // Indigo - events, meetings
  project: 0xffca28,      // Yellow - projects
  topic: 0x7e57c2,        // Deep purple - topics/subjects
  product: 0x4fc3f7,      // Light blue - products/services
  skill: 0x81c784,        // Light green - skills/expertise
  
  // Additional types
  attribute: 0x29b6f6,    // Sky blue - attributes/properties
  genre: 0xab47bc,        // Purple - categories
  artist: 0xff6b9d,       // Pink - artists
  venue: 0x26c6da,        // Cyan - venues
  fact: 0x90a4ae,         // Blue-grey - facts
  tool: 0x66bb6a,         // Green - tools
  activity: 0xec407a,     // Pink - activities
  
  // Default fallback
  entity: 0xffa726,       // Orange (default)
}

export const typeColorsHex: Record<string, string> = {
  // Zep built-in types
  user: '#00d9a6',
  assistant: '#7c4dff',
  preference: '#ffb74d',
  procedure: '#4db6ac',
  
  // Common entity types
  person: '#ff6b9d',
  organization: '#ffa726',
  location: '#26c6da',
  event: '#5c6bc0',
  project: '#ffca28',
  topic: '#7e57c2',
  product: '#4fc3f7',
  skill: '#81c784',
  
  // Additional types
  attribute: '#29b6f6',
  genre: '#ab47bc',
  artist: '#ff6b9d',
  venue: '#26c6da',
  fact: '#90a4ae',
  tool: '#66bb6a',
  activity: '#ec407a',
  
  // Default fallback
  entity: '#ffa726',
}

export const defaultColor = 0xffa726
export const defaultColorHex = '#ffa726'

export function getNodeColor(type: string): number {
  const key = type.toLowerCase() as keyof typeof typeColors
  return typeColors[key] ?? defaultColor
}

export function getNodeColorHex(type: string): string {
  const key = type.toLowerCase() as keyof typeof typeColorsHex
  return typeColorsHex[key] ?? defaultColorHex
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateStr
  }
}

/**
 * Calculate node degrees (connection counts)
 */
export function calculateDegrees(
  nodes: MemoryNode[], 
  edges: MemoryEdge[]
): Map<string, number> {
  const degrees = new Map<string, number>()
  
  nodes.forEach(node => {
    degrees.set(node.id, 0)
  })
  
  edges.forEach(edge => {
    degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1)
    degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1)
  })
  
  return degrees
}

/**
 * Find the central node (highest degree)
 */
export function findCentralNode(degrees: Map<string, number>): string {
  let centralNodeId = 'user'
  let maxDegree = 0
  
  degrees.forEach((degree, id) => {
    if (degree > maxDegree) {
      maxDegree = degree
      centralNodeId = id
    }
  })
  
  return centralNodeId
}

/**
 * Calculate node radius based on degree
 */
export function calculateNodeRadius(
  degree: number, 
  maxDegree: number, 
  isUser: boolean,
  minRadius = 6,
  maxRadius = 16
): number {
  const degreeScale = Math.min(degree / maxDegree, 1)
  let radius = minRadius + (maxRadius - minRadius) * Math.sqrt(degreeScale)
  if (isUser) radius = Math.max(radius, 14)
  return radius
}

/**
 * 2D Force-directed layout algorithm
 */
export function calculate2DLayout(
  nodes: MemoryNode[],
  edges: MemoryEdge[],
  width: number,
  height: number,
  iterations = 300
): LayoutResult {
  const positions = new Map<string, Position2D>()
  const degrees = calculateDegrees(nodes, edges)
  const centralNodeId = findCentralNode(degrees)
  
  // Find nodes connected to central node
  const connectedToCentral = new Set<string>()
  edges.forEach(edge => {
    if (edge.source === centralNodeId) connectedToCentral.add(edge.target)
    if (edge.target === centralNodeId) connectedToCentral.add(edge.source)
  })
  
  // Initial positions: radial layout
  const centerX = width / 2
  const centerY = height / 2
  const directRadius = Math.min(width, height) * 0.25
  const indirectRadius = Math.min(width, height) * 0.4
  
  let directAngle = 0
  let indirectAngle = 0
  const directAngleStep = (2 * Math.PI) / Math.max(connectedToCentral.size, 1)
  const indirectNodes = nodes.filter(n => n.id !== centralNodeId && !connectedToCentral.has(n.id))
  const indirectAngleStep = (2 * Math.PI) / Math.max(indirectNodes.length, 1)
  
  nodes.forEach(node => {
    if (node.id === centralNodeId) {
      positions.set(node.id, { x: centerX, y: centerY })
    } else if (connectedToCentral.has(node.id)) {
      positions.set(node.id, {
        x: centerX + directRadius * Math.cos(directAngle),
        y: centerY + directRadius * Math.sin(directAngle)
      })
      directAngle += directAngleStep
    } else {
      positions.set(node.id, {
        x: centerX + indirectRadius * Math.cos(indirectAngle + Math.PI / 4),
        y: centerY + indirectRadius * Math.sin(indirectAngle + Math.PI / 4)
      })
      indirectAngle += indirectAngleStep
    }
  })
  
  // Force-directed refinement
  const k = 0.15
  const baseRepulsion = 8000
  const minDistance = 40
  
  for (let i = 0; i < iterations; i++) {
    const cooling = 1 - (i / iterations) * 0.7
    
    // Repulsion
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const nodeA = nodes[a]
        const nodeB = nodes[b]
        if (!nodeA || !nodeB) continue
        
        const posA = positions.get(nodeA.id)!
        const posB = positions.get(nodeB.id)!
        
        const dx = posA.x - posB.x
        const dy = posA.y - posB.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        
        const degreeA = degrees.get(nodeA.id) || 1
        const degreeB = degrees.get(nodeB.id) || 1
        const degreeFactor = Math.sqrt(degreeA * degreeB) / 2 + 1
        
        const repulsion = baseRepulsion * degreeFactor
        let force = (repulsion / (dist * dist)) * cooling
        
        if (dist < minDistance) {
          force += (minDistance - dist) * 2 * cooling
        }
        
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        
        if (nodeA.id !== centralNodeId) {
          posA.x += fx
          posA.y += fy
        }
        if (nodeB.id !== centralNodeId) {
          posB.x -= fx
          posB.y -= fy
        }
      }
    }
    
    // Attraction along edges
    edges.forEach(edge => {
      const posA = positions.get(edge.source)
      const posB = positions.get(edge.target)
      
      if (posA && posB) {
        const dx = posB.x - posA.x
        const dy = posB.y - posA.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        
        const degreeA = degrees.get(edge.source) || 1
        const degreeB = degrees.get(edge.target) || 1
        const targetLength = 50 + Math.max(degreeA, degreeB) * 6
        
        const force = (dist - targetLength) * k * cooling
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        
        if (edge.source !== centralNodeId) {
          posA.x += fx
          posA.y += fy
        }
        if (edge.target !== centralNodeId) {
          posB.x -= fx
          posB.y -= fy
        }
      }
    })
    
    // Boundary constraints
    const padding = 50
    positions.forEach((pos, id) => {
      if (id !== centralNodeId) {
        pos.x = Math.max(padding, Math.min(width - padding, pos.x))
        pos.y = Math.max(padding, Math.min(height - padding, pos.y))
      }
    })
  }
  
  return { positions, degrees }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 2) + '..'
}
