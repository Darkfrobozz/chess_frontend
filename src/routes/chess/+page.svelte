<script lang="ts">
	import type { Square, Piece, Position } from '$lib/types';
	import { board_store, stats_store } from '$lib/stores/chess_stores';
	import { all_directions, generate_moves, knight_jump } from '$lib/scripts/chess_moves';
	import { pieceHashes } from '$lib/static/sprites';
	import objectHash from 'object-hash';
	import Footer from '../../components/Footer.svelte';

	let selected: Position;
	let turn_white = true;
	let board: Square[][];
	let possible_moves: Position[] = [];
	let Stats;
	var regex = /\/([^\/]+)\.png/;
	$: Stats = $stats_store;
	$: board = $board_store;
	$: previous_move = get_name(Stats.last_moved);

	function get_name(path_to_name: string | null): string {
		if (path_to_name) {
			const match = path_to_name.match(regex);
			if (match) {
				return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
			}
		}
		return '';
	}

	function register_square_click(box: Square): void {
		// Check if the click amounts to a move
		let moved = false;
		if (possible_moves.some((pos) => box.id.x == pos.x && box.id.y == pos.y)) {
			let piece_to_move = board[selected.x][selected.y].piece;
			// Updating move statitics
			stats_store.update((statics) => {
				switch (objectHash(JSON.stringify(piece_to_move))) {
					case pieceHashes.black.king:
						statics.move_tracker.black_king = true;
						break;
					case pieceHashes.white.king:
						statics.move_tracker.white_king = true;
						break;
					case pieceHashes.white.rook:
						console.log(`${selected.x} is x and ${selected.y} is y`);
						if (selected.x == 7 && selected.y == 7) {
							statics.move_tracker.white_rook_h1 = true;
						} else {
							statics.move_tracker.white_rook_a1 = true;
						}
						break;

					case pieceHashes.black.rook:
						if (selected.x == 0 && selected.y == 0) {
							statics.move_tracker.black_rook_a8 = true;
						} else {
							statics.move_tracker.black_rook_h8 = true;
						}
						break;
					default:
						break;
				}
				statics.moves += 1;
				if (piece_to_move) {
					statics.last_moved = piece_to_move.sprite;
				}
				return statics;
			});
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
<div class="flex_with_statitics">
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
	<div>
		<ul>
			<li>a8 rook moved: {Stats.move_tracker.black_rook_a8}</li>
			<li>h8 rook moved: {Stats.move_tracker.black_rook_h8}</li>
			<li>h1 rook moved: {Stats.move_tracker.white_rook_h1}</li>
			<li>a1 rook moved: {Stats.move_tracker.white_rook_a1}</li>
			<li>White king moved: {Stats.move_tracker.white_king}</li>
			<li>Black king moved: {Stats.move_tracker.black_king}</li>
			<li>Number of moves: {Stats.moves}</li>
			<li>Previously moved: {previous_move}</li>
		</ul>
	</div>
</div>
<p style="text-align: center;">
	<a href="/">Back</a>
</p>
<Footer />

<style>
	.flex_with_statitics {
		display: flex;
		flex-flow: row;
		justify-content: space-evenly;
	}
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
