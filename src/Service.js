export default class Service {

  constructor(manager) {
    this._manager = manager;
  }

  createOneFromData(data) {
    return new Promise((resolve, reject) => {
      let vo = this._manager.getNewVo(data);
      return this._manager.saveOne(vo)
        .catch(err => {
          return reject(err);
        })
        .then(user => {
          resolve(user);
        });
    });
  }

  get(criteria={}, options={}) {
    return this._manager.get(criteria, options);
  }

  getByPage(page=1, npp=10, orderby='username', order=1) {
    let criteria = {};
    let options = {};
    return this.get(criteria, options);
  }

  getOneById(id) {
    return this._manager.getByUniqueProperty('_id', id);
  }

  updateOneFromData(data, id) {
    return new Promise((resolve, reject) => {
      return this.getOneById(id).then( vo => {
        if(null===vo) {
          return reject ('not found');
        }
        vo.setData(data);
        return resolve(vo);
      })
      .then( vo => {
        return this._manager.saveOne(vo).then( vo => {
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
    })
    return methods;
  }
}
