/**
 * Execute any business request from business data. Mostly output Vo
 */
export default class Service {

  /**
   * @param {Manager} manager - manager a manager instance
   */
  constructor(manager) {
    /**
     * @type {Manager}
     * @private
     */
    this._manager = manager;

    /**
     * @type {object}
     * @private
     */
    this._context = null;
  }

  /**
   * Store a context
   *
   * @param {String} key - the context key
   * @param {any} value - the context value
   * @return {self}
   * @access public
   */
  setContext(context) {
    this._context=context;
    return this;
  }

  /**
   * Get a context value or a default one
   *
   * @param {String} key - the context key
   * @param {any} defaultValue - the default value is no context key exists
   * @return {Boolean}
   * @access public
   */
  getContext() {
    return this._context;
  }

  /**
   * Get a list of Vo
   *
   * @param {Object} criteria - mongodb-like criteria style
   * @param {Object} options - mongodb-like options style
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  get(criteria={}, options={}) {
    return this._manager.get(criteria, options);
  }


  /**
   * Get one Vo according to criteria
   *
   * @param {Object} criteria - mongodb-like criteria style
   * @param {Object} options - mongodb-like options style
   * @return {Promise<any, Error>} - null if no Vo found or the vo
   * @throw {Error}
   * @access public
   */
  getOne(criteria={}, options={}) {
    return new Promise( (resolve, reject) => {
      this.get(criteria, options).then( vos => {
        if(vos.length===0) {
          return resolve(null);
        }
        if(vos.length===1) {
          return resolve(vos[0]);
        }
        reject(new Error('get One has multiple results'));
      });
    });
  }

  getOneByUniqueProperty(property, value) {
    let criteria = {};
    criteria[property] = value;
    return this.getOne(criteria);
  }

  getOneById(id) {
    return this.getOneByUniqueProperty('_id', id);
  }

  /**
   * Get a paginated list of Vo
   *
   * @param {Object} criteria - mongodb-like criteria style
   * @param {integer} page - the page to retrieve
   * @param {integer} limit - number of item per page
   * @param {string} orderby - a Vo property to order by
   * @param {string} order - 'asc' or 'desc'
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  getByPage(criteria={}, page=1, limit=15, orderby='id', order='asc') {
    page = page > 0 ? page : 1;
    order = (order==='desc' || order===false || order===-1 || order==='-1') ? 'desc' : 'asc';
    let options = {};
    options.limit = limit;
    options.skip = (page-1) * limit;
    options.sort = [[orderby, order]];
    return this.get(criteria, options);
  }


  /**
   * Create a Vo from a data object
   *
   * @param {object} data -
   * @return {Promise<Vo, Error>} - new Vo
   * @access public
   */
  insertOne(data={}) {
    let vo = this._manager.getNewVo(data);
    return new Promise((resolve, reject) => {
      this._manager.insertOne(vo)
        .catch(err => reject(err))
        .then(vo => resolve(vo));
    });
  }

  /**
   * Update a Vo properties from a dataset
   *
   * @param {Object} data - a data object
   * @return {Promise<Vo, Error>} - the updated Vo
   * @access public
   */
  updateOne(id, data={}) {
    return this.updateOneByUniqueProperty('_id', id, data);
  }

  updateOneByUniqueProperty(property, value, newData) {
    return new Promise((resolve, reject) => {
      this.getOneByUniqueProperty(property, value)
        .then( vo => {
          if(null===vo) {
            return reject ('not found');
          }
          vo.setData(newData);
          return vo;
        })
        .then( vo => {
          this._manager.updateOne(vo)
            .then( updatedVo => resolve(updatedVo))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  delete(criteria={}) {
    return new Promise( (resolve, reject) => {
      this.get(criteria)
        .then( vos => {
          this._manager.delete(vos)
            .then( deletedCount => {
              return resolve(deletedCount);
            })
            .catch( error => reject(error) );
        })
        .catch(err => reject(err));
    });
  }


  /**
   * Get the list of Class available methods
   *
   * @return {String[]} - the list of the callable methods
   * @access public
   */
  get availableMethods() {
    let childMethods = Object.getOwnPropertyNames(this.__proto__);
    let OwnMethods = Object.getOwnPropertyNames(Service.prototype);

    let methods = childMethods;
    OwnMethods.forEach( method => {
      if(methods.indexOf(method) < 0) {
        methods.push(method);
      }
    });
    return methods;
  }
}
