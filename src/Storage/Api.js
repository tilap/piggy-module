import AbstractStorage from './Abstract';

export default class ApiStorage extends AbstractStorage {

  get(criteria = {}, options= {}) {
    let method = 'get';
    let path = '';
    return this._runRequest(method, path)
      .then( result => {
        console.log('RESULT', result);
        return result;
      })
      .catch( err => {
        console.log('ERROR', err);
        throw new Error(err.message);
      });
  }

  insert(voData) {
    let method = 'post';
  }

  update(criteria={}, newValues={}, options={}) {
    let method = 'patch';
  }

  delete(criteria) {
    let method = 'delete';
  }

  getFetcherOption() {
    return {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
  }

  _runRequest(method, path='', params=null) {
    let url = this._collection + path;
    let options = this.getFetcherOption();
    if(params) {
      options.body = JSON.stringify(params);
    }
    options.method = method;

    return new Promise( (resolve, reject) => {
      fetch(url, options)
        .then(function(response) {
          if (response.status > 200 || response.status < 300) {
            return response;
          }
          var error = new Error(response.statusText)
          error.response = response
          return reject(error);
        }).then( response => {
          return response.json();
        }).then( json => {
          let errors= json.errors || null;
          if(errors) {
            return reject(errors); // @todo à améliorer => objet erreur ...
          }
          let data= json.data || [];
          return resolve( data.map( item => item.attributes ));
        }).catch( err => {
          return reject(err);
        });
    });
  }
}
