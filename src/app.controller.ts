import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
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
    var isValid = await this.appService.checkAuthentication(data.body);
    if (isValid) {
      var list = await this.appService.getKhoId(data.body.userId);
      return this.appService.getExportPlans(list);
    } else return 'Không hợp lệ';
  }

  @Post('/getOrders')
  async getOrders(@Req() data): Promise<any> {
    var isValid = await this.appService.checkAuthentication(data.body);
    if (isValid) {
      var list = await this.appService.getKhoId(data.body.userId);
      return this.appService.getOrders(list);
    } else return 'Không hợp lệ';
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

  @Post('/logout')
  logOutUser(@Req() data): any {
    // console.log('post data:', data.body);
    return this.appService.logOutUser(data.body);
  }

  @Get('/getwarehouse')
  getWarehouse(@Query() data, @Res() res): any {
    return this.appService.getWarehouse(data, res);
  }

  @Post('/getprovider')
  getProvider(@Req() data): any {
    return this.appService.getProvider(data.body);
  }

  @Post('/getCustomer')
  getCustomer(@Req() data): any {
    return this.appService.getCustomer(data.body);
  }

  @Get('/getAllKho')
  getAllKho(): any {
    return this.appService.getAllKho();
  }

  @Post('/getWarehouseTypeAndColor')
  getWarehouseTypeAndColor(@Req() data): any {
    return this.appService.getWarehouseTypeAndColor(data.body);
  }
  @Post('/getTypeAndColor')
  getTypeAndColor(@Req() data): any {
    return this.appService.getTypeAndColor(data.body);
  }
  @Get('/getAllTypeAndColor')
  getAllTypeAndColor(): any {
    return this.appService.getAllTypeAndColor();
  }
  @Post('/postOrder')
  addNewOrder(@Req() data): any {
    return this.appService.postOrder(data.body);
  }

  @Post('/checkCapacityOrder')
  checkCapacityOrder(@Req() data, @Res() res): any {
    return this.appService.checkCapacityOrder(data.body, res);
  }

  @Post('/getOrder')
  getOrder(@Req() data): any {
    return this.appService.getOrder(data.body);
  }

  @Post('/getImport')
  getImport(@Req() data): any {
    return this.appService.getImport(data.body);
  }

  @Post('/getExport')
  getExport(@Req() data): any {
    return this.appService.getExport(data.body);
  }

  @Post('/getManagerExportPlans')
  getManagerExportPlans(@Req() data): any {
    return this.appService.getManagerExportPlans(data.body);
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

  @Post('/getAllKhoInformation')
  getAllKhoInformation(@Req() data): any {
    return this.appService.getAllKhoInformation(data.body);
  }

  @Get('/getAllUser')
  getAllUser(): any {
    return this.appService.getAllUser();
  }
  @Post('/postNewUser')
  postNewUser(@Req() data, @Res() Response): any {
    return this.appService.postNewUser(data.body, Response);
  }
  @Post('/changeUserInfor')
  changeUserInfor(@Req() data): any {
    return this.appService.changeUserInfor(data.body);
  }
  @Post('/getNotifications')
  getNotifications(@Req() data): any {
    return this.appService.getNotifications(data.body);
  }

  @Post('/changeStatus')
  changeStatus(@Req() data): any {
    return this.appService.changeStatus(data.body);
  }

  @Post('/getSoldProduct')
  getSoldProduct(@Req() data): any {
    return this.appService.getSoldProduct(data.body);
  }

  @Post('/getTotalProductNumberAndLength')
  getTotalProductNumberAndLength(@Req() data): any {
    return this.appService.getTotalProductNumberAndLength(data.body);
  }

  @Post('/postNewCustomer')
  postNewCustomer(@Req() data, @Res() res): any {
    return this.appService.postNewCustomer(data.body, res);
  }

  @Post('/postNewProvider')
  postNewProvider(@Req() data, @Res() res): any {
    return this.appService.postNewProvider(data.body, res);
  }

  @Post('/postNewWarehouse')
  postNewWarehouse(@Req() data, @Res() res): any {
    return this.appService.postNewWarehouse(data.body, res);
  }

  @Post('/getStatistic')
  getStatistic(@Req() data, @Res() res): any {
    return this.appService.getStatistic(data.body, res);
  }
}
