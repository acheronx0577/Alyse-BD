"use client";

import { useEffect, useState } from "react";
import TextLoop from "./TextLoop";

function useCurtainSize() {
  const [size, setSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 760px)");
    const tablet = window.matchMedia("(max-width: 1199px)");

    const sync = () => {
      if (mobile.matches) setSize("mobile");
      else if (tablet.matches) setSize("tablet");
      else setSize("desktop");
    };

    sync();
    mobile.addEventListener("change", sync);
    tablet.addEventListener("change", sync);
    return () => {
      mobile.removeEventListener("change", sync);
      tablet.removeEventListener("change", sync);
    };
  }, []);

  return size;
}

export function SiteCurtain() {
  const size = useCurtainSize();

  const fontSize = size === "mobile" ? 24 : size === "tablet" ? 31 : 36;
  const ribbonWidth = size === "mobile" ? 54 : size === "tablet" ? 63 : 70;
  const curviness = size === "mobile" ? 42 : size === "tablet" ? 52 : 60;
  const speed = size === "mobile" ? 75 : 90;

  return (
    <div className="site-curtain">
      <TextLoop
        className="site-curtain-loop"
        text="Happy Birthday Alyse — Memories & Smiles — Party Cat Approved"
        shape="wave"
        curviness={curviness}
        speed={speed}
        direction="forward"
        separator="♡"
        fontSize={fontSize}
        fontWeight={800}
        letterSpacing={1.5}
        uppercase={false}
        color="#fffdf9"
        ribbon
        ribbonColor="#ff748c"
        ribbonWidth={ribbonWidth}
        pauseOnHover
      />
    </div>
  );
}
