import type { Position, Square, Piece } from '$lib/types';
import { board_store, piece_store } from '$lib/stores/chess_stores';
import type { piece_cache } from '$lib/stores/chess_stores';
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

import { decrypt_indice } from './chess_utilities';

function pawn_moves(pos: Position, white: boolean): Position[] {
	let available_moves: Position[] = [];
	function push_forward_enemy_only(dir: Position) {
		console.log('I am in pawns');
		if (!outside(dir)) {
			const piece_pos = get(board_store)[dir.x][dir.y].piece;
			console.log('Here is the piece at dir: ', piece_pos);
			console.log(`Here is the white: ${white} and here is the dir: ${dir}`);
			if (piece_pos && piece_pos.team_white !== white) {
				available_moves.push(dir);
			} else if ((white && dir.y == 2) || (!white && dir.y == 5)) {
				let stats = get(stats_store);
				const start_index = decrypt_indice(stats.last_move.slice(0, 2));
				const end_index = decrypt_indice(stats.last_move.slice(2, 4));
				if (
					stats.last_moved === 'Pawn' &&
					start_index.x === dir.x &&
					Math.abs(start_index.y - dir.y) == 1
				) {
					available_moves.push(dir);
					piece_store.set([{ from: end_index, to: { x: -1, y: -1 } }]);
				}
			}
		}
	}
	let extra_move = (pos.y === 6 && white) || (pos.y === 1 && !white) ? 1 : 0;

	let y_multiplier = white ? -1 : 1;

	available_moves = available_moves.concat(
		propagate_dir(pos, { x: 0, y: y_multiplier }, white, 1 + extra_move, false)
	);
	push_forward_enemy_only(add_positions(pos, { x: 1, y: y_multiplier }));
	push_forward_enemy_only(add_positions(pos, { x: -1, y: y_multiplier }));
	return available_moves;
}

import objectHash from 'object-hash';

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
	if (white) {
		results = apply_offset(
			pos,
			[
				{ x: 1, y: -1 },
				{ x: -1, y: -1 }
			],
			white
		);
		threatened = threatened || find_pieces_in_positions(results, [pieceHashes.black.pawn]);
	} else {
		results = apply_offset(
			pos,
			[
				{ x: 1, y: 1 },
				{ x: -1, y: 1 }
			],
			white
		);
		threatened = threatened || find_pieces_in_positions(results, [pieceHashes.white.pawn]);
	}
	return threatened;
}

function no_between_exclusive_horizontal(pos1: Position, pos2: Position, white: boolean): boolean {
	let movement = pos1.x < pos2.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
	let recording_castle_affected: piece_cache[] = [];
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
	piece_store.set(recording_castle_affected);
	return true;
}

import { stats_store } from '$lib/stores/chess_stores';

function get_castling(pos: Position, white: boolean): Position[] {
	let info = get(stats_store);
	let result: Position[] = [];
	const moved_h = white ? info.move_tracker.white_rook_h1 : info.move_tracker.black_rook_h8;
	const moved_a = white ? info.move_tracker.white_rook_a1 : info.move_tracker.black_rook_a8;
	const moved_king = white ? info.move_tracker.white_king : info.move_tracker.black_king;
	if (
		!moved_king &&
		!moved_h &&
		no_between_exclusive_horizontal(pos, { x: pos.x + 3, y: pos.y }, white)
	) {
		result.push({ x: 2, y: 0 });
	}
	if (
		!moved_king &&
		!moved_a &&
		no_between_exclusive_horizontal(pos, { x: pos.x - 4, y: pos.y }, white)
	) {
		result.push({ x: -2, y: 0 });
	}
	return apply_offset(pos, result, white);
}

export function generate_moves(box: Square): Position[] {
	if (box.piece == null) {
		return [];
	}
	switch (box.piece.name) {
		case 'Pawn':
			return pawn_moves(box.id, box.piece!.team_white);
		case 'Rook':
			return propagate_array(box.id, perpendiculars, box.piece!.team_white);
		case 'Bishop':
			return propagate_array(box.id, diagonals, box.piece!.team_white);
		case 'Queen':
			return propagate_array(box.id, all_directions, box.piece!.team_white);
		case 'King':
			let result = apply_offset(box.id, all_directions, box.piece!.team_white);
			result = result.concat(get_castling(box.id, box.piece.team_white));
			return result;
		case 'Knight':
			return apply_offset(box.id, knight_jump, box.piece!.team_white);
	}
}
