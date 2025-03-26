import React, { useEffect, useState } from 'react';
import { Clan } from '../models/Clan';

const ClanBoard: React.FC = () => {
  const [clans, setClans] = useState<Clan[]>([]);

  useEffect(() => {
    // Fetch clans from the backend
    fetch('/api/clans')
      .then(response => response.json())
      .then(data => setClans(data));
  }, []);

  const topClans = clans.slice(0, 3);

  return (
    <div>
      <h1>Top 3 Clans</h1>
      <ul>
        {topClans.map(clan => (
          <li key={clan.id}>
            {clan.name} - {clan.points} points
            <button onClick={() => showModal(clan)}>Details</button>
          </li>
        ))}
      </ul>
      <h1>Clan Rankings</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Win/Loss Rate</th>
          </tr>
        </thead>
        <tbody>
          {clans.map((clan, index) => (
            <tr key={clan.id}>
              <td>{index + 1}</td>
              <td>{clan.name}</td>
              <td>{(clan.battles.filter(battle => battle.result === 'win').length / clan.battles.length).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const showModal = (clan: Clan) => {
  // Implement modal display logic here
};

export default ClanBoard;
