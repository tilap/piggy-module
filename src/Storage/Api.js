import AbstractStorage from 'piggy-module/lib/Storage/Abstract';
import {UnreachableStorage} from 'piggy-module/lib/Storage/Errors';

export default class ApiStorage extends AbstractStorage {

  constructor(connector, collection) {
    super(connector, collection);
  }

  /**
   * Get a list of data Object from criteria and options
   *
   * @param {Object} criteria - mongodb criteria style
   * @param {Object} options - mongodb options style
   * @return {Promise<Object[], Error>}
   * @access public
   * @override
   */
  get(criteria = {}, options = {}) {
    let params = { 'criteria': criteria, 'options': options};
    return this._runRequest('get', '', params, {}, []);
  }

  /**
   * Insert many data Object in database
   *
   * @param {Object[]} data - an object dataset
   * @return {Promise<Object[], Error>} - inserted data Object list
   * @access public
   * @override
   */
  insertOne(data = {}) {
    return this._runRequest('post', '', {}, data);
  }


  /**
   * Delete collection Object from criteria
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @return {Promise<integer, Error>} - number of deleted items
   * @access public
   * @override
   */
  delete(criteria = {}) {
    return this._runRequest('delete', '', { 'criteria': criteria});
  }


  /**
   * Build url to fetch
   *
   * @param {String} path - the relative path
   * @params {Object} params - get params
   * @return {String}
   * @access private
   */
  _getFetcherUrl(path = '', params = {}) {
    let url = this._connector + this._collection + path;
    if (params && Object.keys(params).length > 0) {
      let args = [];
      Object.keys(params).forEach( key => {
        let value = encodeURIComponent(JSON.stringify(params[key]));
        args.push( key + '=' + value);
      });
      if (args.length > 0) {
        url += '?' + args.join('&');
      }
    }
    return url;
  }

  /**
   * Build fetch options depending on query type and extra params
   * @param {String} method - fetch method: 'get', 'post', 'put' or 'delete'
   * @param {Object} postData - extra data to send
   * @return {Object}
   * @access private
   */
  _getFetcherOptions(method, postData = {}) {
    method = method.toLowerCase();
    if (['get', 'post', 'put', 'delete'].indexOf(method) < 0) {
      throw new Error('Unknwon fetch method ' + method);
    }
    let options = {
      'method': method,
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    let hasData = postData && Object.keys(postData).length > 0;
    if (['post', 'put'].indexOf(method) > -1 && hasData) {
      options.body = JSON.stringify(postData);
    }
    return options;
  }

  /**
   * Run a request
   * @todo only an options object as params
   */
  _runRequest(method, path = '', params = {}, postData = {}, defaultValue = {}) {
    let url = this._getFetcherUrl(path, params);
    let options = this._getFetcherOptions(method, postData);

    return new Promise( (resolve, reject) => {
      fetch(url, options)
        .catch(error => {
          if(error.constructor.name==='TypeError') {
            return reject( new UnreachableStorage());
          }
          return reject(error);
        })
        .then(function(response) {
          if (response.ok) {
            return response;
          }
          let error = new Error(response.statusText);
          error.response = response;
          return reject(error);
        }).then( response => {
          return response.json();
        }).then( json => {
          // Piggy instalce
          if(this._isJsonPiggyResult(json)) {
            return this._extractPiggyData(json, defaultValue);
          }
          // Error
          if(this._isJsonPiggyError(json)) {
            return json;
          }
          // Raw
          if(json.hasOwnProperty('data')) {
            return json.data;
          }
          return json;
        }).then(res => {
          resolve(res);
        }).catch( err => {
          reject(err);
        });
    });
  }

  _isJsonPiggyError(json) {
    return json.hasOwnProperty('errors');
  }
  // @todo: do a real api response parser as of ApiBag, ApiBagRessource and a ApiPiggyModuleBag
  _isJsonPiggyResult(json) {
    if (!json.data) {
      return false;
    }
    let isPiggyModuleResult = true;
    if (json.data.constructor === Array) {
      json.data.forEach( item => {
        if (!item.attributes) {
          isPiggyModuleResult = false;
        }
      });
    } else if (!json.data.attributes) {
      isPiggyModuleResult = false;
    }
    return isPiggyModuleResult;
  }

  _extractPiggyData(json, defaultValue) {
    let data;
    if (!json.data) { // No data
      data = defaultValue;
    } else if (json.data.constructor === Array) { // Array of piggy-module dataset
      data = json.data.map( item => item.attributes );
    } else { // Single piggy-module dataset
      data = json.data.attributes;
    }
    return data;
  }
}
