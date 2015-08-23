/* global fetch */
import AbstractStorage from 'piggy-module/lib/Storage/Abstract';

export default class ApiStorage extends AbstractStorage {

  /**
   * Get a list of data Object from criteria and options
   *
   * @param {Object} criteria - mongodb criteria style
   * @param {Object} options - mongodb options style
   * @return {Promise<Object[], Error>}
   * @access public
   * @override
   */
  get(criteria = {}, options= {}) {
    let params = { criteria: criteria, options: options};
    return this._runRequest('get', '', params, null, [])
      .then( result => {
        return result;
      })
      .catch( err => {
        throw new Error(err.message);
      });
  }

  /**
   * Insert many data Object in database
   *
   * @param {Object[]} dataArray - a list of data Object
   * @return {Promise<Object[], Error>} - inserted data Object list
   * @access public
   * @override
   */
  insert(voData) {
    return new Promise( (resolve, reject) => {
      if( voData.constructor !== Array ) {
        voData = [voData];
      }

      let promises = [];
      voData.forEach( dataset => {
        let p = this._runRequest('post', '', null, dataset)
          .then( result => {
            return result;
          })
          .catch( err => {
            throw new Error(err.message);
          });
        promises.push(p);
      });

      Promise.all(promises).then( results => {
        resolve(results);
      });
    });

  }

  // update(criteria={}, newValues={}, options={}) {
  //   let method = 'patch';
  //   alert('not implemented yet');
  // }

  // delete(criteria) {
  //   let method = 'delete';
  //   alert('not implemented yet');
  // }

  getFetcherUrl(path='', params=null) {
    let url = this._collection + path;

    if(params) {
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

  getFetcherOptions(method, postData=null) {
    if (['get', 'post', 'put', 'delete'].indexOf(method) < 0) {
      throw new Error('Unknwon fetch method');
    }
    let options = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    if (method === 'post' && postData) {
      options.body = JSON.stringify(postData);
    }
    return options;
  }

  _runRequest(method, path='', params=null, postData=null, defaultValue=null) {
    let url = this.getFetcherUrl(path, params);
    let options = this.getFetcherOptions(method, postData);

// console.log('RUN REQUEST url', url);
// console.log('RUN REQUEST options', options)

    return new Promise( (resolve, reject) => {
      fetch(url, options)
        .then(function(response) {
          if (response.status > 200 || response.status < 300) {
            return response;
          }
          var error = new Error(response.statusText);
          error.response = response;
          return reject(error);
        }).then( response => {
          return response.json();
        }).then( json => {
          let data = null;
          if(!json.data) {
            return resolve(defaultValue);
          }
          if(json.data.constructor === Array) {
            data = json.data.map( item => item.attributes );
          }
          else {
            data = json.data.attributes;
          }
          return resolve(data);
        }).catch( err => {
          return reject(err);
        });
    });

  }
}
