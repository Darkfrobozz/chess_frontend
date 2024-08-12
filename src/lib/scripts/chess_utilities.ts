import { api_backend } from '$lib/settings';
import type { Square } from '$lib/types';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { board_store } from '$lib/stores/chess_stores';
import axios from 'axios';

function load(json_board: string): Square[][] | null {
	const board = JSON.parse(json_board);
	if (isValidBoard(board)) {
		return board;
	}
	return null;
}

async function send(board: Array<Array<Square>>) {
	const content: AxiosRequestConfig = {
		method: 'POST',
		url: api_backend,
		data: JSON.stringify(board)
	};
}

export function isValidBoard(obj: any): obj is Square[][] {
	return isNumberArray(obj) && obj.length == 8 && obj.every((innerArray) => innerArray.length == 8);
}

function isNumberArray(obj: any): obj is Square[][] {
	return (
		Array.isArray(obj) &&
		obj.every(
			(innerArray) =>
				Array.isArray(innerArray) &&
				innerArray.every(
					(item) =>
						typeof item === 'object' &&
						item !== null &&
						typeof item.original === 'string' &&
						typeof item.color === 'string' &&
						typeof item.id === 'object' &&
						item.id !== null &&
						typeof item.id.x === 'number' &&
						typeof item.id.y === 'number' &&
						typeof item.piece === 'object' &&
						(item.piece === null ||
							(typeof item.piece.team_white === 'boolean' && typeof item.piece.piece === 'string'))
				)
		)
	);
}
