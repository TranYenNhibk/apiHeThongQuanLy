import { Injectable, Req } from '@nestjs/common';
import { strictEqual } from 'assert';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { ConnectableObservable } from 'rxjs';
import { getHeapSnapshot } from 'v8';
// import { getDatabase } from 'firebase-admin/database';
// import { HttpModule, HttpService } from '@nestjs/axios';

const serviceAccount = require('../quanlykhovai-firebase-adminsdk-nle2y-299312b1b3.json');

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
    // ref.once('value', function (snapshot) {
    //   console.log('vals', snapshot.val());
    //   console.log('keys', snapshot.key);
    // });
    return 'Hello';
  }

  async getKhoId(data: any) {
    var ref_str = '/user/' + data + '/workAt';
    const ref = db.ref(ref_str);
    var listKhoId = [];
    console.log(data);
    await ref.once('value', function (snapshot) {
      for (let i = 0; i < snapshot.val().length; i++) {
        if (snapshot.val()[i] != null) listKhoId.push(snapshot.val()[i].khoId);
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
    // console.log(data);
    var ref = db.ref('/import');
    var importId = 1;
    await ref.once('value', function (snapshot) {
      importId = snapshot.val().length;
    });
    var warehouseId = await this.getKhoId(data.importEmployee);
    // await ref.child(String(importId)).set({
    //   orderId: data.orderId,
    //   driver: data.driver,
    //   importEmployee: data.importEmployee,
    //   time: data.time,
    //   note: data.note,
    //   warehouseId: warehouseId[0],
    // });
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
            lotNumber: data.list[i].number,
          },
        ]);
      } else {
        listFabric[id].push({
          length: data.list[i].length,
          lotNumber: data.list[i].number,
        });
      }
    }
    // console.log('listType: ', listType)
    // console.log('listFabric: ', listFabric)
    var listGoods = {};
    for (let i = 0; i < listType.length; i++) {
      listGoods[listType[i]] = listFabric[i];
    }
    // await ref.child(String(importId)).child('listGoods').set(listGoods);
    var count = 0;
    for (let i = 0; i < listType.length; i++) {
      count = 0;
      ref = db.ref('/warehouse/' + warehouseId[0] + '/goods/' + listType[i]);
      await ref.once('value', async function (snapshot) {
        if (snapshot.val()) count = snapshot.val().length - 1;
        else count = 0;
      });
      for (let j = 1; j < listFabric[i].length; j++) {
        // await ref.child(String(count + j)).set({
        //   length: listFabric[i][j].length,
        //   lotNumber: listFabric[i][j].lotNumber,
        //   status: 'chưa bán',
        // });
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
    return 'Tạo phiếu nhập hàng thành công';
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
      return 'Tạo phiếu xuất hàng thành công';
    } else
      return 'Tạo phiếu xuất thất bại! Bạn đã nhập mã cây vải không còn lưu trữ trong kho (đã bán)! Vui lòng nhập lại!';
  }

  async checkLoginUser(logreq: object): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/user');
    const valArr = [];
    for (const val of Object.values(logreq)) {
      valArr.push(val);
    }
    let found = 0;
    let reqdata: object;
    await ref.once('value', function (snapshot) {
      // for (const user of Object.values(snapshot.val())) {
      //   if (
      //     Object(user).username === valArr[0] &&
      //     Object(user).password === valArr[1]
      //   ) {
      //     console.log('hello');
      //     found = 1;
      //     reqdata = Object(user);
      //     break;
      //   }
      // }
      for (let i = 1; i < snapshot.val().length; i++) {
        if (
          snapshot.val()[i].username === valArr[0] &&
          snapshot.val()[i].password === valArr[1]
        ) {
          found = 1;
          reqdata = {
            userId: i,
            username: snapshot.val()[i].username,
            name: snapshot.val()[i].name,
            password: snapshot.val()[i].password,
            phone: snapshot.val()[i].phone,
            role: snapshot.val()[i].role,
            sex: snapshot.val()[i].sex,
            workAt: snapshot.val()[i].workAt,
          };
          break;
        }
      }
    });
    if (found) return reqdata;
    return 'No found';
  }

  async getWarehouse(userInfo: object): Promise<any> {
    console.log('user info:', userInfo);
    const db = admin.database();

    const userRef = db.ref('/user');
    const khoArray = [];
    const reqdata = [];

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
        reqdata.push({
          key: khoid,
          name: 'Kho ' + khoid,
          address: snapshot.val().address,
          square: snapshot.val().square,
          status: snapshot.val().status,
        });
      });
    }
    //console.log('getWareHouse return data:', reqdata);
    return reqdata;
  }

  async getCustomer(): Promise<any> {
    const db = admin.database();
    const customerList = [];
    const customerRef = db.ref('/customer');
    await customerRef.once('value', function (snapshot) {
      for (const value of Object.values(snapshot.val())) {
        customerList.push(Object(value));
      }
    });
    return customerList;
  }

  async getWarehouseTypeAndColor(): Promise<any> {
    const id = 1;
    const username = 'kdat0310';
    const db = admin.database();
    const warehouseKey = [];
    const warehouseGoods = [];
    const warehouseRef = db.ref('/warehouse');
    const userRef = db.ref('/user');
    const typeAndColorKey = [];
    const typeAndColorValue = [];
    const keyList = [];
    const khoList = [];
    let index = 0;
    const typeAndColorRef = db.ref('/TypeAndColor');
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
    const findTypeAndColor = async (id: any) => {
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
            productKey.push(key);
          }
          for (const value of Object.values(snapshot.val().goods)) {
            warehouseGoods.push({
              listGoods: value,
              typeAndColor: await findTypeAndColor(productKey[count]),
              warehouseId: val,
            });
            count++;
          }
        }
      });
    }

    return warehouseGoods;
  }
  async getAllKho(): Promise<any> {
    const db = admin.database();
    const khoList = [];
    const keyList = [];
    let temp = 0;
    const customerRef = db.ref('/warehouse');
    await customerRef.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        keyList.push(key);
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

  async getAllKhoInformation(): Promise<any> {
    const db = admin.database();
    const returnVal = [];
    const keyList = [];
    let temp = 0;
    const refWarehouse = db.ref('/warehouse');
    await refWarehouse.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        keyList.push(key);
      }
      for (const value of Object.values(snapshot.val())) {
        returnVal.push({
          address: Object(value).address,
          status: Object(value).status,
          key: keyList[temp],
          name: 'Kho ' + keyList[temp],
        });
        temp++;
      }
    });
    return returnVal;
  }

  async getProvider(): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/Provider');
    const resdata = [];
    console.log(typeof resdata);
    await ref.once('value', function (snapshot) {
      for (const provider of snapshot.val()) {
        resdata.push(provider);
      }
    });
    console.log(typeof resdata);
    return resdata;
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
  async getProductNumber(khoId: any): Promise<any> {
    const db = admin.database();
    const resData = [];
    const goodKey = [];
    const countList = [];
    const returnData = [];
    let refTypeAndColor = db.ref('/TypeAndColor');
    let temp = 0;
    const refWarehouse = db.ref('/warehouse');
    const keyList = [];
    await refWarehouse.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        keyList.push(key);
      }
      for (const value of Object.values(snapshot.val())) {
        if (khoId.id == keyList[temp]) {
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

  async postOrder(orderInfo: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/order');
    const refProvider = db.ref('/Provider');
    const refUser = db.ref('/user');
    const refWarehouse = db.ref('/warehouse');
    let refTypeAndColor = db.ref('/TypeAndColor');
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
    const addNewType = async () => {
      for (const element of Object(orderInfo).listGoods) {
        if (element != null && element != undefined) {
          await refTypeAndColor.once('value', function (snapshot) {
            typeNumber = snapshot.numChildren();
            for (const value of Object.values(snapshot.val())) {
              if (
                Object(value).type === Object(element).kind &&
                Object(value).color === Object(element).color
              ) {
                available = 1;
                break;
              }
            }
            console.log('available:', available);
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
        await refWarehouse.once('value', function (snapshot) {
          for (const key in snapshot.val()) {
            providerListKey.push(key);
            if (Object(orderInfo).providerName.slice(-1) === key) {
              provId = Number(key);
              break;
            }
          }
        });
      }
    };
    getProviderId();
    await ref.once('value', function (snapshot) {
      childNumber = snapshot.numChildren();
    });
    await ref.child(String(childNumber + 1)).set({
      providerId: Number(provId),
      manageId: Number(userId),
      reason: Object(orderInfo).reason,
      time: Object(orderInfo).time,
      warehouseId: Number(Object(orderInfo).khoName.slice(-1)),
      listGoods: listOfGood,
    });
    console.log(orderInfo);
    return 'Thành công';
  }
  async getOrder(managerUsername: any): Promise<any> {
    const username = 'kdat0310';
    const db = admin.database();
    const userRef = db.ref('/user');
    const orderRef = db.ref('/order');
    const providerRef = db.ref('/Provider');
    const keyList = [];
    const orderList = [];
    const providerKey = [];
    let index = 0;
    const providerList = [];
    await userRef.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        keyList.push(key);
      }
    });
    await userRef.once('value', function (snapshot) {
      for (const value of Object(snapshot.val())) {
        if (value != null && value != undefined) {
          if (managerUsername.username === Object(value).username) {
            break;
          }
          index++;
        }
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
        console.log('3', count, 'arr', typeAndColorKey[count]);
      }
    });
    console.log(typeAndColorValue);
    const findTypeAndColor = async (id: any) => {
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
        for (const value of Object(cloneArr)) {
          if (value != null && value != undefined) {
            if (keyList[index] == Object(value).manageId) {
              const tempArray = Object(value).listGoods.map(
                (item: any) => item,
              );

              const handleData = async () => {
                const handleAdd = async () => {
                  for (const temp of Object(tempArray)) {
                    if (temp != undefined && temp != null) {
                      temp.typeAndColor = await findTypeAndColor(temp.typeId);
                    }
                  }
                };
                await handleAdd();
              };
              handleData();

              if (Object(value).reason === 'Mua hàng') {
                console.log('time');
                console.log(Object(value.listGoods));
                orderList.push({
                  listGoods: Object(value).listGoods,
                  reason: Object(value).reason,
                  manageId: Object(value).manageId,
                  providerId: Object(value).providerId,
                  providerName: findProviderName(Object(value).providerId),
                  time: Object(value).time,
                  warehouseId: Object(value).warehouseId,
                });
              } else if (Object(value.reason) === 'Chuyển kho') {
                orderList.push({
                  listGoods: Object(value).listGoods,
                  reason: Object(value).reason,
                  manageId: Object(value).manageId,
                  providerId: Object(value).providerId,
                  providerName: 'Kho ' + Object(value).providerId,
                  time: Object(value).time,
                  warehouseId: Object(value).warehouseId,
                });
              }
            }
          }
        }
      });
    };
    await handleData();

    return orderList;
  }
  // lấy danh sách kế hoạch xuất theo của quản lý
  async getManagerExportPlans(): Promise<any> {
    const username = 'kdat0310';
    const db = admin.database();
    const userRef = db.ref('/user');
    const exportPlanRef = db.ref('/exportPlan');
    const customerRef = db.ref('/customer');
    const keyList = [];
    const exportPlanList = [];
    const customerKey = [];
    let index = 0;
    const customerList = [];
    await userRef.once('value', function (snapshot) {
      for (const key in snapshot.val()) {
        keyList.push(key);
      }
    });
    await userRef.once('value', function (snapshot) {
      for (const value of Object(snapshot.val())) {
        if (value != null && value != undefined) {
          if (username === Object(value).username) {
            break;
          }
          index++;
        }
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
        console.log('3', count, 'arr', typeAndColorKey[count]);
      }
    });
    console.log(typeAndColorValue);
    const findTypeAndColor = async (id: any) => {
      for (const value of typeAndColorValue) {
        if (id == value.id) {
          return { type: value.type, color: value.color };
        }
      }
    };
    await exportPlanRef.once('value', function (snapshot) {
      for (const value of Object(snapshot.val())) {
        if (value != null && value != undefined) {
          if (keyList[index] == Object(value).manageId) {
            const tempArray = Object(value).listGoods.map((item: any) => item);

            const handleData = async () => {
              const handleAdd = async () => {
                for (const temp of Object(tempArray)) {
                  if (temp != undefined && temp != null) {
                    temp.typeAndColor = await findTypeAndColor(temp.typeId);
                  }
                }
              };
              await handleAdd();
            };
            handleData();
            console.log('reason', value.reason);
            if (Object(value).reason === 'Bán hàng') {
              exportPlanList.push({
                listGoods: Object(value).listGoods,
                reason: Object(value).reason,
                manageId: Object(value).manageId,
                customerId: Object(value).customerId,
                customerName: findcustomerName(Object(value).customerId),
                time: Object(value).time,
                warehouseId: Object(value).warehouseId,
              });
            } else if (Object(value).reason === 'Chuyển kho') {
              exportPlanList.push({
                listGoods: Object(value).listGoods,
                reason: Object(value).reason,
                manageId: Object(value).manageId,
                customerId: Object(value).customerId,
                customerName: 'Kho ' + Object(value).customerId,
                time: Object(value).time,
                warehouseId: Object(value).warehouseId,
              });
            }
          }
        }
      }
    });
    return exportPlanList;
  }
  // Phiếu kế hoạch xuất hàng
  async postExportPlan(exportPlanInfo: any): Promise<any> {
    const db = admin.database();
    const ref = db.ref('/exportPlan');
    const refCustomer = db.ref('/customer');
    const refUser = db.ref('/user');
    const refWarehouse = db.ref('/warehouse');
    let refTypeAndColor = db.ref('/TypeAndColor');
    const userListKey = [];
    const customerListKey = [];
    const typeListKey = [];
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
    // await ref.once('value', function (snapshot) {
    //   for (const key in snapshot.val()) {
    //     console.log(key);
    //   }
    // });
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
        await refWarehouse.once('value', function (snapshot) {
          for (const key in snapshot.val()) {
            customerListKey.push(key);
            if (Object(exportPlanInfo).customerName.slice(-1) === key) {
              customerId = Number(key);
              break;
            }
          }
        });
      }
    };
    getCustomerId();

    await ref.once('value', function (snapshot) {
      childNumber = snapshot.numChildren();
    });
    await ref.child(String(childNumber + 1)).set({
      customerId: Number(customerId),
      manageId: Number(userId),
      reason: Object(exportPlanInfo).reason,
      time: Object(exportPlanInfo).time,
      warehouseId: Number(Object(exportPlanInfo).khoName.slice(-1)),
      listGoods: listOfGood,
    });
    return 'Thành công';
  }
  async postNewUser(newUserInformation: any): Promise<any> {
    const db = admin.database();
    const workAtList = [];
    let childNumber = 0;
    const refUser = db.ref('/user');
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
      sex: newUserInformation.sex,
      username: newUserInformation.username,
      workAt: workAtList,
    });
    console.log(workAtList);
    return 'Thành công';
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
  async getNotifications(data: any): Promise<any> {
    var receiverId = data.userId;
    var warehouseId = await this.getKhoId(receiverId);
    var ref = db.ref('/Notification');
    var result = [];
    await ref.once('value', function (snapshot) {
      if (snapshot.val())
        for (let j = 0; j < warehouseId.length; j++)
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
      else return 'None';
    });
    console.log('test ', warehouseId);
    return result;
  }

  async changeStatus(data: any) {
    var ref = db.ref('/Notification/' + data.notification);
    await ref.update({
      read: 1,
    });
    return 'success';
  }

  async postNoti(
    listTypesId: any,
    listFabric: any,
    notiType: any,
    time: any,
    employeeId: any,
    warehouseId: any,
  ) {
    var ref = db.ref('/TypeAndColor');
    var type = [];
    await ref.once('value', function (snapshot) {
      type = snapshot.val();
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
    content = content + ' ở kho ' + String(warehouseId);
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
}
