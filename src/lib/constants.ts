export const SITE_NAME = "news.txid.uk";
export const SITE_TITLE = "TXID News";
export const SITE_DESCRIPTION =
  "Bitcoin, Macro Economics & Politics — Independent Analysis";
export const SITE_URL = "https://news.txid.uk";
export const AUTHOR = "txid";
export const API_URL = "https://api.txid.uk";

export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}

export const CATEGORIES = {
  bitcoin: {
    name: "Bitcoin",
    color: "#F7931A",
    description: "Bitcoin network, market, and ecosystem analysis",
  },
  macro: {
    name: "Macro",
    color: "#3B82F6",
    description: "Global macro economics and monetary policy",
  },
  politics: {
    name: "Politics",
    color: "#8B5CF6",
    description: "Regulatory landscape and political developments",
  },
  opinion: {
    name: "Opinion",
    color: "#10B981",
    description: "Editorial perspectives and commentary",
  },
} as const;

export type Category = keyof typeof CATEGORIES;
