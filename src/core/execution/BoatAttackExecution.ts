import PriorityQueue from "priority-queue-typescript";
import {Boat, Cell, Execution, MutableBoat, MutableGame, MutablePlayer, Player, PlayerID, TerraNullius, Tile, TileEvent} from "../Game";
import {manhattanDist} from "../Util";
import {AttackExecution} from "./AttackExecution";

export class BoatAttackExecution implements Execution {

    private lastMove: number

    // TODO: make this configurable
    private ticksPerMove = 1

    private active = true

    private mg: MutableGame
    private attacker: MutablePlayer
    private target: MutablePlayer | TerraNullius

    // TODO make private
    public path: Tile[]
    private src: Tile
    private dst: Tile

    private currTileIndex: number = 0

    private boat: MutableBoat

    private aStarPre: AStar
    private aStarComplete: AStar

    private finalPath = false

    constructor(
        private attackerID: PlayerID,
        private targetID: PlayerID | null,
        private cell: Cell,
        private troops: number,
    ) { }

    init(mg: MutableGame, ticks: number) {
        this.lastMove = ticks

        this.mg = mg
        this.attacker = mg.player(this.attackerID)
        if (this.targetID == null) {
            this.target = mg.terraNullius()
        } else {
            this.target = mg.player(this.targetID)
        }

        this.troops = Math.min(this.troops, this.attacker.troops())
        this.attacker.removeTroops(this.troops)

        this.src = this.closestShoreTileToTarget(this.attacker, this.cell)
        if (this.target.isPlayer()) {
            this.dst = this.closestShoreTileToTarget(this.target, this.cell)
        } else {
            this.dst = this.mg.tile(this.cell)
        }

        if (this.src == null || this.dst == null) {
            this.active = false
            return
        }
        this.aStarPre = new AStar(this.src, this.dst)
        this.aStarPre.compute(30)
        this.path = this.aStarPre.reconstructPath()
        if (this.path != null) {
            console.log(`got path ${this.path.map(t => t.cell().toString())}`)
            this.boat = this.attacker.addBoat(this.troops, this.src, this.target)
        } else {
            console.log('got null path')
            this.active = false
        }
        this.aStarComplete = new AStar(this.path[this.path.length - 1], this.dst)
    }

    tick(ticks: number) {
        if (!this.active) {
            return
        }
        if (ticks - this.lastMove < this.ticksPerMove) {
            return
        }
        this.lastMove = ticks

        if (!this.finalPath && this.aStarComplete.compute(30000)) {
            this.path.push(...this.aStarComplete.reconstructPath())
            this.finalPath = true
        }

        if (this.currTileIndex >= this.path.length) {
            if (!this.finalPath) {
                return
            }
            if (this.dst.owner() == this.attacker) {
                this.attacker.addTroops(this.troops)
                this.boat.delete()
                this.active = false
                return
            }
            this.attacker.conquer(this.dst)
            this.mg.addExecution(new AttackExecution(this.troops, this.attacker.id(), this.targetID, null))
            this.boat.delete()
            this.active = false
            return
        }

        const nextTile = this.path[this.currTileIndex]
        this.boat.move(nextTile)
        this.currTileIndex++
    }

    owner(): MutablePlayer {
        return this.attacker
    }

    isActive(): boolean {
        return this.active
    }

    private closestShoreTileToTarget(player: Player, target: Cell): Tile | null {
        const shoreTiles = Array.from(player.borderTiles()).filter(t => t.onShore() && t.neighbors().filter(n => n.isOcean()).length > 0)
        if (shoreTiles.length == 0) {
            return null
        }

        return shoreTiles.reduce((closest, current) => {
            const closestDistance = manhattanDist(target, closest.cell());
            const currentDistance = manhattanDist(target, current.cell());
            return currentDistance < closestDistance ? current : closest;
        });
    }
}

export class AStar {
    private openSet: PriorityQueue<{tile: Tile, fScore: number}>;
    private cameFrom: Map<Tile, Tile>;
    private gScore: Map<Tile, number>;
    private current: Tile | null;
    public completed: boolean;

    constructor(private src: Tile, private dst: Tile) {
        this.openSet = new PriorityQueue<{tile: Tile, fScore: number}>(
            500,
            (a, b) => a.fScore - b.fScore
        );
        this.cameFrom = new Map<Tile, Tile>();
        this.gScore = new Map<Tile, number>();
        this.current = null;
        this.completed = false;

        this.gScore.set(src, 0);
        this.openSet.add({tile: src, fScore: this.heuristic(src, dst)});
    }

    compute(iterations: number): boolean {
        if (this.completed) return true;

        while (!this.openSet.empty()) {
            iterations--
            this.current = this.openSet.poll()!.tile;
            if (iterations <= 0) {
                return false
            }

            if (this.current === this.dst) {
                this.completed = true;
                return true;
            }

            for (const neighbor of this.current.neighbors()) {
                if (neighbor != this.dst && neighbor.isLand()) continue; // Skip non-water tiles

                const tentativeGScore = this.gScore.get(this.current)! + 100 - neighbor.magnitude();

                if (!this.gScore.has(neighbor) || tentativeGScore < this.gScore.get(neighbor)!) {
                    this.cameFrom.set(neighbor, this.current);
                    this.gScore.set(neighbor, tentativeGScore);
                    const fScore = tentativeGScore + this.heuristic(neighbor, this.dst);

                    this.openSet.add({tile: neighbor, fScore: fScore});
                }
            }
        }

        return this.completed;
    }

    private heuristic(a: Tile, b: Tile): number {
        // Manhattan distance
        return Math.abs(a.cell().x - b.cell().x) + Math.abs(a.cell().y - b.cell().y);
    }

    public reconstructPath(): Tile[] {
        const path = [this.current!];
        while (this.cameFrom.has(this.current!)) {
            this.current = this.cameFrom.get(this.current!)!;
            path.unshift(this.current);
        }
        return path;
    }
}