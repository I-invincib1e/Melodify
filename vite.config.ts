import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
	plugins: [react(), tailwind()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/web"),
		},
	},
	server: {
		allowedHosts: true,
		hmr: { overlay: false },
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"vendor-react": ["react", "react-dom"],
					"vendor-state": ["zustand", "wouter"],
					"vendor-supabase": ["@supabase/supabase-js"],
					"vendor-ui": ["lucide-react", "react-icons", "radix-ui", "@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
					"vendor-forms": ["react-hook-form", "zod"],
				},
			},
		},
	},
});
