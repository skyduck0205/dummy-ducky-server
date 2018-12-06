const _ = require('lodash');
const UrlPattern = require('url-pattern');

class DDSPattern {
  constructor(patternPath) {
    this.path = patternPath;
    this.urlPattern = null;
    this.queryPattern = {};

    this.parsePattern();
  }

  get url() {
    return this.path.split('?')[0];
  }

  get query() {
    return this.path.split('?')[1];
  }

  // Get queryPattern object from query part of route path
  // If a param has no value assigned, set its value to true.
  static parseQueryPattern(query) {
    const result = {};
    if (query) { 
      _.forEach(query.split('&'), queryItem => {
        const [key, value] = queryItem.split('=');
        result[key] = value || true;
      });
    }
    return result;
  }

  parsePattern() {
    this.urlPattern = new UrlPattern(this.url);
    this.queryPattern = DDSPattern.parseQueryPattern(this.query);
  }

  match(reqPath, reqQuery) {
    return (
      this.matchUrl(reqPath) &&
      this.matchQuery(reqQuery)
    );
  }

  matchUrl(reqPath) {
    return this.urlPattern.match(reqPath);
  }

  // Check if queryPattern is matched with request query object
  matchQuery(reqQuery) {
    return _.isMatchWith(
      reqQuery,  // obj
      this.queryPattern,  // src
      (objVal, srcVal) => (objVal === srcVal || (srcVal === true && objVal))
    );
  }
}

module.exports = DDSPattern;
