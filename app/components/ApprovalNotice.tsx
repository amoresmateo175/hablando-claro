
"use client";

import { useEffect, useState } from "react";
import { useApprovalStatus } from "@/lib/useApprovalStatus";

type Props = {
  userId: string;
};

export default function ApprovalNotice({ userId }: Props) {
  const { canInteract, approvalLoaded } = useApprovalStatus(userId);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!approvalLoaded || !canInteract) return;

    const storageKey = `approval-popup-seen-${userId}`;
    const alreadySeen = localStorage.getItem(storageKey);

    if (!alreadySeen) {
      localStorage.setItem(storageKey, "true");
      setShowPopup(true);
    }
  }, [approvalLoaded, canInteract, userId]);

  if (!approvalLoaded || !canInteract || !showPopup) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-7 w-7 text-green-700"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 12 4 4L19 6"
            />
          </svg>
        </div>

        <h2
          id="approval-title"
          className="text-center text-xl font-bold text-gray-900"
        >
          Your account has been approved!
        </h2>

        <p className="mt-3 text-center text-sm leading-6 text-gray-600">
          You can now publish posts and comments on Hablando Claro.
        </p>

        <button
          type="button"
          onClick={() => setShowPopup(false)}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
