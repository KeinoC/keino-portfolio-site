'use client'

import { interactionGroups } from '@react-three/rapier'

/**
 * Physics collision groups for the unified 3D world.
 * Using bitwise flags for flexible collision filtering.
 */
export const PHYSICS_GROUPS = {
  FLOOR: 1,      // 0b00000001 - Marble floor at z=0
  PLATFORM: 2,   // 0b00000010 - Home platform (raised table)
  LETTERS: 4,    // 0b00000100 - KEINO letters
  CUBE: 8,       // 0b00001000 - Light cube
  WALLS: 16,     // 0b00010000 - Invisible boundary walls
  PAGES: 32,     // 0b00100000 - Detail page planes
  DEBRIS: 64,    // 0b01000000 - Debris objects
  BOT: 128,      // 0b10000000 - Bot cube
} as const

/**
 * Pre-configured collision masks for each object type.
 * Defines what each type collides with.
 */
export const COLLISION_CONFIGS = {
  // Floor collides with: everything that can fall
  floor: interactionGroups(
    PHYSICS_GROUPS.FLOOR,
    PHYSICS_GROUPS.LETTERS | PHYSICS_GROUPS.CUBE | PHYSICS_GROUPS.DEBRIS | PHYSICS_GROUPS.BOT
  ),

  // Platform surface collides with: letters, cube only (NOT bot or debris - they operate on marble floor)
  platform: interactionGroups(
    PHYSICS_GROUPS.PLATFORM,
    PHYSICS_GROUPS.LETTERS | PHYSICS_GROUPS.CUBE
  ),

  // Letters collide with: floor, platform, other letters, cube, walls, debris
  letters: interactionGroups(
    PHYSICS_GROUPS.LETTERS,
    PHYSICS_GROUPS.FLOOR | PHYSICS_GROUPS.PLATFORM | PHYSICS_GROUPS.LETTERS |
    PHYSICS_GROUPS.CUBE | PHYSICS_GROUPS.WALLS | PHYSICS_GROUPS.DEBRIS
  ),

  // Cube collides with: everything except itself
  cube: interactionGroups(
    PHYSICS_GROUPS.CUBE,
    PHYSICS_GROUPS.FLOOR | PHYSICS_GROUPS.PLATFORM | PHYSICS_GROUPS.LETTERS |
    PHYSICS_GROUPS.WALLS | PHYSICS_GROUPS.PAGES | PHYSICS_GROUPS.DEBRIS | PHYSICS_GROUPS.BOT
  ),

  // Walls collide with: letters, cube, debris, bot
  walls: interactionGroups(
    PHYSICS_GROUPS.WALLS,
    PHYSICS_GROUPS.LETTERS | PHYSICS_GROUPS.CUBE | PHYSICS_GROUPS.DEBRIS | PHYSICS_GROUPS.BOT
  ),

  // Pages collide with: cube (for bouncing off), bot (for jumping onto)
  pages: interactionGroups(
    PHYSICS_GROUPS.PAGES,
    PHYSICS_GROUPS.CUBE | PHYSICS_GROUPS.BOT
  ),

  // Debris collides with: floor, letters, cube, walls, other debris, bot (NOT platform - falls to marble)
  debris: interactionGroups(
    PHYSICS_GROUPS.DEBRIS,
    PHYSICS_GROUPS.FLOOR | PHYSICS_GROUPS.LETTERS |
    PHYSICS_GROUPS.CUBE | PHYSICS_GROUPS.WALLS | PHYSICS_GROUPS.DEBRIS | PHYSICS_GROUPS.BOT
  ),

  // Bot collides with: floor, cube, walls, debris, pages (NOT platform - bot operates below platform level)
  bot: interactionGroups(
    PHYSICS_GROUPS.BOT,
    PHYSICS_GROUPS.FLOOR | PHYSICS_GROUPS.CUBE |
    PHYSICS_GROUPS.WALLS | PHYSICS_GROUPS.DEBRIS | PHYSICS_GROUPS.PAGES
  ),
} as const

/**
 * Z-axis layer constants for the 3D world.
 * Objects are positioned on these layers.
 */
export const Z_LAYERS = {
  FLOOR: 0,                  // Marble floor surface
  PLATFORM_BASE: 0.01,       // Platform bottom (sits on floor)
  PLATFORM_SURFACE: 1.0,     // Platform top surface height (increased from 0.5 to ensure clear separation)
  PAGE_PLANE: 1.5,           // Detail pages (elevated above floor for bot to jump to)
  LETTERS_BASE: 1.01,        // Letters sitting on platform (increased accordingly)
  CUBE_REST: 0.25,           // Cube resting height
  CUBE_HOVER: 2.0,           // Cube idle hover height
  BOT_FLOOR: 0.2,            // Bot operating height on floor
} as const

/**
 * Physical dimensions for consistent sizing.
 */
export const PHYSICS_DIMENSIONS = {
  FLOOR_SIZE: 100,           // Floor extends 100 units in x/y
  WALL_THICKNESS: 0.5,       // Invisible wall thickness
  WALL_HEIGHT: 5,            // How tall the walls are
  PLATFORM_WIDTH: 8,         // Home platform width
  PLATFORM_DEPTH: 6,         // Home platform depth
  PLATFORM_HEIGHT: 0.5,      // Home platform thickness
  PLATFORM_EDGE_HEIGHT: 0.15, // Low edge walls (letters can be knocked over)
} as const
