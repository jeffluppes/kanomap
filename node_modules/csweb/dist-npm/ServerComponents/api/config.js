var AuthConfig = (function () {
    function AuthConfig() {
    }
    AuthConfig.TOKEN_SECRET = process.env.TOKEN_SECRET || 'JWT Token Secret';
    AuthConfig.MONGO_URI = process.env.MONGO_URI || 'localhost=27017';
    AuthConfig.FACEBOOK_SECRET = process.env.FACEBOOK_SECRET || '';
    AuthConfig.FOURSQUARE_SECRET = process.env.FOURSQUARE_SECRET || '';
    AuthConfig.GOOGLE_SECRET = process.env.GOOGLE_SECRET || '';
    AuthConfig.GITHUB_SECRET = process.env.GITHUB_SECRET || '';
    AuthConfig.LINKEDIN_SECRET = process.env.LINKEDIN_SECRET || '';
    AuthConfig.TWITCH_SECRET = process.env.TWITCH_SECRET || '';
    AuthConfig.WINDOWS_LIVE_SECRET = process.env.WINDOWS_LIVE_SECRET || '';
    AuthConfig.YAHOO_SECRET = process.env.YAHOO_SECRET || '';
    AuthConfig.TWITTER_KEY = process.env.TWITTER_KEY || '';
    AuthConfig.TWITTER_SECRET = process.env.TWITTER_SECRET || '';
    return AuthConfig;
})();
module.exports = AuthConfig;
//# sourceMappingURL=config.js.map