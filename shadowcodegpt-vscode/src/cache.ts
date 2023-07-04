import * as fs from 'fs';
import * as path from 'path';

const SHADOW_CODE_GPT_ROOT = '.shadowcodegpt';
const ANALYZE_SUBDIRECTORY = 'analyze';

function getTimestamp(): string {
    return new Date().toISOString().replace(/[-:.]/g, "").slice(0, -1);
}

export function createMarkdown(workspaceRoot: string, relativePath: string): string {
    const timestamp = getTimestamp();
    const filename = `manualAnalyze.${timestamp}.md`;
    const resultDir = path.join(workspaceRoot, SHADOW_CODE_GPT_ROOT, ANALYZE_SUBDIRECTORY, relativePath);
    fs.mkdirSync(resultDir, { recursive: true });
    const resultPath = path.join(resultDir, filename);
    fs.writeFileSync(resultPath, ''); // 创建一个新文件
    return resultPath;
}

export function appendMarkdown(filePath: string, content: string) {
    console.log('aappppp', filePath);
    fs.appendFileSync(filePath, content + "\n");
}

export function saveMarkdownByTimestamp(workspaceRoot: string, relativePath: string, content: string) {
    const timestamp = getTimestamp();
    const filename = `manualAnalyze.${timestamp}.md`;
    return saveMarkdown(workspaceRoot, relativePath, filename, content);
}

export function saveMarkdown(workspaceRoot: string, relativePath: string, filename: string, content: string) {
    const resultDir = path.join(workspaceRoot, SHADOW_CODE_GPT_ROOT, ANALYZE_SUBDIRECTORY, relativePath);
    fs.mkdirSync(resultDir, { recursive: true });
    const resultPath = path.join(resultDir, filename);
    fs.appendFileSync(resultPath, content + "\n");
    return resultPath;
}

export function getLatestCacheTimestamp(workspaceRoot: string, relativePath: string): string | null {
    const resultDir = path.join(workspaceRoot, SHADOW_CODE_GPT_ROOT, ANALYZE_SUBDIRECTORY, relativePath);
    if (!fs.existsSync(resultDir)) {
        return null;
    }

    const files = fs.readdirSync(resultDir);
    const mdFiles = files.filter(file => file.startsWith('manualAnalyze.'));
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
