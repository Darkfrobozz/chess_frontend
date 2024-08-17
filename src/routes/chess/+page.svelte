<script lang="ts">
	import type { Square, Piece, Position } from '$lib/types';
	import { board_store, piece_store, stats_store, type Stats } from '$lib/stores/chess_stores';
	import { all_directions, generate_moves, knight_jump } from '$lib/scripts/chess_moves';
	import { pieceHashes, pieces } from '$lib/static/sprites';
	import objectHash from 'object-hash';
	import Footer from '../../components/Footer.svelte';
	import { get } from 'svelte/store';
	import { encrypt_indice } from '$lib/scripts/chess_utilities';

	// User selection logic
	let user_side = 'black-player';
	let user_white = false;
	let side_chosen = false;
	let against_computer = false;

	// initialization of chess logic
	let selected: Position;
	let turn_white = true;
	let board: Square[][];
	let possible_moves: Position[] = [];
	let Stats: Stats;
	var regex = /\/([^\/]+)\.png/;
	$: Stats = $stats_store;
	$: board = $board_store;
	$: previous_move = get_name(Stats.last_moved);
	let promotion_setting = 'queen';

	const at_pos = (pos: Position, board: Square[][]): Square => board[pos.x][pos.y];

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
		if (against_computer && ((!turn_white && user_white) || (turn_white && !user_white))) {
			return;
		}

		// Check if the click amounts to a move
		let moved = false;
		if (possible_moves.some((pos) => box.id.x == pos.x && box.id.y == pos.y)) {
			// Updating move statitics
			const piece_to_move = board[selected.x][selected.y].piece;
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
				statics.last_move = encrypt_indice(selected) + encrypt_indice(box.id);
				return statics;
			});
			// Special moving of castles, in case piece is a king and x difference is bigger than 1
			if (
				(objectHash(JSON.stringify(piece_to_move)) === pieceHashes.black.king ||
					objectHash(JSON.stringify(piece_to_move)) === pieceHashes.white.king) &&
				get(piece_store).length > 0
			) {
				let castle_movement_selected = get(piece_store).find(
					(x) => Math.abs(x.to.x - selected.x) == 1
				);
				if (castle_movement_selected) {
					console.log('Castle movement aquired: ', castle_movement_selected);
					board[castle_movement_selected.to.x][castle_movement_selected.to.y].piece = at_pos(
						castle_movement_selected.from,
						board
					).piece;
					board[castle_movement_selected.from.x][castle_movement_selected.from.y].piece = null;
				}
			}

			// Selected is FROM and box.id.x is TO

			// En passent
			if (
				((objectHash(JSON.stringify(piece_to_move)) === pieceHashes.white.pawn && box.id.y == 2) ||
					(objectHash(JSON.stringify(piece_to_move)) === pieceHashes.black.pawn &&
						box.id.y == 5)) &&
				get(piece_store).length > 0
			) {
				let to_remove = get(piece_store)[0].from;
				board[to_remove.x][to_remove.y].piece = null;
				piece_store.set([]);
			}

			// Promotion logic
			if (
				(objectHash(JSON.stringify(piece_to_move)) === pieceHashes.white.pawn && box.id.y == 0) ||
				(objectHash(JSON.stringify(piece_to_move)) === pieceHashes.black.pawn && box.id.y == 7)
			) {
				let white_piece = null;
				let black_piece = null;
				switch (promotion_setting) {
					case 'queen':
						white_piece = pieces.white.queen;
						black_piece = pieces.black.queen;
						break;
					case 'rook':
						white_piece = pieces.white.rook;
						black_piece = pieces.black.rook;
						break;
					case 'knight':
						white_piece = pieces.white.knight;
						black_piece = pieces.black.knight;
						break;
					case 'bishop':
						white_piece = pieces.white.bishop;
						black_piece = pieces.black.bishop;
						break;
					default:
						break;
				}
				if (piece_to_move!.team_white) {
					board[box.id.x][box.id.y].piece = white_piece;
				} else {
					board[box.id.x][box.id.y].piece = black_piece;
				}
			} else {
				board[box.id.x][box.id.y].piece = board[selected.x][selected.y].piece;
			}
			board[selected.x][selected.y].piece = null;
			moved = true;
			turn_white = !turn_white;
			piece_store.set([]);
			// Send move by converting TO and FROM to standardized chess notation.
			// Insert logic that waits for a response from server.
			let move_to_server = Stats.last_move + ';';
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

{#if !side_chosen}
	<div class="select-side">
		<button on:click={() => (against_computer = true)}>Against Computer</button>
		<button
			on:click={() => {
				side_chosen = true;
				user_side = 'black-player';
				user_white = false;
			}}>Black</button
		>
		<button
			on:click={() => {
				side_chosen = true;
				user_side = 'white-player';
				user_white = true;
			}}>White</button
		>
	</div>
{:else}
	<div class="flex_with_statitics">
		<div class="flex-board">
			{#each board as column}
				<div class="flex-column {user_side}">
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
				<li>Previous move: {Stats.last_move}</li>
			</ul>
		</div>
		<div class="promotion">
			<h1>Promotion Settings</h1>
			<button on:click={() => (promotion_setting = 'queen')}>Queen</button>
			<button on:click={() => (promotion_setting = 'knight')}>Knight</button>
			<button on:click={() => (promotion_setting = 'bishop')}>Bishop</button>
			<button on:click={() => (promotion_setting = 'rook')}>Rook</button>
			<p>{promotion_setting}</p>
		</div>
	</div>
{/if}
<p style="text-align: center;">
	<a href="/">Back</a>
</p>
<Footer />

<style>
	.select-side {
		display: flex;
		justify-content: center;
		gap: 20px;
	}
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
		flex: 0 0 10px;
	}
	.black-player {
		flex-flow: column-reverse;
	}
	.white-player {
		flex-flow: column;
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

	.promotion {
		text-align: center;
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
