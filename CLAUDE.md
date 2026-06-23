# CLAUDE.md — Space Shooter Project

## Project Overview
A browser-based space shooter built with vanilla JS and HTML5 Canvas.
No build tools, no bundlers, no external libraries.
To run: open `index.html` directly in any modern browser.

## File Structure
| File | Purpose |
|------|---------|
| `index.html` | Canvas element + stylesheet/script links only |
| `style.css` | Flex-centers canvas, dark background, suppresses scrollbars |
| `game.js` | All classes and game logic |
| `CLAUDE.md` | This file — project assumptions and decisions |
| `.env` | Placeholder; no real secrets needed |
| `.gitignore` | Standard web ignores; `.env` is excluded from git |

## Architecture Decisions
- Single `game.js` — no ES modules — works with `file://` protocol without a server
- Canvas fixed at 800×600 — simplifies coordinate math and collision detection
- RAF loop never stops; a `state` variable gates which logic runs each frame
- All rendering is programmatic (no image assets) — project is fully self-contained

## Game States
```
START → PLAYING → GAME_OVER → PLAYING (cycle)
```
Transitions are triggered by the spacebar.

## Coordinate System
- Origin `(0, 0)` is top-left of canvas
- Player `y` is fixed near the bottom
- Enemy `y` increases (moves downward); bullet `y` decreases (moves upward)

## Controls
| Key | Action |
|-----|--------|
| Arrow Left / Right | Move player ship |
| Space | Fire bullet / Start / Restart |

## Collision Detection
AABB (axis-aligned bounding box) only. Each object exposes `getHitbox()` returning
`{ x, y, w, h }` where `x/y` is the top-left corner. The helper `aabbOverlap(a, b)`
is used to test bullet-enemy pairs each frame.

## Difficulty Scaling (time-based from game start)
- **Spawn interval**: `max(300ms, 1500ms − elapsed/10)` — minimum reached after ~2 min
- **Enemy speed**: `min(4.0, 1.5 + elapsed/30000)` px/frame — caps at ~75 s elapsed

Newly spawned enemies use the current speed value; existing enemies on screen are
unaffected, which creates a gradual ramp feeling.

## Known Limitations / Future Work
- No sound effects
- No high-score persistence (no localStorage)
- Mobile / touch controls not implemented
- No pause functionality
- Enemies move purely vertically (no lateral weaving)
