import type { Position, Square, Piece } from '$lib/types';

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
		let fetch_piece = board[iter.x][iter.y].piece;
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

const upRight = { x: 1, y: -1 };
const upLeft = { x: -1, y: -1 };
const downLeft = { x: -1, y: 1 };
const downRight = { x: 1, y: 1 };

const knight_jump = [
	{ x: 2, y: -1 },
	{ x: 2, y: 1 },
	{ x: -2, y: -1 },
	{ x: -2, y: 1 },
	{ x: 1, y: 2 },
	{ x: -1, y: 2 },
	{ x: 1, y: -2 },
	{ x: -1, y: -2 }
];

const perpendiculars = [
	{ x: 0, y: -1 },
	{ x: 0, y: 1 },
	{ x: 1, y: 0 },
	{ x: -1, y: 0 }
];

const diagonals = [upRight, upLeft, downLeft, downRight];

const all_directions = diagonals.concat(perpendiculars);

function push_rows_and_columns(box: Square) {
	for (const pos of perpendiculars) {
		possible_moves = possible_moves.concat(propagate_dir(box, pos));
	}
}

function push_diags(box: Square) {
	for (const pos of diagonals) {
		possible_moves = possible_moves.concat(propagate_dir(box, pos));
	}
}

function push_possible_moves_in_set(box: Square & { piece: Piece }, set: Array<Position>) {
	const location = box.id;
	for (const iter of set) {
		let suggest = add_positions(location, iter);
		if (outside(suggest)) {
			continue;
		}
		let suggest_square = board[suggest.x][suggest.y];
		if (
			suggest_square.color == 'highlight' ||
			(suggest_square.piece && suggest_square.piece.team_white === box.piece.team_white)
		) {
			continue;
		}
		possible_moves.push(suggest);
	}
}
// White pawns move like black only flipped on its head so let's extract and work with a modifier

function push_pawn_moves(box: Square & { piece: Piece }) {
	function push_forward_enemy_only(dir: Position) {
		if (!outside(dir)) {
			const piece_pos = board[dir.x][dir.y].piece;
			if (piece_pos && piece_pos.team_white !== box.piece.team_white) {
				possible_moves.push(dir);
			}
		}
	}
	let extra_move =
		(box.id.y === 6 && box.piece?.team_white) || (box.id.y === 1 && !box.piece?.team_white) ? 1 : 0;

	let y_multiplier = box.piece.team_white ? -1 : 1;

	possible_moves = possible_moves.concat(
		propagate_dir(box, { x: 0, y: y_multiplier }, 1 + extra_move, false)
	);
	push_forward_enemy_only(add_positions(box.id, { x: 1, y: y_multiplier }));
	push_forward_enemy_only(add_positions(box.id, { x: -1, y: y_multiplier }));
}
