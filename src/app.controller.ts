import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello?')
  getHello(@Query() data): Promise<any> {
    console.log(data);
    return this.appService.getHello();
  }

  @Post('/getKhoInfoWorkAt')
  async getKhoInfo(@Req() data): Promise<any> {
    // console.log('post data:', data.body);
    var list = await this.appService.getKhoId(data.body.userId);
    return this.appService.getKhoInfo(list);
  }

  @Post('/getGoodsInfo')
  async getGoodsInfo(@Req() data): Promise<any> {
    var list = await this.appService.getKhoId(data.body.userId);
    return this.appService.getGoodsInfo(list);
  }

  @Post('/getExportPlans')
  async getExportPlans(@Req() data): Promise<any> {
    var list = await this.appService.getKhoId(data.body.userId);
    return this.appService.getExportPlans(list);
  }

  @Post('/getOrders')
  async getOrders(@Req() data): Promise<any> {
    // console.log('data');
    var list = await this.appService.getKhoId(data.body.userId);
    return this.appService.getOrders(list);
  }

  @Post('/getExportPlan')
  async getExportPlan(@Req() data): Promise<any> {
    var list = await this.appService.getKhoId(data.body.userId);
    return this.appService.getExportPlans(list);
  }

  @Post('/postImport')
  async postImport(@Req() data): Promise<any> {
    // console.log(data.body);
    return this.appService.postImport(data.body);
  }

  @Post('/postExport')
  async postExport(@Req() data): Promise<any> {
    // console.log(data.body);
    return this.appService.postExport(data.body);
  }
  @Post('/checkuser')
  postHello(@Req() data): any {
    // console.log('post data:', data.body);
    return this.appService.checkLoginUser(data.body);
  }
  @Post('/getwarehouse')
  getWarehouse(@Req() data): any {
    console.log(data);
    return this.appService.getWarehouse(data.body);
  }

  @Get('/getprovider')
  getProvider(): any {
    return this.appService.getProvider();
  }
  @Get('/getCustomer')
  getCustomer(): any {
    return this.appService.getCustomer();
  }

  @Get('/getAllKho')
  getAllKho(): any {
    return this.appService.getAllKho();
  }
  @Post('/getTypeAndColor')
  getTypeAndColor(@Req() data): any {
    return this.appService.getTypeAndColor(data.body);
  }

  @Post('/postOrder')
  addNewOrder(@Req() data): any {
    console.log(data.body);
    return this.appService.postOrder(data.body);
  }

  @Post('/postExportPlan')
  addNewExportPlan(@Req() data): any {
    console.log(data.body);
    return this.appService.postExportPlan(data.body);
  }

  @Post('/getProductList')
  getProductList(@Req() data): any {
    return this.appService.getProductList(data.body);
  }

  @Post('/getProductNumber')
  getProductNumber(@Req() data): any {
    return this.appService.getProductNumber(data.body);
  }
}
