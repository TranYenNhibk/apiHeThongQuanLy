import { Injectable, Req } from '@nestjs/common';
import { strictEqual } from 'assert';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { ConnectableObservable } from 'rxjs';
import { getHeapSnapshot } from 'v8';
import { HttpStatus } from '@nestjs/common';

// import { getDatabase } from 'firebase-admin/database';
// import { HttpModule, HttpService } from '@nestjs/axios';

const serviceAccount = require('../quanlykhovai-firebase-adminsdk-nle2y-299312b1b3.json');
const jwt = require('jsonwebtoken');
export const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://quanlykhovai-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = admin.database();

@Injectable()
export class AppService {
  // constructor(private httpService: HttpService) {}
  getHello(): any {
    // return getDatabase().ref('user').child('1');
    const ref = db.ref('/user/1');

    return 'Done';
  }

  async getKhoId(data: any) {
    const ref_str = '/user/' + data + '/workAt';
    const ref = db.ref(ref_str);
    const listKhoId = [];
    await ref.once('value', function (snapshot) {
      if (snapshot.val()) {
        for (let i = 0; i < snapshot.val().length; i++) {
          if (snapshot.val()[i]) {
            if (snapshot.val()[i] != null)
              listKhoId.push(snapshot.val()[i].khoId);
          }
        }
      }
    });
    return listKhoId;
  }

  async getKhoInfo(data: any) {
    var result = [];
    for (let i = 0; i < data.length; i++) {
      var ref_str = '/warehouse/' + data[i];
      var ref = db.ref(ref_str);
      await ref.once('value', function (snapshot) {
        result.push({
          key: i + 1,
          khoId: data[i],
          address: snapshot.val().address,
          square: snapshot.val().square,
          time: snapshot.val().time,
          status: snapshot.val().status,
        });
      });
    }
    return result;
  }

  async getGoodsInfo(data: any) {
    // console.log(data)
    var ref = db.ref('/TypeAndColor');
    var type = [];
    await ref.once('value', function (snapshot) {
      type = snapshot.val();
    });
    var result = [];
    var ref_str = '';
    var numOfType = [];
    for (let i = 0; i < type.length; i++) numOfType.push(0);
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < type.length; j++) {
        ref_str = '/warehouse/' + data[i] + '/goods/' + j;
        ref = db.ref(ref_str);
        await ref.once('value', async function (snapshot) {
          if (snapshot.val()) {
            // console.log(snapshot.val());
            var count = 0;
            for (let t = 1; t < snapshot.val().length; t++) {
              // console.log(snapshot.val()[t].status)
              if (snapshot.val()[t].status === 'chưa bán') count++;
            }
            numOfType[j] += count;
          }
        });
      }
    }
    // console.log(numOfType);
    for (let i = 0; i < numOfType.length; i++) {
      if (numOfType[i]) {
        result.push({
          key: result.length + 1,
          hangId: i,
          type: type[i].type,
          color: type[i].color,
          stock: numOfType[i],
          note: '',
        });
      }
    }
    // console.log(result);
    return result;
  }

  async getExportPlans(data: any) {
    // console.log(data[0])
    var ref = db.ref('/TypeAndColor');
    var TypeAndColor;
    await ref.once('value', function (snapshot) {
      TypeAndColor = snapshot.val();
    });
    ref = db.ref('/customer/');
    var customerList;
    await ref.once('value', function (snapshot) {
      customerList = snapshot.val();
    });

    // console.log(TypeAndColor)
    ref = db.ref('/exportPlan');
    var result = [];
    var customer = '';
    await ref.once('value', async function (snapshot) {
      // console.log(snapshot.val());
      for (let i = 1; i < snapshot.val().length; i++) {
        var listGoods = [];
        if (snapshot.val()[i].warehouseId === data[0]) {
          if (snapshot.val()[i].reason === 'Chuyển kho') {
            customer = 'Kho ' + snapshot.val()[i].customerId;
          } else {
            customer = customerList[snapshot.val()[i].customerId].name;
          }
          for (let j = 0; j < snapshot.val()[i].listGoods.length; j++) {
            // console.log('hi')
            if (snapshot.val()[i].listGoods[j])
              listGoods.push({
                typeId: snapshot.val()[i].listGoods[j].typeId,
                color:
                  TypeAndColor[snapshot.val()[i].listGoods[j].typeId].color,
                type: TypeAndColor[snapshot.val()[i].listGoods[j].typeId].type,
                number: snapshot.val()[i].listGoods[j].number,
              });
          }

          result.push({
            exportPlanId: i,
            moveTo: customer,
            time: snapshot.val()[i].time,
            listGoods: listGoods,
          });
        }
      }
    });
    // console.log(result);
    return result;
  }

  async getOrders(data: any) {
    // console.log(data[0])
    var ref = db.ref('/TypeAndColor');
    var TypeAndColor;
    await ref.once('value', function (snapshot) {
      TypeAndColor = snapshot.val();
    });
    ref = db.ref('/Provider/');
    var providerList;
    await ref.once('value', function (snapshot) {
      providerList = snapshot.val();
    });

    // console.log(TypeAndColor)
    ref = db.ref('/order');
    var result = [];
    var provider = '';
    await ref.once('value', async function (snapshot) {
      for (let i = 1; i < snapshot.val().length; i++) {
        var listGoods = [];
        if (snapshot.val()[i].warehouseId === data[0]) {
          if (snapshot.val()[i].reason === 'Chuyển kho') {
            provider = 'Kho ' + snapshot.val()[i].providerId;
          } else {
            provider = providerList[snapshot.val()[i].providerId].name;
          }
          for (let j = 0; j < snapshot.val()[i].listGoods.length; j++) {
            if (snapshot.val()[i].listGoods[j])
              listGoods.push({
                typeId: snapshot.val()[i].listGoods[j].typeId,
                color:
                  TypeAndColor[snapshot.val()[i].listGoods[j].typeId].color,
                type: TypeAndColor[snapshot.val()[i].listGoods[j].typeId].type,
                number: snapshot.val()[i].listGoods[j].number,
              });
          }

          result.push({
            orderId: i,
            from: provider,
            time: snapshot.val()[i].time,
            listGoods: listGoods,
          });
        }
      }
    });
    // console.log(result);
    return result;
  }

  async postImport(data: any) {
    // console.log('data ',data);
    var ref = db.ref('/import');
    var importId = 1;
    await ref.once('value', function (snapshot) {
      importId = snapshot.val().length;
    });
    var warehouseId = await this.getKhoId(data.importEmployee);
    await ref.child(String(importId)).set({
      orderId: data.orderId,
      driver: data.driver,
      importEmployee: data.importEmployee,
      time: data.time,
      note: data.note,
      warehouseId: warehouseId[0],
    });
    var listType = [];
    var listFabric = [];

    for (let i = 0; i < data.list.length; i++) {
      let id = -1;
      for (let j = 0; j < listType.length; j++) {
        if (listType[j] == data.list[i].id) {
          id = j;
          break;
        }
      }
      if (id == -1) {
        listType.push(data.list[i].id);
        listFabric.push([
          null,
          {
            length: data.list[i].length,
            lotNumber: data.list[i].lotNumber,
          },
        ]);
        for (let j = 1; j < data.list[i].number; j++) {
          listFabric[listFabric.length - 1].push({
            length: data.list[i].length,
            lotNumber: data.list[i].lotNumber,
          });
        }
      } else {
        for (let j = 0; j < data.list[i].number; j++)
          listFabric[id].push({
            length: data.list[i].length,
            lotNumber: data.list[i].lotNumber,
          });
      }
    }
    var listGoods = {};
    for (let i = 0; i < listType.length; i++) {
      listGoods[listType[i]] = listFabric[i];
    }
    await ref.child(String(importId)).child('listGoods').set(listGoods);
    console.log('list Fabric: ', listFabric);
    var count = 0;
    for (let i = 0; i < listType.length; i++) {
      count = 0;
      ref = db.ref('/warehouse/' + warehouseId[0] + '/goods/' + listType[i]);
      await ref.once('value', async function (snapshot) {
        if (snapshot.val()) count = snapshot.val().length - 1;
        else count = 0;
      });
      for (let j = 1; j < listFabric[i].length; j++) {
        await ref.child(String(count + j)).set({
          length: listFabric[i][j].length,
          lotNumber: listFabric[i][j].lotNumber,
          status: 'chưa bán',
          exportTime: 'none',
          importTime: data.time,
        });
      }
    }
    this.postNoti(
      listType,
      listFabric,
      1,
      data.time,
      data.importEmployee,
      warehouseId[0],
    );
    let capacityEachType = 0;
    let capacityWarehouse = 0;
    let totalFabricNumber = 0;
    let fabricEach = [];
    ref = db.ref('/warehouse/' + warehouseId[0]);
    await ref.once('value', async function (snapshot) {
      capacityEachType = snapshot.val().capacityEachType;
      capacityWarehouse = snapshot.val().capacityWarehouse;
      for (let i = 0; i < snapshot.val().goods.length; i++) {
        let temp = snapshot.val().goods[i];
        if (temp)
          for (let j = 0; j < temp.length; j++) {
            if (temp[j] && temp[j].status == 'chưa bán') count++;
          }
      }
    });
    totalFabricNumber = count;
    console.log(listType);
    for (let i = 0; i < listType.length; i++) {
      count = 0;
      ref = db.ref('/warehouse/' + warehouseId[0] + '/goods/' + listType[i]);
      await ref.once('value', async function (snapshot) {
        for (let j = 0; j < snapshot.val().length; j++) {
          if (snapshot.val()[j])
            if (snapshot.val()[j].status == 'chưa bán') count++;
        }
      });
      fabricEach.push(count);
    }

    console.log(totalFabricNumber);
    console.log(fabricEach);
    console.log(listType);
    for (let i = 0; i < fabricEach.length; i++) {
      if (fabricEach[i] > capacityEachType * 0.8)
        this.postNotiWarning(
          1,
          listType[i],
          fabricEach[i],
          data.time,
          warehouseId[0],
          capacityEachType,
        );
    }
    if (totalFabricNumber > capacityWarehouse * 0.8)
      this.postNotiWarning(
        1,
        -1,
        totalFabricNumber,
        data.time,
        warehouseId[0],
        capacityWarehouse,
      );
    return 'Thành công';
  }

  async postExport(data: any) {
    console.log(data);
    var ref = db.ref('/export');
    var stop = 0;
    var exportId = 1;
    await ref.once('value', function (snapshot) {
      exportId = snapshot.val().length;
    });
    var warehouseId = await this.getKhoId(data.exportEmployee);
    var listType = [];
    var listFabricId = [];
    for (let i = 0; i < data.list.length; i++) {
      let id = -1;
      for (let j = 0; j < listType.length; j++) {
        if (listType[j] == data.list[i].id) {
          id = j;
          break;
        }
      }
      if (id == -1) {
        listType.push(data.list[i].typeId);
        listFabricId.push([
          null,
          {
            fabricId: data.list[i].fabricId,
          },
        ]);
      } else {
        listFabricId[id].push({
          fabricId: data.list[i].fabricId,
        });
      }
    }
    var listGoods = {};
    for (let i = 0; i < listType.length; i++) {
      listGoods[listType[i]] = listFabricId[i];
    }
    // console.log(listGoods);
    for (let i = 0; i < listType.length; i++) {
      ref = db.ref('/warehouse/' + warehouseId + '/goods/' + listType[i]);
      await ref.once('value', async function (snapshot) {
        for (let j = 1; j < listFabricId[i].length; j++) {
          // console.log(
          //   typeof snapshot.val()[listFabricId[i][1].fabricId].status,
          // );
          // console.log(typeof 'đã bán');
          // console.log(
          //   snapshot.val()[listFabricId[i][1].fabricId].status === 'đã bán',
          // );
          if (snapshot.val()[listFabricId[i][j].fabricId].status === 'đã bán') {
            stop = 1;
            break;
          }
        }
      });
      if (stop) break;
    }
    // console.log('false');
    if (!stop) {
      for (let i = 0; i < listType.length; i++) {
        ref = db.ref('/warehouse/' + warehouseId + '/goods/' + listType[i]);
        for (let j = 1; j < listFabricId[i].length; j++) {
          await ref.child(listFabricId[i][j].fabricId).update({
            status: 'đã bán',
          });
          console.log('sold');
          console.log(listFabricId[i][j].fabricId);
        }
      }
      ref = db.ref('/export');
      await ref.child(String(exportId)).set({
        exportPlanId: data.exportPlanId,
        driver: data.driver,
        exportEmployee: data.exportEmployee,
        time: data.time,
        note: data.note,
        warehouseId: warehouseId[0],
      });
      await ref.child(String(exportId)).child('list').set(listGoods);
      this.postNoti(
        listType,
        listFabricId,
        0,
        data.time,
        data.exportEmployee,
        warehouseId[0],
      );
      let count = 0;
      let capacityEachType = 0;
      let capacityWarehouse = 0;
      let totalFabricNumber = 0;
      let fabricEach = [];
      ref = db.ref('/warehouse/' + warehouseId[0]);
      await ref.once('value', async function (snapshot) {
        capacityEachType = snapshot.val().capacityEachType;
        capacityWarehouse = snapshot.val().capacityWarehouse;
        for (let i = 0; i < snapshot.val().goods.length; i++) {
          let temp = snapshot.val().goods[i];
          if (temp)
            for (let j = 0; j < temp.length; j++) {
              if (temp[j] && temp[j].status == 'chưa bán') count++;
            }
        }
      });
      totalFabricNumber = count;
      console.log(listType);
      for (let i = 0; i < listType.length; i++) {
        count = 0;
        ref = db.ref('/warehouse/' + warehouseId[0] + '/goods/' + listType[i]);
        await ref.once('value', async function (snapshot) {
          for (let j = 0; j < snapshot.val().length; j++) {
            if (snapshot.val()[j])
              if (snapshot.val()[j].status == 'chưa bán') count++;
          }
        });
        fabricEach.push(count);
      }

      console.log(totalFabricNumber);
      console.log(fabricEach);
      console.log(listType);
      for (let i = 0; i < fabricEach.length; i++) {
        if (fabricEach[i] < capacityEachType * 0.2)
          this.postNotiWarning(
            0,
            listType[i],
            fabricEach[i],
            data.time,
            warehouseId[0],
            capacityEachType,
          );
      }
      if (totalFabricNumber < capacityWarehouse * 0.2)
        this.postNotiWarning(
          0,
          -1,
          totalFabricNumber,
          data.time,
          warehouseId[0],
          capacityWarehouse,
        );
      return 'Thành công';
    } else
      return 'Tạo phiếu xuất thất bại! Bạn đã nhập mã cây vải không còn lưu trữ trong kho (đã bán)! Vui lòng nhập lại!';
  }

  async checkLoginUser(logreq: object, res: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/user');
    const valArr = [];
    for (const val of Object.values(logreq)) {
      valArr.push(val);
    }
    let found = 0;
    let role = '';

    let reqdata: object;
    const token = jwt.sign({ password: valArr[1] }, 'qlkhoPriavteKey');
    await ref.once('value', function (snapshot) {
      if (snapshot.val()) {
        for (let i = 1; i < snapshot.val().length; i++) {
          if (
            snapshot.val()[i].username == valArr[0] &&
            snapshot.val()[i].password == valArr[1]
          ) {
            found = 1;
            role = snapshot.val()[i].role;
            reqdata = {
              userId: i,
              username: snapshot.val()[i].username,
              name: snapshot.val()[i].name,
              password: snapshot.val()[i].password,
              phone: snapshot.val()[i].phone,
              role: snapshot.val()[i].role,
              birthday: snapshot.val()[i].birthday,
              sex: snapshot.val()[i].sex,
              workAt: snapshot.val()[i].workAt,
              token: token,
            };
            break;
          }
        }
      }
    });
    const refAuthentication = db.ref('/Authentication');
    let tokenNumber = 0;
    const authenKey = [];
    await refAuthentication.once('value', function (snapshot) {
      if (snapshot.val()) {
        for (const key in snapshot.val()) authenKey.push(key);
      }
      console.log('authen', authenKey);
    });
    console.log('role', role);
    console.log('token', tokenNumber);
    console.log('username', valArr[0]);
    const child = ++authenKey[authenKey.length - 1];
    await refAuthentication.child(String(child)).set({
      username: Object(logreq).username,
      token: token,
      role: role,
    });
    if (found) {
      console.log('req', reqdata);
      return res.status(HttpStatus.OK).json({
        message: 'Hợp lệ',
        statusCode: '200',
        data: reqdata,
      });
    } else
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No found',
        statusCode: '400',
        data: reqdata,
      });
  }

  async logOutUser(logreq: object): Promise<any> {
    const db = admin.database();
    const refAuthentication = db.ref('/Authentication');
    if (Object(logreq).username && Object(logreq).token) {
      const keyAuthen = [];
      let count = 0;
      await refAuthentication.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyAuthen.push(key);
        }
        for (const val of Object.values(snapshot.val())) {
          if (
            Object(val).username === Object(logreq).username &&
            Object(val).token === Object(logreq).token
          ) {
            refAuthentication.child(String(keyAuthen[count])).remove();
          }
          count++;
        }
      });
    }
    return 'Không hợp lệ';
  }

  async getWarehouse(userInfo: any, res: any): Promise<any> {
    const db = admin.database();
    const userRef = db.ref('/user');
    const refAuthentication = db.ref('/Authentication');
    console.log(userInfo);
    const khoArray = [];
    const reqdata = [];

    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(userInfo).username &&
        val.token === Object(userInfo).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await userRef.once('value', function (snapshot) {
        for (const user of Object.values(snapshot.val())) {
          if (Object(user).username === Object(userInfo).username) {
            for (const khoId of Object.values(Object(user).workAt)) {
              khoArray.push(Object(khoId).khoId);
            }
            break;
          }
        }
      });
      for (const khoid of khoArray) {
        const ref = db.ref('/warehouse/' + khoid);
        await ref.once('value', function (snapshot) {
          if (snapshot.val()) {
            reqdata.push({
              key: khoid,
              name: snapshot.val().name,
              address: snapshot.val().address,
              square: snapshot.val().square,
              status: snapshot.val().status,
              capacityEachType: snapshot.val().capacityEachType,
              capacityWarehouse: snapshot.val().capacityWarehouse,
            });
          }
        });
      }

      return res.status(HttpStatus.OK).json({
        message: reqdata,
        statusCode: '200',
      });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized',
        statusCode: '401',
      });
    }
  }

  async getCustomer(reqData: any): Promise<any> {
    const db = admin.database();
    const customerList = [];
    const customerRef = db.ref('/customer');
    const refAuthentication = db.ref('/Authentication');
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await customerRef.once('value', function (snapshot) {
        for (const value of Object.values(snapshot.val())) {
          customerList.push(Object(value));
        }
      });
      return customerList;
    }
    return 'Không hợp lệ';
  }
  async getTotalProductNumberAndLength(reqData: any): Promise<any> {
    const refAuthentication = db.ref('/Authentication');
    const userRef = db.ref('/user');
    const snapshot = await refAuthentication.once('value');
    let isValid = false;
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    const khoList = [];
    if (isValid) {
      await userRef.once('value', function (snapshot) {
        for (const value of Object.values(snapshot.val())) {
          if (value) {
            if (Object(value).username == Object(reqData).username) {
              for (const val of Object(value).workAt) {
                if (val) {
                  khoList.push(val.khoId);
                }
              }
            }
          }
        }
      });
    }
    const returnValue = [];
    for (const val of khoList) {
      let totalNumber = 0;
      let totalLength = 0;
      const warehouseRef = db.ref('/warehouse/' + val + '/goods');
      await warehouseRef.once('value', function (snapshot) {
        if (snapshot.val()) {
          for (const value of Object.values(snapshot.val())) {
            if (value) {
              for (const item of Object.values(value)) {
                if (item) {
                  if (item.status === 'chưa bán') {
                    totalNumber++;
                    totalLength += Number(item.length);
                  }
                }
              }
            }
          }
        }
      });
      returnValue.push({
        kho: 'Kho ' + val,
        number: totalNumber,
        length: Math.round(totalLength * 100) / 100,
      });
    }
    return returnValue;
  }
  async getWarehouseTypeAndColor(reqData: any): Promise<any> {
    const id = 1;
    const username = 'kdat0310';
    const db = admin.database();
    const warehouseKey = [];
    const warehouseGoods = [];
    const warehouseRef = db.ref('/warehouse');
    const userRef = db.ref('/user');
    const refAuthentication = db.ref('/Authentication');
    const typeAndColorKey = [];
    const typeAndColorValue = [];
    const keyList = [];
    const khoList = [];
    let index = 0;
    const typeAndColorRef = db.ref('/TypeAndColor');
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });

    if (isValid) {
      await userRef.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      await userRef.once('value', function (snapshot) {
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (username === Object(value).username) {
              for (const kho of Object(value).workAt) {
                if (kho !== undefined && kho !== null) {
                  khoList.push(kho.khoId);
                }
              }
            }
            break;
            index++;
          }
        }
      });
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };
      let productKey = [];
      for (const val of khoList) {
        const ref = db.ref('/warehouse/' + val);
        productKey = [];
        let count = 0;
        await ref.once('value', async function (snapshot) {
          count = 0;
          if (
            snapshot.val().goods !== undefined &&
            snapshot.val().goods !== null
          ) {
            for (const key in snapshot.val().goods) {
              if (key) {
                productKey.push(key);
              }
            }
            let value: any;
            for (value of Object.values(snapshot.val().goods)) {
              if (value) {
                let countTemp = 0;
                value.forEach((item: any) => {
                  if (item.status === 'chưa bán') {
                    countTemp++;
                  }
                });
                warehouseGoods.push({
                  listGoods: value,
                  typeAndColor: findTypeAndColor(productKey[count]),
                  number: countTemp,
                  warehouseId: val,
                });
                count++;
              }
            }
          }
        });
      }

      return warehouseGoods;
    }
    return 'Không hợp lệ';
  }
  async getAllKho(): Promise<any> {
    const db = admin.database();
    const khoList = [];
    const keyList = [];
    let temp = 0;
    const customerRef = db.ref('/warehouse');
    await customerRef.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        if (key) {
          keyList.push(key);
        }
      }
      for (const value of Object.values(snapshot.val())) {
        //if (Object(value).status === 'Bình thường') {
        //console.log(Object(value).status);
        //console.log(keyList[temp]);
        khoList.push('Kho ' + keyList[temp]);
        //}
        temp++;
      }
    });
    return khoList;
  }

  async getAllKhoInformation(reqData: any): Promise<any> {
    const db = admin.database();
    const refAuthentication = db.ref('/Authentication');
    const returnVal = [];
    const keyList = [];
    let temp = 0;
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    const refWarehouse = db.ref('/warehouse');
    if (isValid) {
      await refWarehouse.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
        for (const value of Object.values(snapshot.val())) {
          returnVal.push({
            address: Object(value).address,
            status: Object(value).status,
            key: keyList[temp],
            name: Object(value).name,
          });
          temp++;
        }
      });
      return returnVal;
    }
    return 'Không hợp lệ';
  }

  async getProvider(reqData: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/Provider');
    const refAuthentication = db.ref('/Authentication');
    const resdata = [];
    console.log(typeof resdata, '123');
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await ref.once('value', function (snapshot) {
        for (const provider of snapshot.val()) {
          if (provider) {
            resdata.push(provider);
          }
        }
      });

      console.log(typeof resdata);
      return resdata;
    }
    return 'Không hợp lệ';
  }

  async getTypeAndColor(typeId: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/TypeAndColor');
    const resData = [];
    let temp = 0;
    const typeKeyList = [];

    await ref.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        typeKeyList.push(key);
      }
      console.log(typeKeyList);
      for (const type of Object.values(snapshot.val())) {
        if (typeId.id == typeKeyList[temp]) {
          resData.push({
            type: Object(type).type,
            color: Object(type).color,
          });
          break;
        }
        temp++;
      }
    });
    return resData;
  }
  async getAllTypeAndColor(): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/TypeAndColor');
    const resData = [];
    const typeKeyList = [];

    await ref.once('value', function (snapshot) {
      for (const type of Object.values(snapshot.val())) {
        resData.push({
          type: Object(type).type,
          color: Object(type).color,
        });
      }
    });
    return resData;
  }
  async getProductNumber(reqData: any): Promise<any> {
    const db = admin.database();
    const refAuthentication = db.ref('/Authentication');
    const resData = [];
    const goodKey = [];
    const countList = [];
    const returnData = [];
    let refTypeAndColor = db.ref('/TypeAndColor');
    let temp = 0;
    const refWarehouse = db.ref('/warehouse');
    const keyList = [];
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await refWarehouse.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
        for (const value of Object.values(snapshot.val())) {
          if (reqData.id == keyList[temp]) {
            resData.push(Object(value).goods);
            break;
          }
          temp++;
        }
      });
      for (const loop in resData[0]) {
        goodKey.push(loop);
      }
      if (resData[0] != null && resData[0] != undefined) {
        for (const loop of Object.values(resData[0])) {
          let count = 0;
          for (const value of Object.values(loop)) {
            if (Object(value).status === 'chưa bán') {
              count++;
            }
          }
          countList.push(count);
        }
      }

      await refTypeAndColor.once('value', function (snapshot) {
        let countType = 0;
        let keyIndex = 0;
        let stt = 1;
        const typeKeylist = [];
        for (const key in snapshot.val()) {
          typeKeylist.push(key);
        }
        for (const value of goodKey) {
          keyIndex = 0;
          for (const type of Object.values(snapshot.val())) {
            if (value == typeKeylist[keyIndex]) {
              returnData.push({
                stt: stt,
                fab: Object(type).type,
                color: Object(type).color,
                number: countList[countType],
              });
              stt++;
              countType++;
            }
            keyIndex++;
          }
          refTypeAndColor = db.ref('/TypeAndColor');
        }
      });
      return returnData;
    }
    return 'Không hợp lệ';
  }

  async getProductList(managerInfo: any): Promise<any> {
    const db = admin.database();
    const refUser = db.ref('/user');
    const refWarehouse = db.ref('/warehouse');
    const warehouseKeyList = [];
    const productList = [];
    let temp = 1;
    const listKho = [];
    await refUser.once('value', function (snapshot) {
      for (const user of Object.values(snapshot.val())) {
        if (Object(user).username === managerInfo.username) {
          for (const kho of Object(user).workAt) {
            console.log(kho);
            console.log('khoid', Object(kho).khoId);
            if (Object(kho).khoId != undefined && Object(kho).khoId != null) {
              listKho.push(Object(kho).khoId);
            }
          }
          break;
        }
      }
    });
    console.log(listKho);
    await refWarehouse.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        warehouseKeyList.push(key);
      }
      console.log('whkList', warehouseKeyList);
      for (const kho of listKho) {
        temp = 0;
        for (const value of Object.values(snapshot.val())) {
          console.log('kho', kho);
          console.log('khokey', warehouseKeyList[temp]);
          if (
            kho == warehouseKeyList[temp] &&
            value !== undefined &&
            value != null
          ) {
            productList.push(Object(value).goods);
            break;
          }
          temp++;
        }
      }
    });
    console.log(productList);
    return productList;
  }

  async postOrder(orderInfo: any, res: any): Promise<any> {
    console.log('order', orderInfo);
    const db = admin.database();
    const ref = db.ref('/order');
    const refExportPlan = db.ref('/exportPlan');
    const refProvider = db.ref('/Provider');
    const refUser = db.ref('/user');
    const refWarehouse = db.ref('/warehouse');
    let refTypeAndColor = db.ref('/TypeAndColor');
    const refAuthentication = db.ref('/Authentication');
    const userWarehouseList = [];
    const userListKey = [];
    const providerListKey = [];
    const typeListKey = [];
    let provId = 0;
    let userId = 0;
    let temp = 1;
    let available = 0;
    let childNumber: number, typeNumber: any;
    const listOfGood = [];
    // await ref.once('value', function (snapshot) {
    //   for (const key in snapshot.val()) {
    //     console.log(key);
    //   }
    // });
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(orderInfo).username &&
        val.token === Object(orderInfo).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const addNewType = async () => {
        for (const element of Object(orderInfo).listGoods) {
          if (element) {
            await refTypeAndColor.once('value', function (snapshot) {
              typeNumber = snapshot.numChildren();
              available = 0;
              for (const value of Object.values(snapshot.val())) {
                if (
                  Object(value).type === Object(element).kind &&
                  Object(value).color === Object(element).color
                ) {
                  available = 1;
                  break;
                }
              }
              if (available == 0) {
                refTypeAndColor.child(typeNumber + 1).set({
                  type: Object(element).kind,
                  color: Object(element).color,
                });
              }
            });
          }
        }
      };
      await addNewType();
      await refTypeAndColor.once('value', function (snapshot) {
        temp = 1;
        let count = 0;
        for (const key in snapshot.val()) {
          typeListKey.push(key);
        }
        for (const value of Object(orderInfo).listGoods) {
          count = 0;
          for (const snap of Object(snapshot.val())) {
            if (
              Object(snap).type === Object(value).kind &&
              Object(snap).color === Object(value).color
            ) {
              listOfGood.push({
                typeId: Number(typeListKey[count - 1]),
                number: Number(Object(value).number),
              });
            }
            count++;
          }
          refTypeAndColor = db.ref('/TypeAndColor');
        }
      });

      await refUser.once('value', function (snapshot) {
        temp = 0;
        for (const key in snapshot.val()) {
          userListKey.push(key);
        }
        for (const value of Object.values(snapshot.val())) {
          if (
            Object(value).name === Object(orderInfo).name &&
            Object(value).username === Object(orderInfo).username
          ) {
            userId = userListKey[temp];
            for (const item of Object(value).workAt) {
              if (item) {
                userWarehouseList.push(item.khoId);
              }
            }
          }
          temp++;
        }
      });
      const getProviderId = async () => {
        if (Object(orderInfo).reason === 'Mua hàng') {
          await refProvider.once('value', function (snapshot) {
            temp = 0;
            for (const key in snapshot.val()) {
              providerListKey.push(key);
            }
            for (const value of Object.values(snapshot.val())) {
              if (Object(value).name === Object(orderInfo).providerName) {
                provId = providerListKey[temp];
              }
              temp++;
            }
          });
        } else if (Object(orderInfo).reason === 'Chuyển kho') {
          const refWarehouseList = await refWarehouse.once('value');
          refWarehouseList.forEach((child) => {
            const val = child.val();
            const key = child.key;
            if (Object(val).name === Object(orderInfo).providerName) {
              provId = Number(key);
            }
          });
        }
      };
      await getProviderId();
      if (
        Object(orderInfo).reason == 'Chuyển kho' &&
        userWarehouseList.indexOf(Number(provId)) == -1
      ) {
        await ref.once('value', function (snapshot) {
          childNumber = snapshot.numChildren();
        });
        await ref.child(String(childNumber + 1)).set({
          providerId: Number(provId),
          manageId: Number(userId),
          reason: Object(orderInfo).reason,
          time: Object(orderInfo).time,
          status: 'chưa duyệt',
          warehouseId: Number(Object(orderInfo).khoId),
          listGoods: listOfGood,
        });
      } else {
        await ref.once('value', function (snapshot) {
          childNumber = snapshot.numChildren();
        });
        await ref.child(String(childNumber + 1)).set({
          providerId: Number(provId),
          manageId: Number(userId),
          reason: Object(orderInfo).reason,
          time: Object(orderInfo).time,
          status: 'chưa xong',
          warehouseId: Number(Object(orderInfo).khoId),
          listGoods: listOfGood,
        });
      }

      if (
        Object(orderInfo).reason == 'Chuyển kho' &&
        userWarehouseList.indexOf(Number(provId)) != -1
      ) {
        await refExportPlan.once('value', function (snapshot) {
          childNumber = snapshot.numChildren();
        });
        await refExportPlan.child(String(childNumber + 1)).set({
          customerId: Number(Object(orderInfo).khoId),
          manageId: Number(userId),
          reason: Object(orderInfo).reason,
          time: Object(orderInfo).time,
          warehouseId: Number(provId),
          status: 'chưa xong',
          listGoods: listOfGood,
        });
      }
      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: {
          providerId: Number(provId),
          manageId: Number(userId),
          reason: Object(orderInfo).reason,
          time: Object(orderInfo).time,
          warehouseId: Number(Object(orderInfo).khoId),
          listGoods: listOfGood,
        },
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không hợp lệ',
      statusCode: '401',
    });
  }
  async approveOrder(reqData: any, res: any): Promise<any> {
    const refAuthentication = db.ref('/Authentication');
    const refExportPlan = db.ref('exportPlan');
    const userRef = db.ref('/user');
    const userKey = [];
    const userList = [];
    await userRef.once('value', function (snapshot) {
      let count = 0;
      for (const key in snapshot.val()) {
        userKey.push(key);
      }
      for (const value of Object(snapshot.val())) {
        if (value != undefined && value != null) {
          userList.push({
            id: userKey[count],
            username: Object(value).username,
          });
          count++;
        }
      }
    });
    const findUserId = (userId: any) => {
      for (const value of userList) {
        console.log(value);
        if (userId == Object(value).username) {
          return Object(value).id;
        }
      }
    };
    let isValid = false;

    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const refOrder = db.ref('/order');
      const orderRef = refOrder.child(Object(reqData).id);
      orderRef.update({
        status: 'chưa xong',
      });
      let childNumber: number;
      await refExportPlan.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });
      const tempGoods = Object(reqData).data.listGoods.map((item: any) => {
        return {
          typeId: item.typeId,
          number: item.number,
        };
      });
      await refExportPlan.child(String(childNumber + 1)).set({
        customerId: Object(reqData).data.providerId,
        manageId: Number(findUserId(Object(reqData).username)),
        reason: Object(reqData).data.reason,
        time: Object(reqData).time,
        status: 'chưa xong',
        warehouseId: Object(reqData).data.warehouseId,
        listGoods: tempGoods,
      });
      return res.status(HttpStatus.OK).json({
        message: 'Successfully approve',
        statusCode: '200',
      });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorize to perform this action',
        statusCode: '401',
      });
    }
  }

  async disapproveOrder(reqData: any, res: any): Promise<any> {
    const refAuthentication = db.ref('/Authentication');
    let isValid = false;
    console.log(reqData);
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const refOrder = db.ref('/order');
      const orderRef = refOrder.child(Object(reqData).id);
      orderRef.update({
        status: 'không được duyệt',
      });
      return res.status(HttpStatus.OK).json({
        message: 'Successfully disapprove',
        statusCode: '200',
      });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorize to perform this action',
        statusCode: '401',
      });
    }
  }

  async approveExportPlan(reqData: any, res: any): Promise<any> {
    const refAuthentication = db.ref('/Authentication');
    const userRef = db.ref('/user');
    const orderRef = db.ref('/order');
    const userKey = [];
    const userList = [];
    await userRef.once('value', function (snapshot) {
      let count = 0;
      for (const key in snapshot.val()) {
        userKey.push(key);
      }
      for (const value of Object(snapshot.val())) {
        if (value != undefined && value != null) {
          userList.push({
            id: userKey[count],
            username: Object(value).username,
          });
          count++;
        }
      }
    });
    const findUserId = (userId: any) => {
      for (const value of userList) {
        console.log(value);
        if (userId == Object(value).username) {
          return Object(value).id;
        }
      }
    };
    let isValid = false;
    console.log(reqData);
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const refExportPlan = db.ref('/exportPlan');
      const exportPlanRef = refExportPlan.child(Object(reqData).id);
      exportPlanRef.update({
        status: 'chưa xong',
      });
      let childNumber: number;
      await orderRef.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });
      const tempGoods = Object(reqData).data.listGoods.map((item: any) => {
        return {
          typeId: item.typeId,
          number: item.number,
        };
      });
      await orderRef.child(String(childNumber + 1)).set({
        providerId: Object(reqData).data.warehouseId,
        manageId: Number(findUserId(Object(reqData).username)),
        reason: Object(reqData).data.reason,
        time: Object(reqData).time,
        status: 'chưa xong',
        warehouseId: Object(reqData).data.customerId,
        listGoods: tempGoods,
      });
      return res.status(HttpStatus.OK).json({
        message: 'Successfully approve',
        statusCode: '200',
      });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorize to perform this action',
        statusCode: '401',
      });
    }
  }

  async disapproveExportPlan(reqData: any, res: any): Promise<any> {
    const refAuthentication = db.ref('/Authentication');
    let isValid = false;
    console.log(reqData);
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const refExportPlan = db.ref('/exportPlan');
      const exportPlanRef = refExportPlan.child(Object(reqData).id);
      exportPlanRef.update({
        status: 'không được duyệt',
      });
      return res.status(HttpStatus.OK).json({
        message: 'Successfully disapprove',
        statusCode: '200',
      });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorize to perform this action',
        statusCode: '401',
      });
    }
  }
  async checkCapacityOrder(reqData: any, res: any): Promise<any> {
    const refAuthentication = db.ref('/Authentication');
    const refWarehouse = db.ref('/warehouse/1/goods');
    const refWarehouseCapacity = db.ref('/warehouse/1/capacityWarehouse');
    let warehouseCapacity = 0;
    await refWarehouseCapacity.once('value', function (snapshot) {
      warehouseCapacity = snapshot.val();
    });
    let totalNumber = 0;
    let isValid = false;
    console.log(reqData);
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await refWarehouse.once('value', function (snapshot) {
        for (const value of snapshot.val()) {
          if (value) {
            for (const item of value) {
              if (item) {
                if (item.status == 'chưa bán') {
                  totalNumber++;
                }
              }
            }
          }
        }
      });
      if (totalNumber + Object(reqData).number <= warehouseCapacity) {
        return res.status(HttpStatus.OK).json({
          message: 'Able to add',
          statusCode: '200',
        });
      } else {
        return res.status(HttpStatus.OK).json({
          message: 'Unable to add',
          statusCode: '200',
        });
      }
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorize to perform this action',
        statusCode: '401',
      });
    }
  }
  async getOrder(reqData: any, res: any): Promise<any> {
    const db = admin.database();
    const userRef = db.ref('/user');
    const orderRef = db.ref('/order');
    const providerRef = db.ref('/Provider');
    const refAuthentication = db.ref('/Authentication');
    const warehouseRef = db.ref('/warehouse');
    const keyList = [];
    const orderList = [];
    const providerKey = [];
    const warehouseList = [];
    let index = 0;
    const providerList = [];
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      let khoWorking = [];
      await userRef.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      await userRef.once('value', function (snapshot) {
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (reqData.username === Object(value).username) {
              khoWorking = Object(value).workAt;
              break;
            }
            index++;
          }
        }
      });
      const khoList = khoWorking.map((item) => {
        if (item) {
          return item.khoId;
        }
      });
      await providerRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          providerKey.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            providerList.push({
              id: providerKey[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });
      const findProviderName = (provId: any) => {
        const returnValue = '';
        for (const value of providerList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      await warehouseRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          warehouseList.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            warehouseList.push({
              id: warehouseList[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });

      const findWarehouseName = (provId: any) => {
        const returnValue = '';
        for (const value of warehouseList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };

      const handleData = async () => {
        await orderRef.once('value', async function (snapshot) {
          const cloneArr = snapshot.val().map((item: any) => {
            return item;
          });
          const tempKey = [];
          let tempCount = 0;
          for (const key in cloneArr) {
            tempKey.push(key);
          }
          console.log(tempKey);
          for (const value of Object(cloneArr)) {
            if (value != null && value != undefined) {
              if (
                khoList.indexOf(Object(value).warehouseId) != -1 &&
                Object(value).status != 'chưa duyệt' &&
                Object(value).status != 'không được duyệt'
              ) {
                const tempArray = Object(value).listGoods.map(
                  (item: any) => item,
                );

                const handleData = async () => {
                  const handleAdd = async () => {
                    for (const temp of Object(tempArray)) {
                      if (temp != undefined && temp != null) {
                        temp.typeAndColor = findTypeAndColor(temp.typeId);
                      }
                    }
                  };
                  await handleAdd();
                };
                handleData();
                if (Object(value).reason === 'Mua hàng') {
                  console.log('mua', tempKey[tempCount], Object(value).time);
                  orderList.push({
                    id: tempKey[tempCount],
                    listGoods: Object(value).listGoods,
                    reason: Object(value).reason,
                    manageId: Object(value).manageId,
                    providerId: Object(value).providerId,
                    status: Object(value).status,
                    providerName: findProviderName(Object(value).providerId),
                    time: Object(value).time,
                    warehouseId: Object(value).warehouseId,
                    warehouseName: findWarehouseName(Object(value).warehouseId),
                  });
                } else if (Object(value.reason) == 'Chuyển kho') {
                  console.log('chuyen', tempKey[tempCount]);
                  orderList.push({
                    id: tempKey[tempCount],
                    listGoods: Object(value).listGoods,
                    reason: Object(value).reason,
                    manageId: Object(value).manageId,
                    providerId: Object(value).providerId,
                    status: Object(value).status,
                    providerName: findWarehouseName(Object(value).providerId),
                    time: Object(value).time,
                    warehouseId: Object(value).warehouseId,
                    warehouseName: findWarehouseName(Object(value).warehouseId),
                  });
                }
              }
              tempCount++;
            }
          }
        });
      };
      await handleData();

      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: orderList,
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không có quyền thực hiện',
      statusCode: '401',
    });
  }

  async getUnapprovalOrder(reqData: any, res: any): Promise<any> {
    const db = admin.database();
    const userRef = db.ref('/user');
    const orderRef = db.ref('/order');
    const providerRef = db.ref('/Provider');
    const refAuthentication = db.ref('/Authentication');
    const warehouseRef = db.ref('/warehouse');
    const keyList = [];
    const orderList = [];
    const providerKey = [];
    const warehouseList = [];
    let index = 0;
    const providerList = [];
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      let khoWorking = [];
      await userRef.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      await userRef.once('value', function (snapshot) {
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (reqData.username === Object(value).username) {
              khoWorking = Object(value).workAt;
              break;
            }
            index++;
          }
        }
      });
      const khoList = khoWorking.map((item) => {
        if (item) {
          return item.khoId;
        }
      });
      await warehouseRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          warehouseList.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            warehouseList.push({
              id: warehouseList[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });

      const findWarehouseName = (provId: any) => {
        const returnValue = '';
        for (const value of warehouseList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };

      const handleData = async () => {
        await orderRef.once('value', async function (snapshot) {
          const cloneArr = snapshot.val().map((item: any) => {
            return item;
          });
          const tempKey = [];
          let tempCount = 0;
          for (const key in cloneArr) {
            tempKey.push(key);
          }
          console.log(tempKey);
          for (const value of Object(cloneArr)) {
            if (value != null && value != undefined) {
              if (
                khoList.indexOf(Object(value).providerId) != -1 &&
                Object(value).reason == 'Chuyển kho' &&
                Object(value).status == 'chưa duyệt'
              ) {
                const tempArray = Object(value).listGoods.map(
                  (item: any) => item,
                );

                const handleData = async () => {
                  const handleAdd = async () => {
                    for (const temp of Object(tempArray)) {
                      if (temp != undefined && temp != null) {
                        temp.typeAndColor = findTypeAndColor(temp.typeId);
                      }
                    }
                  };
                  await handleAdd();
                };
                handleData();
                orderList.push({
                  id: tempKey[tempCount],
                  listGoods: Object(value).listGoods,
                  reason: Object(value).reason,
                  manageId: Object(value).manageId,
                  warehouseId: Object(value).providerId,
                  warehouseName: findWarehouseName(Object(value).providerId),
                  status: Object(value).status,
                  providerName: findWarehouseName(Object(value).warehouseId),
                  time: Object(value).time,
                  providerId: Object(value).warehouseId,
                });
              }

              tempCount++;
            }
          }
        });
      };
      await handleData();

      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: orderList,
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không có quyền thực hiện',
      statusCode: '401',
    });
  }
  async getImport(reqData: any, res: any): Promise<any> {
    const db = admin.database();
    const userRef = db.ref('/user');
    const importRef = db.ref('/import');
    const refAuthentication = db.ref('/Authentication');
    const keyList = [];
    const providerKey = [];
    const warehouseList = [];
    const warehouseRef = db.ref('/warehouse');
    const khoList = [];
    let index = 0;
    const providerList = [];
    const snapshot = await refAuthentication.once('value');
    let isValid = false;
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await userRef.once('value', function (snapshot) {
        for (const value of Object.values(snapshot.val())) {
          if (value) {
            if (Object(value).username == Object(reqData).username) {
              for (const val of Object(value).workAt) {
                if (val) {
                  khoList.push(val.khoId);
                }
              }
            }
          }
        }
      });
      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };
      const userKey = [];
      const userList = [];
      await userRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          userKey.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            userList.push({
              id: userKey[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });
      const findUserName = (userId: any) => {
        for (const value of userList) {
          if (userId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      await warehouseRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          warehouseList.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            warehouseList.push({
              id: warehouseList[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });

      const findWarehouseName = (provId: any) => {
        const returnValue = '';
        for (const value of warehouseList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      const importList = [];
      const importKey = [];
      let count = 0;
      const snapshotImport = await importRef.once('value');
      snapshotImport.forEach((child) => {
        importKey.push(child.key);
      });
      let countTemp = 0;
      for (const index of importKey) {
        const value = snapshotImport.child(index).val();

        const goodsKeyList = [];
        let count = 0;
        if (khoList.indexOf(Object(value).warehouseId) !== -1) {
          const listGoodsList = [];
          if (Object(value).listGoods) {
            for (const key in Object(value).listGoods) {
              goodsKeyList.push(key);
            }
            const refListGoods = db.ref(
              '/import/' + importKey[countTemp] + '/listGoods',
            );
            await refListGoods.once('value', function (snapshotRef) {
              let item: any;
              for (item of Object.values(snapshotRef.val())) {
                if (item) {
                  console.log('item', item);
                  const tempItem = item.filter((n: any) => n);
                  listGoodsList.push({
                    typeAndColor: findTypeAndColor(goodsKeyList[count]),
                    listGoods: tempItem,
                    number: tempItem.length,
                  });
                }
                count++;
              }
            });
          }
          // console.log('test 1', listGoodsList);
          if (listGoodsList !== []) {
            importList.push({
              listGoods: listGoodsList,
              driver: Object(value).driver,
              userId: Object(value).importEmployee,
              name: findUserName(Object(value).importEmployee),
              orderId: Object(value).orderId,
              warehouseId: Object(value).warehouseId,
              warehouseName: findWarehouseName(Object(value).warehouseId),
              time: Object(value).time,
              note: Object(value).note,
            });
          }
          // console.log('test 2', importList);
        }
        countTemp++;
      }
      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: importList,
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không hợp lệ',
      statusCode: '401',
    });
  }

  async getExport(reqData: any, res: any): Promise<any> {
    const username = 'kdat0310';
    const db = admin.database();
    const userRef = db.ref('/user');
    const exportRef = db.ref('/export');
    const refAuthentication = db.ref('/Authentication');
    const warehouseList = [];
    const warehouseRef = db.ref('/warehouse');
    const khoList = [];
    let index = 0;

    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await userRef.once('value', function (snapshot) {
        for (const value of Object.values(snapshot.val())) {
          if (value) {
            if (Object(value).username == reqData.username) {
              for (const val of Object(value).workAt) {
                if (val) khoList.push(val.khoId);
              }
            }
          }
        }
      });
      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };
      const userKey = [];
      const userList = [];
      await userRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          userKey.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            userList.push({
              id: userKey[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });
      const findUserName = (userId: any) => {
        const returnValue = '';
        for (const value of userList) {
          if (userId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      await warehouseRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          warehouseList.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            warehouseList.push({
              id: warehouseList[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });

      const findWarehouseName = (provId: any) => {
        const returnValue = '';
        for (const value of warehouseList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      const productList = [];
      for (const value of khoList) {
        const refWarehouse = db.ref('/warehouse/' + value);

        await refWarehouse.once('value', function (snapshot) {
          productList.push({
            warehouseId: value,
            listGoods: snapshot.val().goods,
          });
        });
      }
      const findFabricLength = (warehouse: any, typeId: any, id: any) => {
        const keyList = [];
        for (const value of productList) {
          if (value) {
            if (value.warehouseId == warehouse) {
              for (const key in value.listGoods) {
                keyList.push(key);
              }
              let item: any;
              for (item of keyList) {
                if (typeId == item) {
                  if (value.listGoods[item][id].length)
                    return {
                      length: value.listGoods[item][id].length,
                      lotNumber: value.listGoods[item][id].lotNumber,
                    };
                }
              }
            }
          }
        }
      };
      const exportList = [];
      const exportKey = [];
      let count = 0;
      const snapshotExport = await exportRef.once('value');
      snapshotExport.forEach((child) => {
        exportKey.push(child.key);
      });
      console.log(exportKey);
      let countTemp = 0;
      for (const index of exportKey) {
        const value = snapshotExport.child(index).val();

        const goodsKeyList = [];
        let count = 0;
        if (khoList.indexOf(Object(value).warehouseId) !== -1) {
          const listGoodsList = [];
          if (Object(value).list) {
            for (const key in Object(value).list) {
              goodsKeyList.push(key);
            }
            console.log(goodsKeyList);
            console.log('countTemp', countTemp);
            const refListGoods = db.ref(
              '/export/' + exportKey[countTemp] + '/list',
            );
            await refListGoods.once('value', function (snapshot) {
              let item: any;
              for (item of Object.values(snapshot.val())) {
                if (item) {
                  const tempItem = item.filter((n: any) => n);
                  for (const item of tempItem) {
                    // console.log('item', item, goodsKeyList[count]);
                    const temp = findFabricLength(
                      Object(value).warehouseId,
                      goodsKeyList[count],
                      item.fabricId,
                    );
                    if (temp) {
                      item.length = temp.length;
                      item.lotNumber = temp.lotNumber;
                    }
                  }
                  listGoodsList.push({
                    typeAndColor: findTypeAndColor(goodsKeyList[count]),
                    listGoods: tempItem,
                    number: tempItem.length,
                  });
                }
                count++;
              }
            });
          }
          if (listGoodsList !== []) {
            exportList.push({
              listGoods: listGoodsList,
              driver: Object(value).driver,
              userId: Object(value).exportEmployee,
              name: findUserName(Object(value).exportEmployee),
              exportPlanId: Object(value).exportPlanId,
              warehouseId: Object(value).warehouseId,
              warehouseName: findWarehouseName(Object(value).warehouseId),
              time: Object(value).time,
              note: Object(value).note,
            });
          }
        }
        countTemp++;
      }

      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: exportList,
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không hợp lệ',
      statusCode: '401',
    });
  }
  // lấy danh sách kế hoạch xuất theo của quản lý
  async getManagerExportPlans(reqData: any, res: any): Promise<any> {
    const username = 'kdat0310';
    const db = admin.database();
    const userRef = db.ref('/user');
    const exportPlanRef = db.ref('/exportPlan');
    const customerRef = db.ref('/customer');
    const refAuthentication = db.ref('/Authentication');
    const keyList = [];
    const exportPlanList = [];
    const warehouseRef = db.ref('/warehouse');
    const customerKey = [];
    const warehouseList = [];
    let index = 0;
    const customerList = [];
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      let khoWorking = [];
      await userRef.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      await userRef.once('value', function (snapshot) {
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (reqData.username === Object(value).username) {
              khoWorking = Object(value).workAt;
              break;
            }
            index++;
          }
        }
      });
      const khoList = khoWorking.map((item) => {
        if (item) {
          return item.khoId;
        }
      });
      await customerRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          customerKey.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            customerList.push({
              id: customerKey[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });
      const findcustomerName = (provId: any) => {
        for (const value of customerList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };

      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };
      await warehouseRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          warehouseList.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            warehouseList.push({
              id: warehouseList[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });

      const findWarehouseName = (provId: any) => {
        const returnValue = '';
        for (const value of warehouseList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      await exportPlanRef.once('value', function (snapshot) {
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (
              khoList.indexOf(Object(value).warehouseId) != -1 &&
              Object(value).status != 'chưa duyệt' &&
              Object(value).status != 'không được duyệt'
            ) {
              const tempArray = Object(value).listGoods.map(
                (item: any) => item,
              );

              const handleData = async () => {
                const handleAdd = async () => {
                  for (const temp of Object(tempArray)) {
                    if (temp != undefined && temp != null) {
                      temp.typeAndColor = findTypeAndColor(temp.typeId);
                    }
                  }
                };
                await handleAdd();
              };
              handleData();
              if (Object(value).reason === 'Bán hàng') {
                exportPlanList.push({
                  listGoods: Object(value).listGoods,
                  reason: Object(value).reason,
                  manageId: Object(value).manageId,
                  customerId: Object(value).customerId,
                  status: Object(value).status,
                  customerName: findcustomerName(Object(value).customerId),
                  time: Object(value).time,
                  warehouseId: Object(value).warehouseId,
                  warehouseName: findWarehouseName(Object(value).warehouseId),
                });
              } else if (Object(value).reason === 'Chuyển kho') {
                exportPlanList.push({
                  listGoods: Object(value).listGoods,
                  reason: Object(value).reason,
                  manageId: Object(value).manageId,
                  customerId: Object(value).customerId,
                  status: Object(value).status,
                  customerName: findWarehouseName(Object(value).customerId),
                  time: Object(value).time,
                  warehouseId: Object(value).warehouseId,
                  warehouseName: findWarehouseName(Object(value).warehouseId),
                });
              }
            }
          }
        }
      });
      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: exportPlanList,
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không có quyền lấy thông tin!',
      statusCode: '401',
    });
  }
  async getUnapprovalExportPlan(reqData: any, res: any): Promise<any> {
    const username = 'kdat0310';
    const db = admin.database();
    const userRef = db.ref('/user');
    const exportPlanRef = db.ref('/exportPlan');
    const warehouseRef = db.ref('/warehouse');
    const customerRef = db.ref('/customer');
    const refAuthentication = db.ref('/Authentication');
    const keyList = [];
    const exportPlanList = [];
    const warehouseList = [];
    const customerKey = [];
    let index = 0;
    const customerList = [];
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      let khoWorking = [];
      await userRef.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      await userRef.once('value', function (snapshot) {
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (reqData.username === Object(value).username) {
              khoWorking = Object(value).workAt;
              break;
            }
            index++;
          }
        }
      });
      const khoList = khoWorking.map((item) => {
        if (item) {
          return item.khoId;
        }
      });

      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };

      await warehouseRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          warehouseList.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != undefined && value != null) {
            warehouseList.push({
              id: warehouseList[count],
              name: Object(value).name,
            });
            count++;
          }
        }
      });

      const findWarehouseName = (provId: any) => {
        const returnValue = '';
        for (const value of warehouseList) {
          if (provId == Object(value).id) {
            return Object(value).name;
          }
        }
      };
      await exportPlanRef.once('value', function (snapshot) {
        const tempKey = [];
        let tempCount = 0;
        for (const key in snapshot.val()) {
          tempKey.push(key);
        }
        for (const value of Object(snapshot.val())) {
          if (value != null && value != undefined) {
            if (
              khoList.indexOf(Object(value).customerId) != -1 &&
              Object(value).status == 'chưa duyệt'
            ) {
              const tempArray = Object(value).listGoods.map(
                (item: any) => item,
              );

              const handleData = async () => {
                const handleAdd = async () => {
                  for (const temp of Object(tempArray)) {
                    if (temp != undefined && temp != null) {
                      temp.typeAndColor = findTypeAndColor(temp.typeId);
                    }
                  }
                };
                await handleAdd();
              };
              handleData();

              exportPlanList.push({
                id: tempKey[tempCount],
                listGoods: Object(value).listGoods,
                reason: Object(value).reason,
                manageId: Object(value).manageId,
                customerId: Object(value).customerId,
                status: Object(value).status,
                customerName: findWarehouseName(Object(value).customerId),
                time: Object(value).time,
                warehouseId: Object(value).warehouseId,
                warehouseName: findWarehouseName(Object(value).warehouseId),
              });
            }
            tempCount++;
          }
        }
      });
      return res.status(HttpStatus.OK).json({
        message: 'Thành công',
        statusCode: '200',
        data: exportPlanList,
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Không có quyền lấy thông tin!',
      statusCode: '401',
    });
  }
  // Tạo phiếu kế hoạch xuất hàng (quản lý)
  async postExportPlan(exportPlanInfo: any, res: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/exportPlan');
    const refOrder = db.ref('/order');
    const refCustomer = db.ref('/customer');
    const refUser = db.ref('/user');
    const refWarehouse = db.ref('/warehouse');
    let refTypeAndColor = db.ref('/TypeAndColor');
    const userListKey = [];
    const customerListKey = [];
    const typeListKey = [];
    const userWarehouseList = [];
    let reason = '';
    let customerId = 0;
    let userId = 0;
    let temp = 1;
    let childNumber: number, typeNumber: any;
    const listOfGood = [];
    if (Object(exportPlanInfo).reason === 'ban') {
      reason = 'Bán hàng';
    } else {
      reason = 'Chuyển kho';
    }
    await refTypeAndColor.once('value', function (snapshot) {
      temp = 1;
      let count = 0;
      for (const key in snapshot.val()) {
        typeListKey.push(key);
      }
      for (const value of Object(exportPlanInfo).listGoods) {
        count = 0;
        for (const snap of Object(snapshot.val())) {
          if (
            Object(snap).type === Object(value).kind &&
            Object(snap).color === Object(value).color
          ) {
            listOfGood.push({
              typeId: Number(typeListKey[count - 1]),
              number: Number(Object(value).number),
            });
          }
          count++;
        }
        refTypeAndColor = db.ref('/TypeAndColor');
      }
    });

    await refUser.once('value', function (snapshot) {
      temp = 0;
      for (const key in snapshot.val()) {
        userListKey.push(key);
      }
      for (const value of Object.values(snapshot.val())) {
        if (
          Object(value).name === Object(exportPlanInfo).name &&
          Object(value).username === Object(exportPlanInfo).username
        ) {
          userId = userListKey[temp];
          for (const item of Object(value).workAt) {
            if (item) {
              userWarehouseList.push(item.khoId);
            }
          }
        }
        temp++;
      }
    });
    const getCustomerId = async () => {
      if (Object(exportPlanInfo).reason === 'Bán hàng') {
        await refCustomer.once('value', function (snapshot) {
          temp = 0;
          for (const key in snapshot.val()) {
            customerListKey.push(key);
          }
          for (const value of Object.values(snapshot.val())) {
            if (Object(value).name === Object(exportPlanInfo).customerName) {
              customerId = customerListKey[temp];
            }
            temp++;
          }
        });
      } else if (Object(exportPlanInfo).reason === 'Chuyển kho') {
        const refWarehouseList = await refWarehouse.once('value');
        refWarehouseList.forEach((child) => {
          const val = child.val();
          const key = child.key;
          if (Object(val).name === Object(exportPlanInfo).customerName) {
            customerId = Number(key);
          }
        });
      }
    };
    await getCustomerId();
    if (
      Object(exportPlanInfo).reason == 'Chuyển kho' &&
      userWarehouseList.indexOf(Number(customerId)) == -1
    ) {
      await ref.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });
      await ref.child(String(childNumber + 1)).set({
        customerId: Number(customerId),
        manageId: Number(userId),
        reason: Object(exportPlanInfo).reason,
        time: Object(exportPlanInfo).time,
        status: 'chưa duyệt',
        warehouseId: Number(Object(exportPlanInfo).khoId),
        listGoods: listOfGood,
      });
    } else {
      await ref.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });
      await ref.child(String(childNumber + 1)).set({
        customerId: Number(customerId),
        manageId: Number(userId),
        reason: Object(exportPlanInfo).reason,
        time: Object(exportPlanInfo).time,
        status: 'chưa xong',
        warehouseId: Number(Object(exportPlanInfo).khoId),
        listGoods: listOfGood,
      });
    }
    if (
      Object(exportPlanInfo).reason == 'Chuyển kho' &&
      userWarehouseList.indexOf(Number(customerId) != -1)
    ) {
      await refOrder.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });
      await refOrder.child(String(childNumber + 1)).set({
        providerId: Number(Object(exportPlanInfo).khoId),
        manageId: Number(userId),
        reason: Object(exportPlanInfo).reason,
        time: Object(exportPlanInfo).time,
        warehouseId: Number(customerId),
        status: 'chưa xong',
        listGoods: listOfGood,
      });
    }

    return res.status(HttpStatus.OK).json({
      message: 'Thành công',
      statusCode: '200',
      data: {
        customerId: Number(customerId),
        manageId: Number(userId),
        reason: Object(exportPlanInfo).reason,
        time: Object(exportPlanInfo).time,
        warehouseId: Number(Object(exportPlanInfo).khoId),
        listGoods: listOfGood,
      },
    });
  }
  async postNewUser(newUserInformation: any, res: any): Promise<any> {
    const db = admin.database();
    const workAtList = [];
    let childNumber = 0;
    const refUser = db.ref('/user');
    const refAuthentication = db.ref('/Authentication');
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(newUserInformation).validUsername &&
        val.token === Object(newUserInformation).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      if (newUserInformation) {
        for (const value of Object(newUserInformation).workAt) {
          workAtList.push({ khoId: Number(value.key) });
        }
      }
      await refUser.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });
      console.log(childNumber);
      await refUser.child(String(childNumber + 1)).set({
        birthday: newUserInformation.dob,
        name: newUserInformation.name,
        password: '123456',
        phone: newUserInformation.phone,
        role: newUserInformation.role,
        sex: newUserInformation.sex,
        username: newUserInformation.username,
        workAt: workAtList,
      });
      console.log(workAtList);
      return res.status(HttpStatus.CREATED).json({
        message: 'Thành công tạo người dùng!',
        statusCode: '201',
        data: {
          birthday: newUserInformation.dob,
          name: newUserInformation.name,
          password: '123456',
          phone: newUserInformation.phone,
          sex: newUserInformation.sex,
          username: newUserInformation.username,
          workAt: workAtList,
        },
      });
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorize to perform this action',
      statusCode: '401',
    });
  }

  async postNewCustomer(newCustomerInformation: any, res: any): Promise<any> {
    const db = admin.database();
    const workAtList = [];
    let childNumber = 0;
    const refUser = db.ref('/user');
    const refAuthentication = db.ref('/Authentication');
    const snapshot = await refAuthentication.once('value');
    const refCustomer = db.ref('/customer');
    let isValid = false;

    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(newCustomerInformation).username &&
        val.token === Object(newCustomerInformation).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const keyList = [];
      await refCustomer.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      const child = ++keyList[keyList.length - 1];
      await refCustomer.child(String(child)).set({
        name: newCustomerInformation.name,
        address: newCustomerInformation.address,
        phone: newCustomerInformation.phoneNumber,
      });
      console.log(workAtList);
      return res.status(HttpStatus.CREATED).json({
        message: 'Thành công tạo người dùng!',
        statusCode: '201',
        data: {
          name: newCustomerInformation.name,
          address: newCustomerInformation.address,
          phone: newCustomerInformation.phoneNumber,
        },
      });
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorize to perform this action',
      statusCode: '401',
    });
  }

  async postNewProvider(newProviderInformation: any, res: any): Promise<any> {
    const db = admin.database();
    const workAtList = [];
    let childNumber = 0;
    const refUser = db.ref('/user');
    const refAuthentication = db.ref('/Authentication');
    const snapshot = await refAuthentication.once('value');
    let isValid = false;
    const refProvider = db.ref('/Provider');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(newProviderInformation).username &&
        val.token === Object(newProviderInformation).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const keyList = [];
      await refProvider.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      const child = ++keyList[keyList.length - 1];
      await refProvider.child(String(child)).set({
        name: newProviderInformation.name,
        address: newProviderInformation.address,
        phone: newProviderInformation.phoneNumber,
      });
      console.log(workAtList);
      return res.status(HttpStatus.CREATED).json({
        message: 'Thành công tạo người dùng!',
        statusCode: '201',
        data: {
          name: newProviderInformation.name,
          address: newProviderInformation.address,
          phone: newProviderInformation.phoneNumber,
        },
      });
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorize to perform this action',
      statusCode: '401',
    });
  }

  async postNewWarehouse(newWarehouseInformation: any, res: any): Promise<any> {
    const db = admin.database();
    const workAtList = [];
    const refUser = db.ref('/user');
    const refAuthentication = db.ref('/Authentication');
    const snapshot = await refAuthentication.once('value');
    let isValid = false;
    const refWarehouse = db.ref('/warehouse');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(newWarehouseInformation).username &&
        val.token === Object(newWarehouseInformation).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const keyList = [];
      await refWarehouse.once('value', function (snapshot) {
        for (const key in snapshot.val()) {
          keyList.push(key);
        }
      });
      const child = ++keyList[keyList.length - 1];
      let childNumber = 0;
      await refWarehouse.once('value', function (snapshot) {
        childNumber = snapshot.numChildren();
      });

      await refWarehouse.child(String(childNumber)).set({
        name: newWarehouseInformation.name,
        address: newWarehouseInformation.address,
        square: newWarehouseInformation.square,
        capacityWarehouse: newWarehouseInformation.capacityWarehouse,
        capacityEachType: '50',
        time: '8:00 - 21:00',
        goods: new Array(1).fill(0),
        status: 'Bình thường',
      });
      console.log(workAtList);
      return res.status(HttpStatus.CREATED).json({
        message: 'Thành công tạo kho!',
        statusCode: '201',
        data: {
          name: newWarehouseInformation.name,
          address: newWarehouseInformation.address,
          square: newWarehouseInformation.square,
          capacityWarehouse: newWarehouseInformation.capacityWarehouse,
          capacityEachType: '50',
          time: '8:00 - 21:00',
          goods: new Array(1).fill(0),
          status: 'Bình thường',
        },
      });
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorize to perform this action',
      statusCode: '401',
    });
  }

  async getAllUser(): Promise<any> {
    const userArr = [];
    const userRef = db.ref('/user');
    await userRef.once('value', function (snapshot) {
      for (const value of Object.values(snapshot.val())) {
        userArr.push(value);
      }
    });
    console.log(userArr);
    return userArr;
  }
  async changeUserInfor(userInfor: any): Promise<any> {
    console.log(userInfor);
    const userKey = [];
    const userRef = db.ref('/user');
    let count = 0;
    const workAt = [null];
    for (const value of userInfor.workAt) {
      console.log(value);
      workAt.push({ khoId: Number(value) });
    }
    console.log('dob', userInfor.dob);
    console.log(workAt);
    await userRef.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        userKey.push(key);
      }
      for (const value of Object.values(snapshot.val())) {
        if (Object(value).username === userInfor.username) {
          userRef.child(String(userKey[count])).set({
            birthday: userInfor.dob,
            name: userInfor.name,
            password: '123456',
            phone: userInfor.phone,
            sex: userInfor.sex,
            role: userInfor.role === 'qli' ? 'manager' : 'stockkeeper',
            username: userInfor.username,
            workAt: workAt,
          });
        }
        count++;
      }
    });

    return 'Thành công';
  }

  async getSoldProduct(reqData: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/exportPlan');
    const refAuthentication = db.ref('/Authentication');
    const refWarehouse = db.ref('/warehouse/' + reqData.warehouseId);
    const typeAndColorKey = [];
    const typeAndColorValue = [];
    const typeAndColorRef = db.ref('/TypeAndColor');

    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };
      const warehouseGoods = [];

      await refWarehouse.once('value', async function (snapshot) {
        if (snapshot.val().goods) {
          const productKey = [];
          let count = 0;
          for (const key in snapshot.val().goods) {
            productKey.push(key);
          }
          for (const value of Object.values(snapshot.val().goods)) {
            if (value) {
              let val: any;
              let countTemp = 0;
              for (val of Object.values(value)) {
                if (val.status === 'đã bán') {
                  countTemp++;
                }
              }
              warehouseGoods.push({
                typeAndColor: findTypeAndColor(productKey[count]),
                number: countTemp,
              });
            }
            count++;
          }
        }
      });

      return warehouseGoods;
    }
    return 'Không hợp lệ';
  }

  async getNotifications(data: any, res: any): Promise<any> {
    const receiverId = data.userId;
    const warehouseId = await this.getKhoId(receiverId);
    const ref = db.ref('/Notification');
    const result = [];
    await ref.once('value', function (snapshot) {
      if (snapshot.val()) {
        for (let j = 0; j < warehouseId.length; j++) {
          for (let i = 0; i < snapshot.val().length; i++) {
            if (
              snapshot.val()[i] &&
              snapshot.val()[i].warehouseId == warehouseId[j]
            ) {
              result.push({
                content: snapshot.val()[i].content,
                read: snapshot.val()[i].read,
                time: snapshot.val()[i].time,
                number: i,
              });
            }
          }
        }
      } else return 'None';
    });

    return res.status(HttpStatus.OK).json({
      message: 'Thành công',
      statusCode: '200',
      data: result,
    });
  }

  async getStatistic(data: any, res: any) {
    const refAuthentication = db.ref('/Authentication');
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(data).username &&
        val.token === Object(data).token
      ) {
        isValid = true;
      }
    });

    if (isValid) {
      const typeAndColorKey = [];
      const typeAndColorValue = [];
      const typeAndColorRef = db.ref('/TypeAndColor');
      await typeAndColorRef.once('value', function (snapshot) {
        let count = 0;
        for (const key in snapshot.val()) {
          typeAndColorKey.push(key);
        }
        for (const value of snapshot.val()) {
          if (value !== undefined && value != null) {
            typeAndColorValue.push({
              id: typeAndColorKey[count],
              type: value.type,
              color: value.color,
            });
            count = count + 1;
          }
        }
      });
      const findTypeAndColor = (id: any) => {
        for (const value of typeAndColorValue) {
          if (id == value.id) {
            return { type: value.type, color: value.color };
          }
        }
      };
      const refWarehouse = db.ref('/warehouse/' + data.warehouseId + '/goods');
      const result = [];
      const snapshotWarehouse = await refWarehouse.once('value');
      snapshotWarehouse.forEach((child) => {
        const key = child.key;
        const value = child.val();
        const goods = [];

        let maxDateStock = 0;
        let averageDateStock = 0;
        let numberOfProduct = 0;
        for (const item of value) {
          if (item && item.importTime && item.exportTime) {
            const date = item.importTime;
            const year = date.substr(date.length - 4);
            const month = date[10] + date[11];
            const hour = date[0] + date[1];
            const day = date[7] + date[8];
            const minute = date[3] + date[4];
            const newDate = new Date(
              Number(year),
              Number(month) - 1,
              Number(day),
              Number(hour),
              Number(minute),
            );
            let today = new Date();
            if (item.exportTime != 'none') {
              const edate = item.exportTime;
              const eyear = edate.substr(date.length - 4);
              const emonth = edate[10] + edate[11];
              const ehour = edate[0] + edate[1];
              const eday = edate[7] + edate[8];
              const eminute = edate[3] + edate[4];
              const enewDate = new Date(
                Number(eyear),
                Number(emonth) - 1,
                Number(eday),
                Number(ehour),
                Number(eminute),
              );
              today = enewDate;
            }

            let difference = today.getTime() - newDate.getTime();
            difference = Math.ceil(difference / (1000 * 3600 * 24));

            if (difference < 0) {
              difference = Math.abs(difference);
            }
            averageDateStock = averageDateStock + difference;
            numberOfProduct++;
            console.log(difference, averageDateStock, numberOfProduct);
            if (difference > maxDateStock) {
              maxDateStock = difference;
            }
          }
          if (item && item.status == 'chưa bán') {
            let isHave = true;
            if (goods.length == 0) {
              goods.push({
                importTime: item.importTime,
                lotNumber: String(item.lotNumber),
                number: 1,
                totalLength: Number(item.length),
              });
            } else {
              isHave = goods.some((element) => {
                if (
                  String(element.importTime) == String(item.importTime) &&
                  String(element.lotNumber) == String(item.lotNumber)
                ) {
                  element.number = ++element.number;
                  element.totalLength =
                    Number(element.totalLength) + Number(item.length);
                }
                return (
                  String(element.importTime) == String(item.importTime) &&
                  String(element.lotNumber) == String(item.lotNumber)
                );
              });
            }
            if (isHave == false) {
              goods.push({
                importTime: item.importTime,
                lotNumber: String(item.lotNumber),
                number: 1,
                totalLength: Number(item.length),
              });
            }
          }
        }
        result.push({
          typeAndColor: findTypeAndColor(key),
          maxDateStock: maxDateStock,
          averageDateStock: averageDateStock / numberOfProduct,
          listGoods: goods,
        });
      });

      return res.status(HttpStatus.OK).json({
        message: result,
        statusCode: '200',
      });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized',
        statusCode: '401',
      });
    }
  }
  async changeStatus(data: any) {
    var ref = db.ref('/Notification/' + data.notification);
    await ref.update({
      read: 1,
    });
    return 'success';
  }

  async postNotiWarning(
    isFull: any,
    typeId: any,
    number: any,
    time: any,
    warehouseId: any,
    capacity: any,
  ) {
    let warehousename = '';
    var ref = db.ref('/TypeAndColor');
    var type = [];
    await ref.once('value', function (snapshot) {
      type = snapshot.val();
    });
    ref = db.ref('/warehouse/' + warehouseId);
    await ref.once('value', function (snapshot) {
      warehousename = snapshot.val().name;
    });
    let content = '';
    if (isFull) {
      if (typeId != -1) {
        content =
          'Cảnh báo đầy: Vải loại ' +
          type[typeId].type +
          ', màu ' +
          type[typeId].color +
          ' có ' +
          number +
          ' cây trong kho ' +
          warehousename +
          '. Trong khi sức chứa cho mỗi loại vải và màu sắc là ' +
          capacity +
          ' cây.';
      } else
        content =
          'Cảnh báo đầy: ' +
          warehousename +
          ' có ' +
          number +
          ' cây vải. Trong khi sức chứa của kho là' +
          capacity +
          ' cây.';
    } else if (typeId != -1) {
      content =
        'Cảnh báo thiếu: Vải loại ' +
        type[typeId].type +
        ', màu ' +
        type[typeId].color +
        ' có ' +
        number +
        ' cây trong kho ' +
        warehousename +
        '. Trong khi sức chứa cho mỗi loại vải và màu sắc là ' +
        capacity +
        ' cây.';
    } else
      content =
        'Cảnh báo thiếu: ' +
        warehousename +
        ' có ' +
        number +
        ' cây vải. Trong khi sức chứa của kho là' +
        capacity +
        ' cây.';
    let count = 0;
    ref = db.ref('/Notification');
    await ref.once('value', function (snapshot) {
      if (snapshot.val()) count = snapshot.val().length;
    });
    await ref.child(String(count)).set({
      time: time,
      read: 0,
      content: content,
      warehouseId: warehouseId,
    });
  }

  async postNoti(
    listTypesId: any,
    listFabric: any,
    notiType: any,
    time: any,
    employeeId: any,
    warehouseId: any,
  ) {
    let warehousename = '';
    var ref = db.ref('/TypeAndColor');
    var type = [];
    await ref.once('value', function (snapshot) {
      type = snapshot.val();
    });
    ref = db.ref('/warehouse/' + warehouseId);
    await ref.once('value', function (snapshot) {
      warehousename = snapshot.val().name;
    });
    var content = '';
    ref = db.ref('/user/' + employeeId);
    await ref.once('value', function (snapshot) {
      content += snapshot.val().name;
    });
    if (notiType == 0) {
      //export Noti
      content += ' đã xuất';
    } else content += ' đã nhập'; //import Noti
    let count = listFabric[0].length;
    content =
      content +
      ' ' +
      String(count - 1) +
      ' cây vải ' +
      type[listTypesId[0]].type +
      ' ' +
      type[listTypesId[0]].color;
    for (let i = 1; i < listTypesId.length; i++) {
      let count = listFabric[i].length;
      content =
        content +
        ', ' +
        String(count - 1) +
        ' cây vải ' +
        type[listTypesId[i]].type +
        ' ' +
        type[listTypesId[i]].color;
    }
    content = content + ' ở ' + warehousename;
    ref = db.ref('/Notification');
    count = 1;
    console.log('type ', listTypesId);
    console.log('fabric ', listFabric);
    await ref.once('value', function (snapshot) {
      if (snapshot.val()) count = snapshot.val().length;
    });
    await ref.child(String(count)).set({
      time: time,
      read: 0,
      content: content,
      warehouseId: warehouseId,
    });
  }

  async checkAuthentication(reqData: any): Promise<any> {
    const db = admin.database();
    const refAuthentication = db.ref('/Authentication');
    const isValid = await refAuthentication.once('value', function (snapshot) {
      for (const val of Object.values(snapshot.val())) {
        if (
          Object(val).username === Object(reqData).username &&
          Object(val).token === Object(reqData).token
        ) {
          return true;
        }
      }
      return false;
    });
    return isValid;
  }

  async getFabricInWarehouse(reqData: any): Promise<any> {
    let warehouseId = await this.getKhoId(reqData.userId);
    let ref = db.ref('/warehouse');
    var result = [];
    ref = db.ref('/warehouse/' + String(warehouseId) + '/goods');
    let goodsList = await ref.once('value');
    goodsList.forEach((child) => {
      result.push({ typeAndColorId: child.key });
    });
    console.log(reqData);
    for (let j = 0; j < result.length; j++) {
      ref = db.ref(
        '/warehouse/' +
          String(warehouseId) +
          '/goods/' +
          result[j].typeAndColorId,
      );
      result[j]['listFabric'] = [];
      let fabricList = await ref.once('value');
      fabricList.forEach((child) => {
        result[j]['listFabric'].push({
          fabricId: child.key,
        });
      });
      await ref.once('value', function (snapshot) {
        if (Array.isArray(snapshot.val()))
          for (let k = 0; k < snapshot.val().length; k++) {
            if (snapshot.val()[k] && k - 1 >= 0) {
              result[j]['listFabric'][k - 1]['length'] =
                snapshot.val()[k].length;
              result[j]['listFabric'][k - 1]['lotNumber'] =
                snapshot.val()[k].lotNumber;
              result[j]['listFabric'][k - 1]['status'] =
                snapshot.val()[k].status;
            }
          }
      });
    }
    console.log(result);
    return result;
  }

  async changeCapacity(reqData: any, res: any) {
    const refAuthentication = db.ref('/Authentication');
    const refWarehouse = db.ref('/warehouse');
    let isValid = false;
    const snapshot = await refAuthentication.once('value');
    snapshot.forEach((child) => {
      const val = child.val();
      if (
        val.username === Object(reqData).username &&
        val.token === Object(reqData).token &&
        Object(reqData).role == 'manager'
      ) {
        isValid = true;
      }
    });
    if (isValid) {
      const warehouseRef = refWarehouse.child(Object(reqData).warehouseId);
      warehouseRef.update({
        capacityEachType: Object(reqData).eachType,
        capacityWarehouse: Object(reqData).warehouse,
      });
      return res.status(HttpStatus.OK).json({
        message: {
          capacityEachType: Object(reqData).eachType,
          capacityWarehouse: Object(reqData).warehouse,
        },
        statusCode: '200',
      });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized',
      data: reqData,
      statusCode: '401',
    });
  }
}
