import { Module } from '@nestjs/common';
import { SupplierCategoriesController } from './controllers/supplier-categories.controller';
import { SupplierContactsController } from './controllers/supplier-contacts.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { SupplierCategoriesService } from './services/supplier-categories.service';
import { SupplierContactsService } from './services/supplier-contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierContact } from './entities/supplier-contact.entity';
import { SupplierCategory } from './entities/supplier-category.entity';
import { SupplierService } from './services/supplier.service';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Supplier, 
            SupplierContact, 
            SupplierCategory
        ]),
        OrganizationsModule
    ],
    controllers: [
        SupplierCategoriesController,
        SupplierContactsController,
        SuppliersController,
    ],
    providers: [
        SupplierCategoriesService,
        SupplierContactsService,
        SupplierService,
    ],

    exports: [
        SupplierService,
        SupplierCategoriesService,
        SupplierContactsService,
    ],
})
export class SuppliersModule {

}
