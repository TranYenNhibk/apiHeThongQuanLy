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
  postHello(@Req() data, @Res() res): any {
    // console.log('post data:', data.body);
    return this.appService.checkLoginUser(data.body, res);
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
  addNewOrder(@Req() data, @Res() res): any {
    return this.appService.postOrder(data.body, res);
  }

  @Post('/checkCapacityOrder')
  checkCapacityOrder(@Req() data, @Res() res): any {
    return this.appService.checkCapacityOrder(data.body, res);
  }

  @Post('/getOrder')
  getOrder(@Req() data, @Res() res): any {
    return this.appService.getOrder(data.body, res);
  }

  @Post('/getUnapprovalOrder')
  getUnpprovalOrder(@Req() data, @Res() res): any {
    return this.appService.getUnapprovalOrder(data.body, res);
  }

  @Post('/getUnapprovalExportPlan')
  getUnpprovalExportPlan(@Req() data, @Res() res): any {
    return this.appService.getUnapprovalExportPlan(data.body, res);
  }

  @Post('/approveOrder')
  approveOrder(@Req() data, @Res() res): any {
    return this.appService.approveOrder(data.body, res);
  }

  @Post('/disapproveOrder')
  disapproveOrder(@Req() data, @Res() res): any {
    return this.appService.disapproveOrder(data.body, res);
  }

  @Post('/approveExportPlan')
  approveExportPlan(@Req() data, @Res() res): any {
    return this.appService.approveExportPlan(data.body, res);
  }

  @Post('/disapproveExportPlan')
  disapproveExportPlan(@Req() data, @Res() res): any {
    return this.appService.disapproveExportPlan(data.body, res);
  }

  @Post('/getImport')
  getImport(@Req() data, @Res() res): any {
    return this.appService.getImport(data.body, res);
  }

  @Post('/getExport')
  getExport(@Req() data, @Res() res): any {
    return this.appService.getExport(data.body, res);
  }

  @Post('/getManagerExportPlans')
  getManagerExportPlans(@Req() data, @Res() res): any {
    return this.appService.getManagerExportPlans(data.body, res);
  }
  @Post('/postExportPlan')
  addNewExportPlan(@Req() data, @Res() res): any {
    console.log(data.body);
    return this.appService.postExportPlan(data.body, res);
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
  getNotifications(@Req() data, @Res() res): any {
    return this.appService.getNotifications(data.body, res);
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
  @Post('/getFabricInWarehouses')
  getFabricInWarehouse(@Req() data): any {
    return this.appService.getFabricInWarehouse(data.body);
  }

  @Post('/changeCapacity')
  changeCapacity(@Req() data, @Res() res): any {
    return this.appService.changeCapacity(data.body, res);
  }

  @Post('/getImported')
  getImported(@Req() data): any {
    return this.appService.getImported(data.body);
  }

  @Post('/getExported')
  getExported(@Req() data): any {
    return this.appService.getExported(data.body);
  }
}
