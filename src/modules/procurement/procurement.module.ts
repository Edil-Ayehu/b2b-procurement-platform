import { Module } from '@nestjs/common';
import { ProcurementController } from './procurement.controller';
import { ProcurementService } from './procurement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementRequest } from './entities/procurement-request.entity';
import { ProcurementRequestItem } from './entities/procurement-request-item.entity';
import { OrganizationPermissionGuard } from '../organizations/guards/organization-permission.guard';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        ProcurementRequest, 
        ProcurementRequestItem
    ]),
    OrganizationsModule,
  ],
  controllers: [ProcurementController],
  providers: [
    ProcurementService,
    OrganizationPermissionGuard,
],
  exports: []
})
export class ProcurementModule {}
