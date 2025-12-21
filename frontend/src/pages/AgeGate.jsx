import { useState } from "react";

export default function AgeGate({ onConfirm }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-red-500">
            <span className="text-2xl font-bold">18+</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-2">
            Adults Only (18+)
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Omevia is strictly for users aged 18 or above.
            <br />
            Misrepresentation of age may result in permanent restriction.
          </p>
        </div>

        {/* Checkbox */}
        <div className="px-8">
          <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300 cursor-pointer hover:border-zinc-700 transition">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="mt-1 h-4 w-4 accent-red-500"
            />
            <span>I confirm that I am 18 years or older</span>
          </label>
        </div>

        {/* Button */}
        <div className="px-8 pt-6 pb-8">
          <button
            disabled={!checked}
            onClick={onConfirm}
            className={`w-full h-12 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
              ${
                checked
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }
            `}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
