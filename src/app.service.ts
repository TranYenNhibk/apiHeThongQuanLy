import { Injectable, Req } from '@nestjs/common';
import { strictEqual } from 'assert';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getHeapSnapshot } from 'v8';
// import { getDatabase } from 'firebase-admin/database';
// import { HttpModule, HttpService } from '@nestjs/axios';

var serviceAccount = require('../quanlykhovai-firebase-adminsdk-nle2y-299312b1b3.json');

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
    // console.log(data);
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
          for (let j = 1; j < snapshot.val()[i].listGoods.length; j++) {
            // console.log('hi')
            listGoods.push({
              typeId: snapshot.val()[i].listGoods[j].typeId,
              color: TypeAndColor[snapshot.val()[i].listGoods[j].typeId].color,
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
    await ref.child(String(importId)).child('listGoods').set(listGoods);
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
        });
      }
    }
    return 'Tạo phiếu nhập hàng thành công';
  }

  async postExport(data: any) {
    // console.log(data.list);
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
          console.log(
            typeof snapshot.val()[listFabricId[i][1].fabricId].status,
          );
          console.log(typeof 'đã bán');
          console.log(
            snapshot.val()[listFabricId[i][1].fabricId].status === 'đã bán',
          );
          if (snapshot.val()[listFabricId[i][j].fabricId].status === 'đã bán') {
            stop = 1;
            break;
          }
        }
      });
      if(stop) break;
    }
    console.log('false');
    if (!stop) {
      for (let i = 0; i < listType.length; i++) {
        ref = db.ref('/warehouse/' + warehouseId + '/goods/' + listType[i]);
        for (let j = 1; j < listFabricId[i].length; j++) {
          await ref.child(listFabricId[i][j].fabricId).update({
            status: 'đã bán',
          });
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
      return 'Tạo phiếu xuất hàng thành công';
    }
    else return 'Tạo phiếu xuất thất bại! Bạn đã nhập mã cây vải không còn lưu trữ trong kho (đã bán)! Vui lòng nhập lại!';
  }
}
