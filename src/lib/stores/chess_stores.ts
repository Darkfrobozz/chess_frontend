import type { Position, Square, Piece } from '$lib/types';
import board_json from '$lib/static/chess_rep.json';
import { json_representation_to_proper } from '$lib/scripts/chess_utilities';

// src/lib/stores.js or src/lib/stores.ts if using TypeScript
import { writable } from 'svelte/store';

// Create the first store

export const board_store = writable<Square[][]>(
	json_representation_to_proper(JSON.stringify(board_json))
);
type MovedStat = {
	black_rook_h8: boolean;
	black_rook_a8: boolean;
	black_king: boolean;
	white_rook_a1: boolean;
	white_rook_h1: boolean;
	white_king: boolean;
};

export type Stats = {
	move_tracker: MovedStat;
	moves: number;
	last_moved: string | null;
	last_move: string;
};

const moved_stats = {
	black_rook_h8: false,
	black_rook_a8: false,
	black_king: false,
	white_rook_a1: false,
	white_rook_h1: false,
	white_king: false
};

const initial_stats = {
	move_tracker: moved_stats,
	moves: 0,
	last_moved: '',
	last_move: ''
};

export type piece_cache = {
	from: Position;
	to: Position;
};

export const stats_store = writable<Stats>(initial_stats);

export const piece_store = writable<piece_cache[]>([]);
