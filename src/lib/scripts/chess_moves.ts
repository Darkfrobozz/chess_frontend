import type { Position, Square, Piece } from '$lib/types';
import { board_store, castle_store } from '$lib/stores/chess_stores';
import type { castle_move_info } from '$lib/stores/chess_stores';
import { get } from 'svelte/store';
import { pieceHashes, pieces } from '$lib/static/sprites';

const add_positions = (pos1: Position, pos2: Position) => ({
	x: pos1.x + pos2.x,
	y: pos1.y + pos2.y
});
const outside = (pos1: Position) => pos1.x > 7 || pos1.x < 0 || pos1.y > 7 || pos1.y < 0;
const contains_piece = (pos: Position) => get(board_store)[pos.x][pos.y].piece !== null;

function propagate_dir(
	pos: Position,
	dir: Position,
	white: boolean,
	max: number = 8,
	capture: boolean = true
): Array<Position> {
	let iter = add_positions(pos, dir);
	let result = [];
	let i = 0;
	while (!outside(iter) && i < max) {
		let fetch_piece = get(board_store)[iter.x][iter.y].piece;
		if (fetch_piece) {
			if (fetch_piece.team_white !== white && capture) {
				result.push(iter);
			}
			return result;
		} else {
			result.push(iter);
		}
		iter = add_positions(iter, dir);
		i++;
	}
	return result;
}

const diagonals = [
	{ x: 1, y: -1 },
	{ x: -1, y: -1 },
	{ x: -1, y: 1 },
	{ x: 1, y: 1 }
];

const perpendiculars = [
	{ x: 0, y: -1 },
	{ x: 0, y: 1 },
	{ x: 1, y: 0 },
	{ x: -1, y: 0 }
];

export const knight_jump = [
	{ x: 2, y: -1 },
	{ x: 2, y: 1 },
	{ x: -2, y: -1 },
	{ x: -2, y: 1 },
	{ x: 1, y: 2 },
	{ x: -1, y: 2 },
	{ x: 1, y: -2 },
	{ x: -1, y: -2 }
];

export const all_directions = diagonals.concat(perpendiculars);

function propagate_array(initial_pos: Position, arr: Position[], white: boolean): Position[] {
	let all_propagations: Position[] = [];
	for (const dir of arr) {
		all_propagations = all_propagations.concat(propagate_dir(initial_pos, dir, white));
	}
	return all_propagations;
}

function apply_offset(pos: Position, set: Array<Position>, white: boolean): Position[] {
	let relative_positions = [];
	const location = pos;
	for (const iter of set) {
		let suggest = add_positions(location, iter);
		if (outside(suggest)) {
			continue;
		}
		let suggest_square = get(board_store)[suggest.x][suggest.y];
		if (
			suggest_square.color == 'highlight' ||
			(suggest_square.piece && suggest_square.piece.team_white === white)
		) {
			continue;
		}
		relative_positions.push(suggest);
	}
	return relative_positions;
}

function pawn_moves(box: Square & { piece: Piece }): Position[] {
	let available_moves: Position[] = [];
	function push_forward_enemy_only(dir: Position) {
		if (!outside(dir)) {
			const piece_pos = get(board_store)[dir.x][dir.y].piece;
			if (piece_pos && piece_pos.team_white !== box.piece.team_white) {
				available_moves.push(dir);
			}
		}
	}
	let extra_move =
		(box.id.y === 6 && box.piece?.team_white) || (box.id.y === 1 && !box.piece?.team_white) ? 1 : 0;

	let y_multiplier = box.piece.team_white ? -1 : 1;

	available_moves = available_moves.concat(
		propagate_dir(box.id, { x: 0, y: y_multiplier }, box.piece.team_white, 1 + extra_move, false)
	);
	push_forward_enemy_only(add_positions(box.id, { x: 1, y: y_multiplier }));
	push_forward_enemy_only(add_positions(box.id, { x: -1, y: y_multiplier }));
	return available_moves;
}

function position_is_threatened(pos: Position, white: boolean): boolean {
	function find_pieces_in_positions(arr: Position[], pieces: string[]): boolean {
		const result = arr.some((potential_pos) =>
			pieces.some(
				(piece_hash) =>
					objectHash(JSON.stringify(get(board_store)[potential_pos.x][potential_pos.y].piece)) ===
					piece_hash
			)
		);
		if (result) {
			return true;
		}
		return false;
	}
	let threatened = false;
	let results = propagate_array(pos, perpendiculars, white);
	if (white) {
		threatened =
			threatened ||
			find_pieces_in_positions(results, [pieceHashes.black.queen, pieceHashes.black.rook]);
	} else {
		threatened =
			threatened ||
			find_pieces_in_positions(results, [pieceHashes.white.queen, pieceHashes.white.rook]);
	}
	results = propagate_array(pos, diagonals, white);
	if (white) {
		threatened =
			threatened ||
			find_pieces_in_positions(results, [pieceHashes.black.queen, pieceHashes.black.bishop]);
	} else {
		threatened =
			threatened ||
			find_pieces_in_positions(results, [pieceHashes.white.queen, pieceHashes.white.bishop]);
	}
	results = apply_offset(pos, knight_jump, white);
	if (white) {
		threatened = threatened || find_pieces_in_positions(results, [pieceHashes.black.knight]);
	} else {
		threatened = threatened || find_pieces_in_positions(results, [pieceHashes.white.knight]);
	}
	return threatened;
}

function no_between_exclusive_horizontal(pos1: Position, pos2: Position, white: boolean): boolean {
	let movement = pos1.x < pos2.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
	let recording_castle_affected: castle_move_info[] = [];
	if (position_is_threatened(pos1, white)) {
		return false;
	}
	pos1 = add_positions(pos1, movement);
	let move = 1;
	let castle_to = pos1;
	while (!outside(pos1) && pos1.x !== pos2.x) {
		if (contains_piece(pos1) || (position_is_threatened(pos1, white) && move < 3)) {
			return false;
		}
		pos1 = add_positions(pos1, movement);
		move++;
	}
	recording_castle_affected.push({ from: pos1, to: castle_to });
	castle_store.set(recording_castle_affected);
	return true;
}

import { stats_store } from '$lib/stores/chess_stores';

function get_castling(box: Square & { piece: Piece }): Position[] {
	let info = get(stats_store);
	let result: Position[] = [];
	if (box.piece.team_white && !info.move_tracker.white_king) {
		if (
			!info.move_tracker.white_rook_h1 &&
			no_between_exclusive_horizontal(
				box.id,
				{ x: box.id.x + 3, y: box.id.y },
				box.piece.team_white
			)
		) {
			result.push({ x: 2, y: 0 });
		}
		if (
			!info.move_tracker.white_rook_a1 &&
			no_between_exclusive_horizontal(
				box.id,
				{ x: box.id.x - 4, y: box.id.y },
				box.piece.team_white
			)
		) {
			result.push({ x: -2, y: 0 });
		}
	} else if (!info.move_tracker.black_king) {
		if (
			!info.move_tracker.black_rook_h8 &&
			no_between_exclusive_horizontal(
				box.id,
				{ x: box.id.x + 3, y: box.id.y },
				box.piece.team_white
			)
		) {
			result.push({ x: 2, y: 0 });
		}
		if (
			!info.move_tracker.black_rook_a8 &&
			no_between_exclusive_horizontal(
				box.id,
				{ x: box.id.x - 4, y: box.id.y },
				box.piece.team_white
			)
		) {
			result.push({ x: -2, y: 0 });
		}
	}
	// This needs extra validation
	return apply_offset(box.id, result, box.piece.team_white);
}

import objectHash from 'object-hash';

export function generate_moves(box: Square): Position[] {
	switch (objectHash(JSON.stringify(box.piece))) {
		case pieceHashes.black.pawn:
		case pieceHashes.white.pawn:
			return pawn_moves(box as Square & { piece: Piece });
		case pieceHashes.black.rook:
		case pieceHashes.white.rook:
			return propagate_array(box.id, perpendiculars, box.piece!.team_white);
		case pieceHashes.black.bishop:
		case pieceHashes.white.bishop:
			return propagate_array(box.id, diagonals, box.piece!.team_white);
		case pieceHashes.black.queen:
		case pieceHashes.white.queen:
			return propagate_array(box.id, all_directions, box.piece!.team_white);
		case pieceHashes.black.king:
		case pieceHashes.white.king:
			let result = apply_offset(box.id, all_directions, box.piece!.team_white);
			result = result.concat(get_castling(box as Square & { piece: Piece }));
			return result;
		case pieceHashes.black.knight:
		case pieceHashes.white.knight:
			return apply_offset(box.id, knight_jump, box.piece!.team_white);
		default:
			return [];
	}
}
