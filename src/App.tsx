import bitcoinSvg from "./assets/bitcoin.svg";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center pt-24">
      <h1 className="text-5xl font-bold mb-6 text-center">Will it crash?!</h1>
      <div className="w-full max-w-screen-md px-3 flex flex-col md:flex-row justify-between items-center gap-2 text-xl mb-auto">
        <span>Time since last update: 0s</span>
        <span>
          <span className="font-bold">Score</span>: 0
        </span>
      </div>
      <div className="flex justify-center items-center gap-4 mb-32">
        <img src={bitcoinSvg} alt="Bitcoin Logo" />
        <span className="text-4xl font-bold text-[#F9AA4B]">$ 21,400.00</span>
      </div>
      <div className="w-full max-w-screen-md px-3 flex flex-col md:flex-row justify-between items-center gap-2 mb-auto">
        <button className="text-xl px-24 py-3 rounded-lg bg-red-500">
          YES! 😈
        </button>
        <button className="text-xl px-24 py-3 rounded-lg bg-green-500">
          NO! 🥺
        </button>
      </div>
    </div>
  );
}

export default App;
