import { Request, Response } from 'express';
import { Clan, ClanStatistics } from '../models/Clan';

let clans: Clan[] = [];

export const createClan = (req: Request, res: Response) => {
  const { name, tag, owner } = req.body;

  if (!name || !tag || !owner) {
    return res.status(400).send('Name, tag, and owner are required');
  }

  if (name.length > 20 || tag.length < 2 || tag.length > 5) {
    return res.status(400).send('Invalid name or tag length');
  }

  const newClan: Clan = {
    id: Date.now().toString(),
    name,
    tag,
    members: [owner],
    points: 0,
    battles: [],
    owner,
    statistics: {
      totalTerritorySize: 0,
      nukesLaunched: 0,
      goldGenerated: 0,
      citiesBuilt: 0,
      defendPosts: 0,
      buildings: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  clans.push(newClan);
  res.status(201).json(newClan);
};
