# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

OLD CODE:
// let board = Array.from({ length: 8 }, () => {
// let row = 0;
// column++;
// return Array.from({ length: 8 }, () => {
// let piece = null;
// switch (row) {
// case 0:
// switch (column - 1) {
// case 1:
// case 6:
// piece = black_knight;
// break;
// case 2:
// case 5:
// piece = black_bishop;
// break;

    // 					case 3:
    // 						piece = black_queen;
    // 						break;
    // 					case 4:
    // 						piece = black_king;
    // 						break;
    // 					default:
    // 						piece = black_rook;
    // 						break;
    // 				}
    // 				break;
    // 			case 7:
    // 				switch (column - 1) {
    // 					case 1:
    // 					case 6:
    // 						piece = white_knight;
    // 						break;
    // 					case 2:
    // 					case 5:
    // 						piece = white_bishop;
    // 						break;

    // 					case 3:
    // 						piece = white_queen;
    // 						break;
    // 					case 4:
    // 						piece = white_king;
    // 						break;
    // 					default:
    // 						piece = white_rook;
    // 						break;
    // 				}
    // 				break;
    // 			case 6:
    // 				piece = white_pawn;
    // 				break;
    // 			case 1:
    // 				piece = black_pawn;
    // 				break;
    // 			default:
    // 				break;
    // 		}
    // 		let color = (row + column - 1) % 2 === 0 ? 'white' : 'black';
    // 		row++;
    // 		return { original: color, color, piece, id: { x: column - 1, y: row - 1 } };
    // 	});
    // });
