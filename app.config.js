// Extends app.json. When publishing the website with `npm run deploy`, the app
// is served from https://jananim2811.github.io/Janify/, so it needs that base URL.
// Local development (npx expo start) keeps serving from the root.
const GITHUB_PAGES_BASE_URL = '/Janify'; // must match the GitHub repo name exactly

module.exports = ({ config }) => {
  const isGithubPagesBuild = process.env.npm_lifecycle_event === 'predeploy';

  return {
    ...config,
    experiments: {
      ...config.experiments,
      ...(isGithubPagesBuild ? { baseUrl: GITHUB_PAGES_BASE_URL } : {}),
    },
  };
};
