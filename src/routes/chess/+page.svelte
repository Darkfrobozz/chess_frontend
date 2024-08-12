<script lang="ts">
	import type { Square, Piece, Position } from '$lib/types';
	import { board_store } from '$lib/stores/chess_stores';
	import { all_directions, generate_moves, knight_jump } from '$lib/scripts/chess_moves';

	let selected: Position;
	let turn_white = true;
	let board: Square[][];
	let possible_moves: Position[] = [];
	$: board = $board_store;

	function register_square_click(box: Square): void {
		// Check if the click amounts to a move
		let moved = false;
		if (possible_moves.some((pos) => box.id.x == pos.x && box.id.y == pos.y)) {
			board[box.id.x][box.id.y].piece = board[selected.x][selected.y].piece;
			board[selected.x][selected.y].piece = null;
			moved = true;
			turn_white = !turn_white;
		}

		// Reseting to make sure that highlighting stops.
		selected = box.id;
		possible_moves.forEach((pos) => {
			board[pos.x][pos.y].color = board[pos.x][pos.y].original;
		});
		possible_moves = [];
		if (moved || !box.piece) {
			return;
		}

		// Calculate possible moves of pieces or move piece to highlighted spot
		// Also makes sure the piece is the right color to make a move
		if ((box.piece.team_white && !turn_white) || (!box.piece.team_white && turn_white)) {
			return;
		}
		possible_moves = generate_moves(box);

		// Highlighting
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
