import type { Position, Square, Piece } from '$lib/types';
import { board_store } from '$lib/stores/chess_stores';
import { get } from 'svelte/store';
import { pieceHashes } from '$lib/static/sprites';

const add_positions = (pos1: Position, pos2: Position) => ({
	x: pos1.x + pos2.x,
	y: pos1.y + pos2.y
});
const outside = (pos1: Position) => pos1.x > 7 || pos1.x < 0 || pos1.y > 7 || pos1.y < 0;

function propagate_dir(
	box: Square,
	dir: Position,
	max: number = 8,
	capture: boolean = true
): Array<Position> {
	let iter = add_positions(box.id, dir);
	let result = [];
	let i = 0;
	while (!outside(iter) && i < max) {
		let fetch_piece = get(board_store)[iter.x][iter.y].piece;
		if (fetch_piece) {
			if (fetch_piece.team_white !== box.piece?.team_white && capture) {
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

function propagate_array(box: Square, arr: Position[]): Position[] {
	let all_propagations: Position[] = [];
	for (const pos of arr) {
		all_propagations = all_propagations.concat(propagate_dir(box, pos));
	}
	return all_propagations;
}

function apply_offset(box: Square & { piece: Piece }, set: Array<Position>): Position[] {
	let relative_positions = [];
	const location = box.id;
	for (const iter of set) {
		let suggest = add_positions(location, iter);
		if (outside(suggest)) {
			continue;
		}
		let suggest_square = get(board_store)[suggest.x][suggest.y];
		if (
			suggest_square.color == 'highlight' ||
			(suggest_square.piece && suggest_square.piece.team_white === box.piece.team_white)
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
		propagate_dir(box, { x: 0, y: y_multiplier }, 1 + extra_move, false)
	);
	push_forward_enemy_only(add_positions(box.id, { x: 1, y: y_multiplier }));
	push_forward_enemy_only(add_positions(box.id, { x: -1, y: y_multiplier }));
	return available_moves;
}

import objectHash from 'object-hash';

export function generate_moves(box: Square): Position[] {
	switch (objectHash(JSON.stringify(box.piece))) {
		case pieceHashes.black.pawn:
		case pieceHashes.white.pawn:
			return pawn_moves(box as Square & { piece: Piece });
		case pieceHashes.black.rook:
		case pieceHashes.white.rook:
			return propagate_array(box, perpendiculars);
		case pieceHashes.black.bishop:
		case pieceHashes.white.bishop:
			return propagate_array(box, diagonals);
		case pieceHashes.black.queen:
		case pieceHashes.white.queen:
			return propagate_array(box, all_directions);
		case pieceHashes.black.king:
		case pieceHashes.white.king:
			return apply_offset(box as Square & { piece: Piece }, all_directions);
		case pieceHashes.black.knight:
		case pieceHashes.white.knight:
			return apply_offset(box as Square & { piece: Piece }, knight_jump);
		default:
			return [];
	}
}
