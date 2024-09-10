import {Player, PlayerID, PlayerInfo, TerraNullius, Tile} from "../Game";
import {Colord, colord} from "colord";
import {devConfig} from "./DevConfig";
import {defaultConfig} from "./DefaultConfig";
import {GameID} from "../Schemas";

export enum GameEnv {
	Dev,
	Prod
}

export function getConfig(): Config {
	// TODO: 'prod' not found in prod env
	if (process.env.GAME_ENV == 'dev') {
		console.log('Using dev config')
		return devConfig
	} else {
		console.log('Using prod config')
		return defaultConfig
	}
}

export function getGameEnv(): GameEnv {
	return GameEnv.Prod
}

export interface Config {
	theme(): Theme;
	turnIntervalMs(): number
	gameCreationRate(): number
	lobbyLifetime(): number
	numBots(): number
	numFakeHumans(gameID: GameID): number
	numSpawnPhaseTurns(): number

	startTroops(playerInfo: PlayerInfo): number
	troopAdditionRate(player: Player): number
	attackTilesPerTick(attacker: Player, defender: Player | TerraNullius, numAdjacentTilesWithEnemy: number): number
	attackLogic(attacker: Player, defender: Player | TerraNullius, tileToConquer: Tile): {
		attackerTroopLoss: number,
		defenderTroopLoss: number,
		tilesPerTickUsed: number
	}
	attackAmount(attacker: Player, defender: Player | TerraNullius): number
	maxTroops(player: Player): number
	boatAttackAmount(attacker: Player, defender: Player | TerraNullius): number
	boatMaxDistance(): number
	boatMaxNumber(): number
}

export interface Theme {
	playerInfoColor(id: PlayerID): Colord;
	territoryColor(id: PlayerID): Colord;
	borderColor(id: PlayerID): Colord;
	terrainColor(tile: Tile): Colord;
	backgroundColor(): Colord;
	font(): string;
}

