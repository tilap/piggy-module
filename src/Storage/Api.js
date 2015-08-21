import AbstractStorage from './Abstract';

class ApiStorage extends AbstractStorage {

  get(criteria = {}, options= {}) {
    let method = 'GET';
    let path = '';
    let params = {};
    return this._runRequest(method, path, params)
      .then( result => {
        alert('result');
        alert(result);
        return result;
      })
      .catch( err => {
        alert('error');
        alert(error);
        throw new Error(err.message);
      });
  }

  insert(voData) {
    let method = 'POST';

  }

  update(criteria={}, newValues={}, options={}) {
    let method = 'PATCH';

  }

  delete(criteria) {
    let method = 'DELETE';

  }

  getFetcherOption() {
    return {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    };
  }

  _runRequest(method, path='', params={}) {
    let url = this._collection + path;
    let options = this.getFetcherOption();
    options.method = method;

    return new Promise( (resolve, reject) => {
      fetch(url, options)
        .then(function(response) {
console.log('response', response);

          if (response.status < 200 || response.status >= 300) {
console.log('error', error);
            var error = new Error(response.statusText)
            error.response = response
            return reject(error);
          }
          return response;
        })
        .then(response => {
console.log('status', response.status);
console.log('json', response.json());
          return resolve(response.json());
        })
        .catch( (err) => {
          return reject(err);
        });
    });
  }
}
