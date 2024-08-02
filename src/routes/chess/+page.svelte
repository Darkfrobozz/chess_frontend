<script lang="ts">
	import black_knight_sprite from '$lib/black/knight.png';
	import black_bishop_sprite from '$lib/black/bishop.png';
	import black_king_sprite from '$lib/black/king.png';
	import black_pawn_sprite from '$lib/black/pawn.png';
	import black_queen_sprite from '$lib/black/queen.png';
	import black_rook_sprite from '$lib/black/rook.png';

	import white_knight_sprite from '$lib/white/knight.png';
	import white_bishop_sprite from '$lib/white/bishop.png';
	import white_king_sprite from '$lib/white/king.png';
	import white_pawn_sprite from '$lib/white/pawn.png';
	import white_queen_sprite from '$lib/white/queen.png';
	import white_rook_sprite from '$lib/white/rook.png';

	function create_black_piece(sprite: string): Piece {
		return {
			team_white: false,
			sprite
		};
	}
	function create_white_piece(sprite: string): Piece {
		return {
			team_white: true,
			sprite
		};
	}

	const white_knight = create_white_piece(white_knight_sprite);
	const white_bishop = create_white_piece(white_bishop_sprite);
	const white_king = create_white_piece(white_king_sprite);
	const white_queen = create_white_piece(white_queen_sprite);
	const white_pawn = create_white_piece(white_pawn_sprite);
	const white_rook = create_white_piece(white_rook_sprite);

	const black_knight = create_black_piece(black_knight_sprite);
	const black_bishop = create_black_piece(black_bishop_sprite);
	const black_king = create_black_piece(black_king_sprite);
	const black_queen = create_black_piece(black_queen_sprite);
	const black_pawn = create_black_piece(black_pawn_sprite);
	const black_rook = create_black_piece(black_rook_sprite);

	type Position = {
		x: number;
		y: number;
	};

	type Piece = {
		team_white: boolean;
		sprite: string;
	};

	type Square = {
		original: String;
		color: String;
		piece: Piece | null;
		id: Position;
	};

	let possible_moves: Array<Position> = [];
	let selected: Position;
	let turn_white = true;
	let column = 0;
	let board = Array.from({ length: 8 }, () => {
		let row = 0;
		column++;
		return Array.from({ length: 8 }, () => {
			let piece = null;
			switch (row) {
				case 0:
					switch (column - 1) {
						case 1:
						case 6:
							piece = black_knight;
							break;
						case 2:
						case 5:
							piece = black_bishop;
							break;

						case 3:
							piece = black_queen;
							break;
						case 4:
							piece = black_king;
							break;
						default:
							piece = black_rook;
							break;
					}
					break;
				case 7:
					switch (column - 1) {
						case 1:
						case 6:
							piece = white_knight;
							break;
						case 2:
						case 5:
							piece = white_bishop;
							break;

						case 3:
							piece = white_queen;
							break;
						case 4:
							piece = white_king;
							break;
						default:
							piece = white_rook;
							break;
					}
					break;
				case 6:
					piece = white_pawn;
					break;
				case 1:
					piece = black_pawn;
					break;
				default:
					break;
			}
			let color = (row + column - 1) % 2 === 0 ? 'white' : 'black';
			row++;
			return { original: color, color, piece, id: { x: column - 1, y: row - 1 } };
		});
	});

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
			(box.id.y === 6 && box.piece?.team_white) || (box.id.y === 1 && !box.piece?.team_white)
				? 1
				: 0;

		let y_multiplier = box.piece.team_white ? -1 : 1;

		possible_moves = possible_moves.concat(
			propagate_dir(box, { x: 0, y: y_multiplier }, 1 + extra_move, false)
		);
		push_forward_enemy_only(add_positions(box.id, { x: 1, y: y_multiplier }));
		push_forward_enemy_only(add_positions(box.id, { x: -1, y: y_multiplier }));
	}

	function register_square_click(box: Square): void {
		// Move
		let moved = false;
		if (possible_moves.some((pos) => box.id.x == pos.x && box.id.y == pos.y)) {
			board[box.id.x][box.id.y].piece = board[selected.x][selected.y].piece;
			board[selected.x][selected.y].piece = null;
			moved = true;
			turn_white = !turn_white;
		}
		selected = box.id;
		possible_moves.forEach((pos) => {
			board[pos.x][pos.y].color = board[pos.x][pos.y].original;
		});
		possible_moves = [];
		if (moved || !box.piece) {
			return;
		}
		// Calculate possible moves of pieces or move piece to highlighted spot
		if ((box.piece.team_white && !turn_white) || (!box.piece.team_white && turn_white)) {
			return;
		}
		switch (box.piece) {
			case white_pawn:
			case black_pawn:
				push_pawn_moves(box as Square & { piece: Piece });
				break;
			case black_rook:
			case white_rook:
				push_rows_and_columns(box);
				break;
			case black_bishop:
			case white_bishop:
				push_diags(box);
				break;
			case black_queen:
			case white_queen:
				push_diags(box);
				push_rows_and_columns(box);
				break;
			case black_king:
			case white_king:
				push_possible_moves_in_set(box as Square & { piece: Piece }, all_directions);
				break;
			case black_knight:
			case white_knight:
				push_possible_moves_in_set(box as Square & { piece: Piece }, knight_jump);
				break;
			default:
				break;
		}
		possible_moves.forEach((pos) => {
			board[pos.x][pos.y].color = 'highlight';
		});
	}
</script>

<h1 style="text-align: center;">Chess</h1>
<div class="flex-board">
	{#each board as column}
		<div class="flex-column">
			{#each column as box (box.id)}
				<button class="square {box.color}" on:click={() => register_square_click(box)}>
					{#if box.piece != null}
						<img src={box.piece.sprite} alt="" />
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>
<p style="text-align: center;">
	<a href="/">Back</a>
</p>

<style>
	.flex-board {
		display: flex;
		flex-flow: row;
		justify-content: center;
	}
	.flex-column {
		display: flex;
		flex-flow: column;
		flex: 0 0 10px;
	}
	.square {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: gray;
		width: 50px;
		height: 50px;
		flex: 0 0 50px;
	}
	.square:hover {
		cursor: pointer;
		background-color: antiquewhite;
	}
	.highlight {
		background-color: bisque;
	}
	.black {
		background-color: #5c4033;
	}
	.white {
		background-color: #c4a484;
	}
</style>
