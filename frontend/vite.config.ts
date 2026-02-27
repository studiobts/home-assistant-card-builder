import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
    const shouldAnalyze = process.env.ANALYZE === 'true';
    const development = mode === 'development';
    return {
        // pragmatic-drag-and-drop references process.env.NODE_ENV.
        // In a browser environment (Vite) `process` is not defined, so we
        // replace it at build time to avoid the "process is not defined" error (Safari).
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        plugins: [
            shouldAnalyze && visualizer({
                template: 'network',
                open: true,
                filename: `dist/stats-build.html`,
                gzipSize: true,
                brotliSize: true,
            }),
        ].filter(Boolean),
        build: {
            outDir: '../custom_components/card_builder/frontend/dist',
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
