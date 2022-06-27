import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Joyride from "react-joyride";
import bitcoinSvg from "./assets/bitcoin.svg";
import checkGuessService from "./services/checkGuessService";
import loadPlayerService from "./services/loadPlayerService";

interface GameState {
  playerId: string;
  score: number;
  btcPrice: number;
  lastTimeStamp: number;
}

const PLAYER_ID_KEY = "will-it-crash-PLAYER_ID";
const SCORE_KEY = "will-it-crash-SCORE";
const ONE_MINUTE_IN_SECONDS = 60;
const ONE_SECOND_IN_MILLISECONDS = 1000;
const ONE_MINUTE_IN_MILLISECONDS = ONE_MINUTE_IN_SECONDS * 1000;
const onboardingSteps = [
  {
    target: "#guessYesButton",
    content:
      "Click here if you think the Bitcoin price will crash in the next minute",
  },
  {
    target: "#guessNoButton",
    content: "Or else, click here if you think the Bitcoin price will rise!",
  },
  {
    target: "#guessAvailability",
    content:
      "Your guess will be evaluated in one minute, meanwhile, new guesses will be ignored",
  },
  {
    target: "#score",
    content:
      "For every correct guess your score is increased by one and decreased by one otherwise",
  },
  {
    target: "#title",
    content: "Will Bitcoin price crash? 🤔 Have fun!",
  },
];

function notifyPlayerGuessAnswer(guessedCorrectly: boolean) {
  if (guessedCorrectly) {
    toast.success(`Congrats! You've guessed correctly!`, {
      position: "top-center",
      icon: "🎉",
    });
  } else {
    toast.error(`Oh no! Your guess was wrong!`, {
      position: "top-center",
      icon: "😢",
    });
  }
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

function App() {
  const persistedPlayerId = localStorage.getItem(PLAYER_ID_KEY);
  const persistedScore = localStorage.getItem(SCORE_KEY);

  const [gameState, setGameState] = useState<GameState>({
    playerId: persistedPlayerId || "",
    score: Number(persistedScore) || 0,
    btcPrice: 0,
    lastTimeStamp: 0,
  });
  const [timeUntilNewGuess, setTimeUntilNewGuess] = useState(0);
  const [guessInProcess, setGuessInProcess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialState() {
      try {
        const loadPlayerData = await loadPlayerService();

        if (isMounted) {
          localStorage.setItem(PLAYER_ID_KEY, loadPlayerData.playerId);
          setGameState({
            ...gameState,
            btcPrice: loadPlayerData.btcPrice,
            playerId: loadPlayerData.playerId,
            lastTimeStamp: loadPlayerData.timestamp,
          });
        }
      } catch {
        toast.error(
          `An error ocurred, try waiting a few seconds and refreshing the page`,
          {
            position: "top-center",
            icon: "🚨",
          }
        );
      }
    }
    loadInitialState();

    return () => {
      isMounted = false;
    };
  }, []);

  function tabFocusHandler() {
    if (!guessInProcess) {
      setTimeUntilNewGuess(0);
    }
  }

  useEffect(() => {
    let isMounted = true;

    if (guessInProcess) {
      setTimeout(() => {
        if (isMounted && timeUntilNewGuess > 0) {
          setTimeUntilNewGuess(timeUntilNewGuess - 1);
        }
      }, ONE_SECOND_IN_MILLISECONDS);
    }

    window.addEventListener("focus", tabFocusHandler);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", tabFocusHandler);
    };
  }, [guessInProcess, timeUntilNewGuess]);

  async function callCheckGuessService(guess: "yes" | "no") {
    const { playerId, btcPrice, lastTimeStamp } = gameState;

    try {
      const { currentBtcPrice, guessedCorrectly, newScore, newTimestamp } =
        await checkGuessService({
          playerId,
          guess,
          btcPrice,
          lastGuessTimestamp: lastTimeStamp,
        });

      notifyPlayerGuessAnswer(guessedCorrectly);

      localStorage.setItem(SCORE_KEY, newScore.toString());
      setGameState({
        ...gameState,
        score: newScore,
        btcPrice: currentBtcPrice,
        lastTimeStamp: newTimestamp,
      });
    } catch {
      toast.error(
        `An error ocurred, try waiting a few seconds and refreshing the page`,
        {
          position: "top-center",
          icon: "🚨",
        }
      );
    }

    setGuessInProcess(false);
    setTimeUntilNewGuess(0);
  }

  function handleGuessClick(guess: "yes" | "no") {
    if (guessInProcess) {
      toast.error(
        `Guess in progress, you'll be able to guess again in ${timeUntilNewGuess} seconds`,
        {
          position: "top-center",
          icon: "🚨",
        }
      );
      return;
    }

    setGuessInProcess(true);
    setTimeUntilNewGuess(ONE_MINUTE_IN_SECONDS);
    setTimeout(() => callCheckGuessService(guess), ONE_MINUTE_IN_MILLISECONDS);
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-24">
      <Joyride steps={onboardingSteps} continuous debug />
      <h1 id="title" className="text-5xl font-bold mb-6 text-center">
        Will it crash?!
      </h1>
      <div className="w-full max-w-screen-md px-3 flex flex-col md:flex-row justify-between items-center gap-2 text-xl mb-auto">
        <span id="guessAvailability">
          New guess available in: {timeUntilNewGuess}s
        </span>
        <span id="score">
          <span className="font-bold">Score</span>: {gameState.score}
        </span>
      </div>
      <div className="flex justify-center items-center gap-4 mb-32">
        <img src={bitcoinSvg} alt="Bitcoin Logo" />
        {gameState.btcPrice ? (
          <span className="text-4xl font-bold text-[#F9AA4B]">
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(gameState.btcPrice)}
          </span>
        ) : (
          <LoadingSpinner />
        )}
      </div>
      <div className="w-full max-w-screen-md px-3 flex flex-col md:flex-row justify-between items-center gap-2 mb-auto">
        <button
          id="guessYesButton"
          className="text-xl px-24 py-3 rounded-lg bg-red-600 hover:bg-red-400 disabled:brightness-50 disabled:cursor-not-allowed"
          onClick={() => handleGuessClick("yes")}
          disabled={guessInProcess}
        >
          YES! 😈
        </button>
        <button
          id="guessNoButton"
          className="text-xl px-24 py-3 rounded-lg bg-green-600 hover:bg-green-400 disabled:brightness-50 disabled:cursor-not-allowed"
          onClick={() => handleGuessClick("no")}
          disabled={guessInProcess}
        >
          NO! 🥺
        </button>
      </div>
      <div className="w-full p-3 flex justify-center items-center mt-auto">
        <span>
          Developed with ❤️ by{" "}
          <a href="https://github.com/mdnm">Mateus De Nardo</a>
        </span>
      </div>
    </div>
  );
}

export default App;
