import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

export default function HowItWorksLottieArt(props: { src: string; step: number }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& canvas": { maxWidth: "100%", maxHeight: "100%" },
      }}
    >
      <DotLottieReact
        src={props.src}
        loop={!reduceMotion}
        autoplay={!reduceMotion}
        style={{ width: 140, height: 140 }}
      />
    </Box>
  );
}
