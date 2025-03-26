export interface Clan {
  id: string;
  name: string;
  tag: string;
  members: string[];
  points: number;
  battles: Battle[];
  owner: string;
  statistics: ClanStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export interface Battle {
  id: string;
  participants: string[];
  result: 'win' | 'loss';
  date: Date;
}

export interface ClanStatistics {
  totalTerritorySize: number;
  nukesLaunched: number;
  goldGenerated: number;
  citiesBuilt: number;
  defendPosts: number;
  buildings: number;
}
