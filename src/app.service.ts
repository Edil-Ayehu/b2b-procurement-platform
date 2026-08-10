import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'B2B Procurement Platform API is running successfully!';
  }
}
