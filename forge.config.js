module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Identityofsine',
          name: 'sourly-electron'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
}
