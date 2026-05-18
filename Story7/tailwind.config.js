/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('tailwindcss').Config} */
const path = require("node:path");

module.exports = {
  content: [
    path.join(__dirname, "./app/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "./components/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "./lib/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "./pages/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "./src/**/*.{js,ts,jsx,tsx,mdx}")
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

