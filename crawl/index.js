import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
const a = [
  // "Pulsar",
  // "Pentadecathlon",
  // "Pinwheel",
  // "Clock",
  // "Fumarole",
  // "Wing",
  // "Pond",
  // "Quadpole",
  // "Octagon 2",
  // "Elevener",
  // "Cis-beacon up and long hook",
  // "Cis-beacon down and long hook",
  // "Loaf siamese barge",
  // "Ship tie eater head",
  // "Ship tie eater tail",
  // "Integral sign",
  // "Mold",
  // "Fleet",
  // "Merzenich's p11",
  // "Kok's galaxy",
  // "Pseudo-barberpole",
  // "Cyclic",
  // "Mechanical flip-flop",
  // "66P13",
  // "68P9",
  // "110P62",
  // "Bipole",
  // "Reverse fuse",
  // "Middleweight emulator",
  // "Heavyweight emulator",
  // "Figure eight on pentadecathlon",
  // "Chemist",
  // "Fire-spitting",
  // "Unix",
  // "Cis-fuse with two tails",
  // "Trans-fuse with two tails",
  // "Pseudo-barberpole on 44P7.2",
  // "Sawtooth 183",
  // "Jam",
  // "Superfountain",
  // "Tubstretcher 2",
  // "Octagon 4",
  // "Barge",
  // "Four eaters hassling two tubs",
  // "Fox",
  // "Glider",
  // "Block",
  // "Beehive",
  // "Loaf",
  // "Boat",
  // "Tub",
  // "Bi-block",
  // "Snake",
  // "Long snake",
  // "R-pentomino",
  // "B-heptomino",
  // "Cross",
  // "Pulsar quadrant",
  // "Queen bee shuttle",
  // "Lighthouse",
  // "Pseudo-barberpole",
  // "Baker's dozen",
  // "Beacon on beehive",
  // "Barge",
  // "Barge with long tail",
  // "Barge with very long tail",
  // "Block and glider",
  // "Bunnies",
  // "Reverse fuse",
  // "Figure-8 on R-pentomino",
  // "Bipole",
  // "Pentoad",
  // "Pond on dock",
  // "Toad on beacon",
  // "Century",
  // "Integral sign",
  // "Caterer on 14P2.1",
  // "Cis-mirrored worm",
  // "Trans-mirrored worm",
  // "Tub with tail",
  // "Toad with tail",
  // "Caterer on 10P2",
  // "60P5H2V0",
  // "Cyclic",
  "Lwss",
];

const data = a.map((n) => ({
  name: n,
  code: n.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
}));

const filePath = path.resolve(process.cwd(), "../src/patterns.ts");

console.log("assetsPath", filePath);
parallel(
  data,
  async ({ code, name }) => {
    const text = await fetch(
      `https://conwaylife.com/patterns/${code}.cells`
    ).then((res) => {
      if (res.status !== 200) {
        return;
      }
      return res.text();
    });

    if (text) {
      const rows = text.trim().split("\n");
      const patterns = rows.filter((row) => !row.startsWith("!"));
      const isOk = await new Promise((res) => {
        fs.appendFile(
          filePath,
          `export const P${code} = {
            name: "${name}",
            code: "${code}",
            pattern: \`\n${patterns.join("\n")}\n\`
          };\n`,
          {
            encoding: "utf-8",
          },
          (err) => {
            if (err) {
              res(false);
            } else {
              res(true);
            }
          }
        );
      });
      if (isOk) {
        console.log(`==============${name} success==================`);
      } else {
        console.log(`==============${name} fail==================`);
      }
    }
  },
  5
);

async function parallel(items, each, limit = 3) {
  const queue = Array.from({ length: Math.ceil(items.length / limit) }).map(
    (_, i) => i
  );

  const results = [];

  for (const index of queue) {
    const start = index * limit;
    const end = start + limit;
    const _items = items.slice(start, end);
    results.push(
      ...(await Promise.all(
        _items.map((item, i) => each(item, { index: i, realIndex: start + i }))
      ))
    );
  }
  return results;
}
