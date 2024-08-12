export type Position = {
	x: number;
	y: number;
};

export type Piece = {
	team_white: boolean;
	sprite: string;
};

export type Square = {
	original: string;
	color: string;
	piece: Piece | null;
	id: Position;
};
