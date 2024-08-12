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

	import type { Square, Piece, Position } from '$lib/types';
	import { board_store, possible_moves_store } from '../../stores/chess_stores';
	import board_json from '$lib/start_chess_board.json';
	import objectHash from 'object-hash';

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

	const white_knight_hash = objectHash(JSON.stringify(white_knight));
	const white_bishop_hash = objectHash(JSON.stringify(white_bishop));
	const white_king_hash = objectHash(JSON.stringify(white_king));
	const white_queen_hash = objectHash(JSON.stringify(white_queen));
	const white_pawn_hash = objectHash(JSON.stringify(white_pawn));
	const white_rook_hash = objectHash(JSON.stringify(white_rook));

	const black_knight = create_black_piece(black_knight_sprite);
	const black_bishop = create_black_piece(black_bishop_sprite);
	const black_king = create_black_piece(black_king_sprite);
	const black_queen = create_black_piece(black_queen_sprite);
	const black_pawn = create_black_piece(black_pawn_sprite);
	const black_rook = create_black_piece(black_rook_sprite);

	const black_knight_hash = objectHash(JSON.stringify(black_knight));
	const black_bishop_hash = objectHash(JSON.stringify(black_bishop));
	const black_king_hash = objectHash(JSON.stringify(black_king));
	const black_queen_hash = objectHash(JSON.stringify(black_queen));
	const black_pawn_hash = objectHash(JSON.stringify(black_pawn));
	const black_rook_hash = objectHash(JSON.stringify(black_rook));

	let selected: Position;
	let turn_white = true;
	let board: Square[][];
	let possible_moves: Position[];
	$: board = $board_store;
	$: possible_moves = $possible_moves_store;

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
		console.log(box);
		console.log(box.piece);
		switch (objectHash(JSON.stringify(box.piece))) {
			case white_pawn_hash:
			case black_pawn_hash:
				console.log('Moving a pawn');
				push_pawn_moves(box as Square & { piece: Piece });
				break;
			case black_rook_hash:
			case white_rook_hash:
				push_rows_and_columns(box);
				break;
			case black_bishop_hash:
			case white_bishop_hash:
				push_diags(box);
				break;
			case black_queen_hash:
			case white_queen_hash:
				push_diags(box);
				push_rows_and_columns(box);
				break;
			case black_king_hash:
			case white_king_hash:
				push_possible_moves_in_set(box as Square & { piece: Piece }, all_directions);
				break;
			case black_knight_hash:
			case white_knight_hash:
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
