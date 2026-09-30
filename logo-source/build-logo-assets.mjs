// Builds every logo asset in public/ from the two master SVGs in logo-source/.
// Run from the project root:  node logo-source/build-logo-assets.mjs
import fs from "node:fs"
import sharp from "sharp"

const LOCKUP = fs.readFileSync("logo-source/logo-master.svg", "utf8")
const SYMBOL = fs.readFileSync("logo-source/logo-symbol-master.svg", "utf8")
const GREEN = "#284e38"
const LIGHT_GREEN = "#7ab595" // tab icon for dark browser themes
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }

// Clean copies of the vectors for the site
fs.writeFileSync("public/logo.svg", LOCKUP)
fs.writeFileSync("public/logo-symbol.svg", SYMBOL)
fs.writeFileSync("public/icon.svg", SYMBOL)

const raster = (svg, width) => sharp(Buffer.from(svg), { density: 600 }).resize({ width }).png().toBuffer()

// PNG fallbacks
fs.writeFileSync("public/logo.png", await raster(LOCKUP, 1200))
fs.writeFileSync("public/logo-symbol.png", await raster(SYMBOL, 512))

// Symbol centred on a square canvas
async function square(svg, size, background, padFraction) {
  const inner = Math.round(size * (1 - 2 * padFraction))
  const symbol = await sharp(Buffer.from(svg), { density: 600 })
    .resize({ width: inner, height: inner, fit: "inside" })
    .png()
    .toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: symbol, gravity: "center" }])
    .png()
}

await (await square(SYMBOL, 32, CLEAR, 0.04)).toFile("public/icon-light-32x32.png")
await (await square(SYMBOL.replaceAll(GREEN, LIGHT_GREEN), 32, CLEAR, 0.04)).toFile("public/icon-dark-32x32.png")
await (await square(SYMBOL, 180, WHITE, 0.2)).flatten({ background: WHITE }).removeAlpha().toFile("public/apple-icon.png")
// favicon.ico: PNG-compressed 16, 32 and 48px images
const icoSizes = [16, 32, 48]
const icoImages = await Promise.all(icoSizes.map(async (n) => (await (await square(SYMBOL, n, CLEAR, 0.04)).toBuffer())))
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(icoSizes.length, 4)
let offset = 6 + 16 * icoSizes.length
const icoEntries = icoImages.map((img, i) => {
  const entry = Buffer.alloc(16)
  entry.writeUInt8(icoSizes[i], 0)
  entry.writeUInt8(icoSizes[i], 1)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(img.length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += img.length
  return entry
})
fs.writeFileSync("public/favicon.ico", Buffer.concat([icoHeader, ...icoEntries, ...icoImages]))

// Social share image: lockup centred on white
const lockupForOg = await raster(LOCKUP, 900)
await sharp({ create: { width: 1200, height: 630, channels: 3, background: WHITE } })
  .composite([{ input: lockupForOg, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile("public/og-image.png")

console.log("logo assets written to public/")
