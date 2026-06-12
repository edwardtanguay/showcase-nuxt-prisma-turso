module.exports = {
  apps: [
    {
      name: 'showcase-nuxt-prisma-turso',
      port: '3148',
      instances: 1,
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3148
      }
    }
  ]
};
