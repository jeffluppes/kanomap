var request = require('request');
var xml2js = require('xml2js');
var RssGeoJSON = require("../helpers/RssGeoJSON");
var RssService = (function () {
    function RssService() {
    }
    RssService.prototype.init = function (apiServiceManager, server, config) {
        var _this = this;
        this.server = server;
        this.baseUrl = apiServiceManager.BaseUrl + (config['rssAddress'] || '/rss');
        server.get(this.baseUrl, function (req, res) {
            var id = req.query.url;
            _this.getRss(id, res);
        });
    };
    RssService.prototype.shutdown = function () { };
    RssService.prototype.getRss = function (feedUrl, res) {
        console.log('RSS request: ' + feedUrl);
        var parseNumbers = function (str) {
            if (!isNaN(str)) {
                str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
            }
            return str;
        };
        request(feedUrl, function (error, response, xml) {
            if (!error && response.statusCode == 200) {
                var parser = new xml2js.Parser({ trim: true, normalize: true, explicitArray: false, mergeAttrs: true });
                parser.parseString(xml, function (err, rssFeed) {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        var r = rssFeed.rss;
                        var c = r.channel;
                        if (c.item) {
                            var geo = new RssGeoJSON.RssGeoJSON();
                            c.item.forEach(function (i) {
                                var feature;
                                if (i["geo:lat"] && i["geo:long"])
                                    feature = new RssGeoJSON.RssFeature(i["geo:lat"], i["geo:long"]);
                                else
                                    feature = new RssGeoJSON.RssFeature();
                                if (i.title)
                                    feature.properties["Name"] = i.title;
                                if (i.link)
                                    feature.properties["link"] = i.link;
                                if (i.description)
                                    feature.properties["description"] = i.description;
                                if (i.category)
                                    feature.properties["category"] = i.category;
                                if (i.pubDate)
                                    feature.properties["pubDate"] = i.pubDate;
                                if (i["dc:date"])
                                    feature.properties["date"] = i["dc:date"];
                                geo.features.push(feature);
                            });
                            res.json(geo);
                        }
                    }
                });
            }
            else {
                res.statusCode = 404;
                res.end();
            }
        });
    };
    return RssService;
})();
module.exports = RssService;
//# sourceMappingURL=RssService.js.map