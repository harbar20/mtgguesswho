import { promises as fs } from "fs";
import { join } from "path";
import type { ScryfallCommander } from "~/types";

const CACHE_DIR = join(process.cwd(), ".cache");
const CACHE_FILE = join(CACHE_DIR, "commanders.json");
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
    timestamp: number;
    data: ScryfallCommander[];
}

export async function getCachedCommanders(): Promise<
    ScryfallCommander[] | null
> {
    try {
        // Check if cache file exists
        await fs.access(CACHE_FILE);

        // Read cache file
        const cacheContent = await fs.readFile(CACHE_FILE, "utf-8");
        const cache: CacheData = JSON.parse(cacheContent);

        // Check if cache is still valid (less than 24 hours old)
        const now = Date.now();
        const cacheAge = now - cache.timestamp;

        if (cacheAge < CACHE_DURATION_MS) {
            return cache.data;
        }

        // Cache is expired
        return null;
    } catch (error) {
        // Cache file doesn't exist or is invalid
        return null;
    }
}

export async function setCachedCommanders(
    data: ScryfallCommander[]
): Promise<void> {
    try {
        // Ensure cache directory exists
        await fs.mkdir(CACHE_DIR, { recursive: true });

        // Write cache file
        const cache: CacheData = {
            timestamp: Date.now(),
            data,
        };

        await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
    } catch (error) {
        // If caching fails, just log and continue
        console.error("Failed to cache commanders:", error);
    }
}
