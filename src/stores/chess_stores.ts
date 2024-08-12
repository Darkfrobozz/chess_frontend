import type { Position, Square, Piece } from '$lib/types';
import board_json from '$lib/start_chess_board.json';

// src/lib/stores.js or src/lib/stores.ts if using TypeScript
import { writable } from 'svelte/store';

// Create the first store
export const board_store = writable<Square[][]>(board_json);
export const possible_moves_store = writable<Position[]>([]);
