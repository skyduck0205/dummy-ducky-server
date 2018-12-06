const debug = require('debug')('dummy-ducky-server:DDSRouter');
const _ = require('lodash');
const DDSPattern = require('./dds-pattern');

class DDSRouter {
  constructor(config) {
    this.config = {};
    this.patterns = {};

    this.update(config);
  }

  update(config) {
    this.config = config;
    this.updatePatterns();
  }

  updatePatterns() {
    this.patterns = {};
    _.forIn(this.config, (routeConfig, path) => this.addPattern(path));
    debug('updatePatterns:', _.keys(this.patterns));
  }

  addPattern(path) {
    this.patterns[path] = new DDSPattern(path);
  }

  addRoute(path, method, responses) {
    const responseKeys = _.keys(responses);
    const current = responseKeys.length ? responseKeys[0] : '';
    _.set(this.config, `${path}.${method}`, {
      disabled: false,
      current,
      responses
    });
    if (!this.patterns[path]) {
      this.addPattern(path);
    }
  }

  updateRoute(path, method, responses) {
    const responseConfig = this.getResponseConfig(path, method);
    responseConfig.responses = responses;
    if (!this.getCurrentResponse(path, method)) {
      const responseKeys = _.keys(responses);
      const current = responseKeys.length ? responseKeys[0] : '';
      responseConfig.current = current;
    }
  }

  removeRoute(path, method) {
    this.config = _.omit(this.config, `${path}.${method}`);
    // if routeConfig empty, remove routeConfig and pattern
    if (_.isEmpty(this.config[path])) {
      this.config = _.omit(this.config, path);
      this.patterns = _.omit(this.patterns, path);
    }
  }

  getResponseConfig(path, method) {
    return _.get(this.config, `${path}.${method}`);
  }

  getResponse(path, method, key) {
    return _.get(this.config, `${path}.${method}.responses.${key}`);
  }

  getCurrentResponse(path, method) {
    const current = _.get(this.config, `${path}.${method}.current`);
    return this.getResponse(path, method, current);
  }

  getMatchedPath(req) {
    const matchedPatterns = this.getMatchedPatterns(req);
    debug('matchedPatterns:', _.keys(matchedPatterns));
    
    const matchedPath = _(matchedPatterns)
      .mapValues(pattern => ({
        strict: _(pattern.queryPattern).omitBy(v => v === true).keys().valueOf().length,
        loose: _(pattern.queryPattern).pickBy(v => v === true).keys().valueOf().length
      }))
      .toPairs()
      .sortBy(['[1].strict', '[1].loose'])
      .map('[0]')
      .last();
    debug('matchedPath:', matchedPath);

    return matchedPath;
  }

  getMatchedPatterns(req) {
    const reqPath = req.path;
    const reqMethod = req.method;
    const reqQuery = req.query;
    return _.pickBy(this.patterns, (pattern, path) => {
      const responseConfig = this.getResponseConfig(path, reqMethod);
      return (
        responseConfig && 
        !responseConfig.disabled &&
        pattern.match(reqPath, reqQuery)
      );
    });
  }
}

module.exports = DDSRouter;
