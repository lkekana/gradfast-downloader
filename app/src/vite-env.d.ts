/// <reference types="vite/client" />
interface ViteTypeOptions {
	// By adding this line, you can make the type of ImportMetaEnv strict
	// to disallow unknown keys.
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_API_PROXY: string;
	readonly VITE_CDN_PROXY: string;
    readonly VITE_AUTH_PROXY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
