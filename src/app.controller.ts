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
  async postImport(@Req() data): Promise<any>{
    // console.log(data.body);
    return this.appService.postImport(data.body);
  }

  @Post('/postExport')
  async postExport(@Req() data): Promise<any>{
    // console.log(data.body);
    return this.appService.postExport(data.body);
  }
}
