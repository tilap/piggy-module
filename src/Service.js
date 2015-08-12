export default class Service {

  constructor(manager) {
    this._manager = manager;
    this._context = {};
  }

  setContext(key, value) {
    this._context[key]=value;
  }

  createOneFromData(data) {
    let vo = this._manager.getNewVo(data);
    return new Promise((resolve, reject) => {
      this._manager.saveOne(vo)
        .catch(err => {
          return reject(err);
        })
        .then(user => {
          return resolve(user);
        });
    });
  }

  get(criteria={}, options={}) {
    return this._manager.get(criteria, options);
  }

  getByPage(criteria, page=1, limit=15, orderby='id', order=1) {
    page = page > 0  || 1;
    let options = {};
    options.limit = limit;
    options.skip = (page-1) * limit;
    options.sort = [[orderby, order ? 'asc' : 'desc']];
    return this.get(criteria, options);
  }

  getOneById(id) {
    return this._manager.getOneById(id);
  }

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
        });
      });
    });
  }

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
