import { api_backend } from '$lib/settings';
import type { Piece, Position, Square } from '$lib/types';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { board_store } from '$lib/stores/chess_stores';
import axios from 'axios';
import { pieces } from '$lib/static/sprites';

async function send(board: Array<Array<Square>>) {
	const content: AxiosRequestConfig = {
		method: 'POST',
		url: api_backend,
		data: JSON.stringify(board)
	};
}

export function isValidBoard(obj: any): obj is number[][] {
	return isNumberArray(obj) && obj.length == 8 && obj.every((innerArray) => innerArray.length == 8);
}

function isNumberArray(obj: any): obj is number[][] {
	return (
		Array.isArray(obj) &&
		obj.every(
			(innerArray) =>
				Array.isArray(innerArray) && innerArray.every((item) => typeof item === 'number')
		)
	);
}

let column = 0;
const board: Square[][] = Array.from({ length: 8 }, () => {
	let row = 0;
	column++;
	return Array.from({ length: 8 }, () => {
		let color = (row + column - 1) % 2 === 0 ? 'white' : 'black';
		row++;
		return { original: color, color, piece: null, id: { x: column - 1, y: row - 1 } };
	});
});

export function json_representation_to_proper(json: string): Square[][] {
	const basic_board_rep = JSON.parse(json);
	const new_board = structuredClone(board);
	isValidBoard(basic_board_rep);
	for (let column = 0; column < 8; column++) {
		const basic_board_column = basic_board_rep[column];
		const blueprint_board_column = new_board[column];
		for (let row = 0; row < 8; row++) {
			const number = basic_board_column[row];
			switch (number) {
				case 1:
					blueprint_board_column[row].piece = pieces.white.pawn;
					break;
				case -1:
					blueprint_board_column[row].piece = pieces.black.pawn;
					break;
				case 3:
					blueprint_board_column[row].piece = pieces.white.bishop;
					break;
				case -3:
					blueprint_board_column[row].piece = pieces.black.bishop;
					break;
				case 4:
					blueprint_board_column[row].piece = pieces.white.knight;
					break;
				case -4:
					blueprint_board_column[row].piece = pieces.black.knight;
					break;
				case 5:
					blueprint_board_column[row].piece = pieces.white.rook;
					break;
				case -5:
					blueprint_board_column[row].piece = pieces.black.rook;
					break;
				case 8:
					blueprint_board_column[row].piece = pieces.white.queen;
					break;
				case -8:
					blueprint_board_column[row].piece = pieces.black.queen;
					break;
				case 10:
					blueprint_board_column[row].piece = pieces.white.king;
					break;
				case -10:
					blueprint_board_column[row].piece = pieces.black.king;
					break;

				default:
					break;
			}
		}
	}
	return new_board;
}

const start_char_value = 'a'.charCodeAt(0);
export function encrypt_indice(indice: Position): string {
	const result_char = String.fromCharCode(start_char_value + indice.x);
	return result_char + (7 - indice.y + 1);
}

export function decrypt_indice(indice: string): Position {
	return {
		x: indice.charCodeAt(0) - start_char_value,
		y: 7 - Number.parseInt(indice.slice(1)) + 1
	};
}
