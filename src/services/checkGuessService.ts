import axios from "axios";

interface CheckGuessServiceResponse {
  guessedCorrectly: boolean;
  newScore: number;
  currentBtcPrice: number;
  newTimestamp: number;
}

interface CheckGuessServiceBody {
  playerId: string;
  guess: "yes" | "no";
  btcPrice: number;
  lastGuessTimestamp: number;
}

export default async function checkGuessService(
  body: CheckGuessServiceBody
): Promise<CheckGuessServiceResponse> {
  const { data } = await axios.post<CheckGuessServiceResponse>(
    `${import.meta.env.VITE_API_ENDPOINT}guess/`,
    body
  );

  return data;
}
