import * as fs from 'fs';
import * as path from 'path';

const SHADOW_CODE_GPT_ROOT = '.shadowcodegpt';
const ANALYZE_SUBDIRECTORY = 'analyze';

function getAnalysisDirectory(workspaceRoot: string, relativePath: string): string {
    return path.join(workspaceRoot, SHADOW_CODE_GPT_ROOT, ANALYZE_SUBDIRECTORY, relativePath);
}

export function saveMarkdownByTimestamp(workspaceRoot: string, relativePath: string, content: string, batchNumber: number): string {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, -1);
    return saveMarkdown(workspaceRoot, relativePath, `manualAnalyze.${timestamp}.md`, content);
}

export function saveMarkdown(workspaceRoot: string, relativePath: string, filename: string, content: string): string {
    const resultDir = getAnalysisDirectory(workspaceRoot, relativePath);
    fs.mkdirSync(resultDir, { recursive: true });
    const resultPath = path.join(resultDir, filename);
    fs.appendFileSync(resultPath, content + "\n");
    return resultPath;
}

export function getLatestCacheTimestamp(workspaceRoot: string, relativePath: string): string | null {
    const resultDir = getAnalysisDirectory(workspaceRoot, relativePath);
    if (!fs.existsSync(resultDir)) {
        return null;
    }

    const files = fs.readdirSync(resultDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    const timestamps = mdFiles.map(file => file.split('.')[1]);

    if (timestamps.length === 0) {
        return null;
    }

    timestamps.sort();
    return timestamps[timestamps.length - 1];
}

export function getLatestCacheTimestampNumber(workspaceRoot: string, relativePath: string): number | null {
    const timestamp = getLatestCacheTimestamp(workspaceRoot, relativePath);
    if (timestamp) {
        const date = new Date(timestamp);
        return date.getTime();
    }
    return null;
}
