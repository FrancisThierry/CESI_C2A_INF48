const GitHubStrategy = require('passport-github2').Strategy;

module.exports = new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // Ici, vous pouvez vérifier si l'utilisateur existe en BBD SQLite
    // ou créer un compte à la volée. Pour l'instant, on passe le profil complet.
    return done(null, profile);
  }
);