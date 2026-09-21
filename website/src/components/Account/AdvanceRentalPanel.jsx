'use client';

import { ArrowLeft, Percent } from 'lucide-react';

export default function AdvanceRentalPanel({ onBack }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 p-4">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={16} />
        </button>
        <p className="text-base font-semibold text-gray-900">Advance Rental</p>
        <p className="mt-1 text-xs text-gray-500">
          Save on Rent. Try the below options to save more on your rent by
          paying your rent in advance.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
          <Percent className="h-9 w-9 text-orange-500" />
        </div>
        <p className="text-base font-semibold text-gray-900">No options yet!</p>
        <p className="text-sm text-gray-500">
          Oops! Looks like there are no options available for you at this
          moment.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
