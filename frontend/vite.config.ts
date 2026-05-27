import { defineConfig } from 'vite';
import { relative, resolve } from 'path';
import type { Dirent } from 'fs';
import { readFileSync } from 'fs';
import { cp, mkdir, readdir, writeFile } from 'fs/promises';
import { visualizer } from "rollup-plugin-visualizer";

function loadIntegrationVersion(): string {
    const manifestPath = resolve(__dirname, '../custom_components/card_builder/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as { version: string };
    return manifest.version.trim();
}

async function discoverAssetRoots(rootDir: string): Promise<string[]> {
    const discovered: string[] = [];

    const visit = async (currentDir: string): Promise<void> => {
        let entries: Dirent<string>[];
        try {
            entries = await readdir(currentDir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const fullPath = resolve(currentDir, entry.name);
            if (entry.name === 'assets') {
                discovered.push(fullPath);
                continue;
            }
            await visit(fullPath);
        }
    };

    await visit(rootDir);
    return discovered;
}

function resolveAssetTargetDir(srcRootDir: string, assetRootDir: string, outDir: string): string {
    const relativeFromSrc = relative(srcRootDir, assetRootDir);
    const parts = relativeFromSrc.split(/[\\/]+/).filter(Boolean);
    if (parts[parts.length - 1] === 'assets') {
        parts.pop();
    }
    return resolve(outDir, 'assets', ...parts);
}

export default defineConfig(({ mode }) => {
    const shouldAnalyze = process.env.ANALYZE === 'true';
    const development = mode === 'development';
    const outDir = resolve(__dirname, '../custom_components/card_builder/frontend/dist');
    const srcRootDir = resolve(__dirname, 'src');
    const blocksComponentsRootDir = resolve(__dirname, 'src/common/blocks/components');
    const integrationVersion = loadIntegrationVersion();

    return {
        // pragmatic-drag-and-drop references process.env.NODE_ENV.
        // In a browser environment (Vite) `process` is not defined, so we
        // replace it at build time to avoid the "process is not defined" error (Safari).
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
            __CARD_BUILDER_VERSION__: JSON.stringify(integrationVersion),
        },
        plugins: [
            shouldAnalyze && visualizer({
                template: 'network',
                open: true,
                filename: `dist/stats-build.html`,
                gzipSize: true,
                brotliSize: true,
            }),
            {
                name: 'keep-gitkeep',
                async closeBundle() {
                    const keepPath = resolve(outDir, '.gitkeep');
                    await mkdir(outDir, { recursive: true });
                    const assetRoots = await discoverAssetRoots(blocksComponentsRootDir);
                    for (const assetRoot of assetRoots) {
                        const targetDir = resolveAssetTargetDir(srcRootDir, assetRoot, outDir);
                        await mkdir(targetDir, { recursive: true });
                        await cp(assetRoot, targetDir, { recursive: true, force: true });
                    }
                    await writeFile(keepPath, '', { flag: 'w' });
                },
            },
        ].filter(Boolean),
        build: {
            outDir,
            emptyOutDir: true,
            lib: false,
            rollupOptions: {
                input: {
                    'card-builder-panel': resolve(__dirname, 'src/panel/panel.ts'),
                    'card-builder-renderer-card': resolve(__dirname, 'src/cards/renderer/card.ts'),
                },
                output: {
                    format: 'es',
                    compact: !development,
                    entryFileNames: '[name].js',
                    chunkFileNames: 'card-builder-shared-[hash].js',
                    inlineDynamicImports: false, // MUST BE FALSE
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('moveable')) {
                                return 'builder-tools-moveable';
                            }
                            if (id.includes('pragmatic-drag-and-drop')) {
                                return 'builder-tools-drag-and-drop';
                            }

                            return 'vendor';
                        }
                    }
                }
            },
            minify: development ? false : 'terser',
            terserOptions: development ? undefined : {
                compress: {
                    pure_funcs: ['console.log'],
                    drop_debugger: true,
                },
                format: {
                    comments: false,
                },
            },
            sourcemap: development,
            watch: development ? {} : null, // Enable watch in dev mode
        },
        resolve: {
            alias: { '@': resolve(__dirname, 'src') },
        },
    };
});
