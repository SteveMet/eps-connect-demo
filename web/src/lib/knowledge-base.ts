import fs from "fs";
import path from "path";

function loadFile(filename: string): string {
  const filePath = path.resolve(process.cwd(), "..", filename);
  return fs.readFileSync(filePath, "utf-8");
}

function stripYamlFrontmatter(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n/);
  if (match) {
    return content.slice(match[0].length).trim();
  }
  return content;
}

export function loadFactoryProfile(): string {
  return loadFile("factory-profile.md");
}

export function loadMarketPricingDatabase(): string {
  return loadFile("market-pricing-database.md");
}

export function loadPrintEstimatorPrompt(): string {
  const filePath = path.resolve(
    process.cwd(),
    "..",
    ".claude",
    "agents",
    "print-estimator.md"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  return stripYamlFrontmatter(content);
}

export function loadCompetitivePricerPrompt(): string {
  const filePath = path.resolve(
    process.cwd(),
    "..",
    ".claude",
    "agents",
    "competitive-pricer.md"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  return stripYamlFrontmatter(content);
}
