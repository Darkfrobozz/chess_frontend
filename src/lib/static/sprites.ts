import type { Piece, PieceNames } from '$lib/types';
import objectHash from 'object-hash';

import black_knight_sprite from '$lib/static/black/knight.png';
import black_bishop_sprite from '$lib/static/black/bishop.png';
import black_king_sprite from '$lib/static/black/king.png';
import black_pawn_sprite from '$lib/static/black/pawn.png';
import black_queen_sprite from '$lib/static/black/queen.png';
import black_rook_sprite from '$lib/static/black/rook.png';

import white_knight_sprite from '$lib/static/white/knight.png';
import white_bishop_sprite from '$lib/static/white/bishop.png';
import white_king_sprite from '$lib/static/white/king.png';
import white_pawn_sprite from '$lib/static/white/pawn.png';
import white_queen_sprite from '$lib/static/white/queen.png';
import white_rook_sprite from '$lib/static/white/rook.png';

function create_black_piece(sprite: string, name: PieceNames): Piece {
	return {
		name,
		team_white: false,
		sprite
	};
}
function create_white_piece(sprite: string, name: PieceNames): Piece {
	return {
		name,
		team_white: true,
		sprite
	};
}

const whitePieces = {
	knight: create_white_piece(white_knight_sprite, 'Knight'),
	bishop: create_white_piece(white_bishop_sprite, 'Bishop'),
	king: create_white_piece(white_king_sprite, 'King'),
	queen: create_white_piece(white_queen_sprite, 'Queen'),
	pawn: create_white_piece(white_pawn_sprite, 'Pawn'),
	rook: create_white_piece(white_rook_sprite, 'Rook')
};

const blackPieces = {
	knight: create_black_piece(black_knight_sprite, 'Knight'),
	bishop: create_black_piece(black_bishop_sprite, 'Bishop'),
	king: create_black_piece(black_king_sprite, 'King'),
	queen: create_black_piece(black_queen_sprite, 'Queen'),
	pawn: create_black_piece(black_pawn_sprite, 'Pawn'),
	rook: create_black_piece(black_rook_sprite, 'Rook')
};

export const pieces = {
	white: whitePieces,
	black: blackPieces
};

const whitePieceHashes = {
	knight: objectHash(JSON.stringify(pieces.white.knight)),
	bishop: objectHash(JSON.stringify(pieces.white.bishop)),
	king: objectHash(JSON.stringify(pieces.white.king)),
	queen: objectHash(JSON.stringify(pieces.white.queen)),
	pawn: objectHash(JSON.stringify(pieces.white.pawn)),
	rook: objectHash(JSON.stringify(pieces.white.rook))
};
const blackPieceHashes = {
	knight: objectHash(JSON.stringify(pieces.black.knight)),
	bishop: objectHash(JSON.stringify(pieces.black.bishop)),
	king: objectHash(JSON.stringify(pieces.black.king)),
	queen: objectHash(JSON.stringify(pieces.black.queen)),
	pawn: objectHash(JSON.stringify(pieces.black.pawn)),
	rook: objectHash(JSON.stringify(pieces.black.rook))
};

export const pieceHashes = {
	white: whitePieceHashes,
	black: blackPieceHashes
};
