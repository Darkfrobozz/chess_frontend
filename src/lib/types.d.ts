export type Position = {
	x: number;
	y: number;
};

export type PieceNames = 'Pawn' | 'Queen' | 'Bishop' | 'King' | 'Knight' | 'Rook';

export type Piece = {
	name: PieceNames;
	team_white: boolean;
	// This is almost random, so don't use
	sprite: string;
};

export type Square = {
	original: string;
	color: string;
	piece: Piece | null;
	id: Position;
};
