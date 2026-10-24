import React, { useState } from "react";

export function BlissBackground() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0055ea]">
      {!imgError ? (
        <picture>
          <source srcSet="/assets/winxp/bliss.webp" type="image/webp" />
          <img
            src="/assets/winxp/bliss.jpg"
            alt="Windows XP Bliss Wallpaper"
            className="w-full h-full object-cover object-center select-none"
            onError={() => setImgError(true)}
            draggable={false}
          />
        </picture>
      ) : (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "linear-gradient(180deg, #1f6bcf 0%, #3f8cf3 40%, #7db833 75%, #468615 100%)" }}
        />
      )}
    </div>
  );
}
