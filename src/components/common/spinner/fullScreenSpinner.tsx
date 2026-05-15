'use client'

import Spinner from ".";

export default function FullscreenSpinner() {

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 pointer-events-auto">
      <Spinner/>
    </div>
  );
}
