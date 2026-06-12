module.exports = {
  apps: [
    {
      name: 'showcase-nuxt-prisma-turso',
      port: '3148',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3148
      }
    }
  ]
};
