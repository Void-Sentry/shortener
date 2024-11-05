import { Controller, Delete, Get, Patch } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  list(): string {
    return this.appService.getHello();
  }

  @Patch()
  edit() {

  }

  @Delete()
  destroy() {

  }
}
