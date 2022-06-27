import axios from "axios";

interface LoadPlayerResponse {
  playerId: string;
  btcPrice: number;
  timestamp: number;
}

export default async function loadPlayerService(): Promise<LoadPlayerResponse> {
  const { data } = await axios.get<LoadPlayerResponse>(
    `${import.meta.env.VITE_API_ENDPOINT}load-player/`
  );

  return data;
}
