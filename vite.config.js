import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        services:  resolve(__dirname, 'services.html'),
        about:     resolve(__dirname, 'about.html'),
        projects:  resolve(__dirname, 'projects.html'),
        'why-us':  resolve(__dirname, 'why-us.html'),
        contact:   resolve(__dirname, 'contact.html'),
      },
    },
  },
});
