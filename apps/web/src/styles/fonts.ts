import localFont from "next/font/local";

const cafe24ProSlimAir = localFont({
  src: "../fonts/Cafe24PROSlimAir.woff2",
  variable: "--font-heading-air",
  display: "swap",
});

const cafe24ProSlimFit = localFont({
  src: "../fonts/Cafe24PROSlimFit.woff2",
  variable: "--font-heading-loaded",
  display: "swap",
});

const cafe24ProSlimMax = localFont({
  src: "../fonts/Cafe24PROSlimMax.woff2",
  variable: "--font-heading-max",
  display: "swap",
});

const wantedSans = localFont({
  src: "../fonts/WantedSansVariable.woff2",
  variable: "--font-body-loaded",
  display: "swap",
});

const kyoboHandwriting = localFont({
  src: "../fonts/KyoboHandwriting2025lyb.otf",
  variable: "--font-caption-loaded",
  display: "swap",
});

export const fontVariables = `${cafe24ProSlimAir.variable} ${cafe24ProSlimFit.variable} ${cafe24ProSlimMax.variable} ${wantedSans.variable} ${kyoboHandwriting.variable}`;
