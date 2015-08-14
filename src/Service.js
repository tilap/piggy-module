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
    this._context = {};
  }

  /**
   * Store a context
   *
   * @param {string} key - the context key
   * @param {?(number|string|Array|object)} value - the context value
   * @return {self}
   * @access public
   */
  setContext(key, value) {
    this._context[key]=value;
    return this;
  }

  /**
   * Store and override all context
   *
   * @param {object} context - the context key
   * @return {self}
   * @access public
   */
  setFullContext(context) {
    this._context = context;
    return this;
  }

  /**
   * Create a Vo from a data object
   *
   * @param {object} data -
   * @return {Promise<Vo, Error>} - new Vo
   * @access public
   */
  createOneFromData(data={}) {
    let vo = this._manager.getNewVo(data);
    return new Promise((resolve, reject) => {
      this._manager.saveOne(vo)
        .catch(err => {
          return reject(err);
        })
        .then(vo => {
          return resolve(vo);
        });
    });
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
  getByPage(criteria, page=1, limit=15, orderby='id', order='asc') {
    page = page > 0 ? page : 1;
    order = (order==='desc' || order===false || order===-1 || order==='-1') ? 'desc' : 'asc';
    let options = {};
    options.limit = limit;
    options.skip = (page-1) * limit;
    options.sort = [[orderby, order]];
    return this.get(criteria, options);
  }

  /**
   * Get a Vo from its Id
   *
   * @param {string} id - the id of the Vo
   * @return {Promise<Vo, Error>}
   * @access public
   */
  getOneById(id) {
    return this._manager.getOneById(id);
  }

  /**
   * Update a Vo properties from a dataset
   *
   * @param {Object} data - a data object
   * @return {Promise<Vo, Error>} - the updated Vo
   * @access public
   */
  updateOneFromData(data, id) {
    return new Promise((resolve, reject) => {
      this.getOneById(id).then( vo => {
        if(null===vo) {
          return reject ('not found');
        }
        vo.setData(data);
        return vo;
      })
      .then( vo => {
        this._manager.saveOne(vo).then( vo => {
          return resolve(vo);
        })
        .catch(err => {
          return reject(err);
        });
      });
    });
  }

  /**
   * Delete a Vo from its id
   *
   * @param {string} id - the id of the Vo
   * @return {Promise<boolean, Error>} - true if success, false if error, null if nothing to delete
   * @access public
   */
  deleteOneById(id) {
    return new Promise((resolve, reject) => {
      this.getOneById(id).then( vo => {
        if(null===vo) {
          return resolve(null);
        }
        this._manager.deleteOne(vo).then( success => {
          return resolve(success===true);
        });
      });
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
